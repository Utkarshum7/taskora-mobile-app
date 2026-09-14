import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { SafeUser } from '../users/interfaces/safe-user.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const SALT_ROUNDS = 12;

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      // Deliberately specific here (unlike login) — at registration time
      // there's no security benefit in hiding that the email is taken,
      // and a clear message is better UX for a signup form.
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create(dto.email, passwordHash);

    return this.buildAuthResult(
      user._id.toString(),
      user.email,
      this.usersService.toSafeUser(user),
    );
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    // Same generic message whether the email doesn't exist or the password
    // is wrong — never let a caller enumerate which registered emails exist.
    const invalidCredentials = () =>
      new UnauthorizedException('Invalid email or password');

    if (!user) {
      throw invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    return this.buildAuthResult(
      user._id.toString(),
      user.email,
      this.usersService.toSafeUser(user),
    );
  }

  private buildAuthResult(
    userId: string,
    email: string,
    user: SafeUser,
  ): AuthResult {
    const payload: JwtPayload = { sub: userId, email };
    return { user, accessToken: this.jwtService.sign(payload) };
  }
}
