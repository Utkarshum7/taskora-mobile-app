import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

/**
 * Single place that turns every thrown error — Nest HttpExceptions,
 * Mongoose validation/cast errors, MongoDB duplicate-key errors, and
 * anything unexpected — into one consistent JSON error shape:
 *
 *   { statusCode, message, error, path, timestamp }
 *
 * Without this, a raw Mongoose CastError or a Mongo E11000 duplicate-key
 * error would otherwise leak as an unhandled 500 with an internal stack
 * trace instead of a clean, predictable 400/409 the mobile client can
 * branch on.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.resolve(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // Only log the full detail for errors we didn't anticipate.
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): {
    statusCode: number;
    message: string | string[];
    error: string;
  } {
    // Standard Nest exceptions (BadRequestException, UnauthorizedException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        return { statusCode: status, message: body, error: exception.name };
      }
      const bodyObj = body as Record<string, unknown>;
      return {
        statusCode: status,
        message: (bodyObj.message as string | string[]) ?? exception.message,
        error: (bodyObj.error as string) ?? exception.name,
      };
    }

    // Mongoose failed a schema validation rule (e.g. required field missing).
    if (exception instanceof MongooseError.ValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: Object.values(exception.errors).map((e) => e.message),
        error: 'Bad Request',
      };
    }

    // Mongoose couldn't cast a value to the expected type — most commonly
    // an invalid ObjectId string passed as a route param.
    if (exception instanceof MongooseError.CastError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid value for field "${exception.path}"`,
        error: 'Bad Request',
      };
    }

    // Raw MongoDB duplicate-key error (unique index violation), e.g. email.
    if (this.isMongoDuplicateKeyError(exception)) {
      const field = Object.keys(exception.keyPattern ?? {})[0] ?? 'field';
      return {
        statusCode: HttpStatus.CONFLICT,
        message: `${field} already in use`,
        error: 'Conflict',
      };
    }

    // Anything else is unexpected — treat as an internal server error.
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private isMongoDuplicateKeyError(
    exception: unknown,
  ): exception is { code: number; keyPattern?: Record<string, unknown> } {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as { code: unknown }).code === 11000
    );
  }
}
