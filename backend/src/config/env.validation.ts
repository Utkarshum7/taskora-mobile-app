import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsString,
  validateSync,
} from 'class-validator';

/**
 * Typed shape of the environment variables the app requires.
 * class-validator checks these at startup so a missing/malformed .env
 * fails fast with a clear error instead of surfacing as a confusing
 * runtime error later (e.g. "Cannot read property of undefined").
 */
class EnvironmentVariables {
  @IsNumberString()
  PORT: string;

  @IsString()
  @IsNotEmpty()
  MONGODB_URI: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string;

  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string;
}

/** Used as the `validate` function passed to ConfigModule.forRoot(). */
export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, {
    NODE_ENV: 'development',
    ...config,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Invalid environment configuration: ${messages}`);
  }

  return validatedConfig;
}
