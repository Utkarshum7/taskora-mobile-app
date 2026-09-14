import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

/**
 * Validates the Bearer token on every protected request:
 * 1. Extracts + verifies the JWT signature/expiry (handled by passport-jwt
 *    using the options below).
 * 2. `validate()` then runs with the decoded payload — we re-fetch the
 *    user from the DB (rather than trusting the token blindly) so a
 *    deleted user is rejected even if their old token hasn't expired yet.
 * 3. Whatever this returns becomes `req.user`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret', { infer: true })!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return { id: user._id.toString(), email: user.email };
  }
}
