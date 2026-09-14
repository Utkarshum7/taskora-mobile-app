import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Pulls the authenticated user (attached to the request by JwtStrategy)
 * out of the request so controllers can write:
 *
 *   getSomething(@CurrentUser() user: AuthenticatedUser)
 *
 * instead of reaching into `@Req() req` and casting `req.user` manually
 * everywhere a protected route needs to know who's calling it.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();
    return request.user;
  },
);
