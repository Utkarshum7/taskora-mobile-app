import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Applied with @UseGuards(JwtAuthGuard) on every route that must be
 * authenticated. Delegates to the 'jwt' Passport strategy registered
 * above; overridden here only to guarantee a clean, generic 401 body
 * regardless of *why* validation failed (missing header, malformed
 * token, expired token, unknown user) — callers shouldn't be able to
 * distinguish those cases from the response.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
