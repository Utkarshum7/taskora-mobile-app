import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/common/filters/all-exceptions.filter';

/**
 * Boots the real AppModule (all real modules/guards/validation wired up —
 * nothing mocked) against an in-memory MongoDB instance, so e2e tests
 * exercise the actual auth + database flow without needing a real
 * MongoDB server (local or Atlas) available in CI or on a dev machine.
 */
export async function createTestApp(): Promise<{
  app: INestApplication;
  mongod: MongoMemoryServer;
}> {
  const mongod = await MongoMemoryServer.create();

  // AppModule's ConfigModule reads these from process.env at compile
  // time, so they must be set before Test.createTestingModule runs.
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test-secret-do-not-use-in-production';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.PORT = '0';
  process.env.NODE_ENV = 'test';

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  // Mirror the global setup in src/main.ts so e2e tests exercise the same
  // validation/error-handling behaviour real requests would hit.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();
  return { app, mongod };
}

export async function closeTestApp(
  app: INestApplication,
  mongod: MongoMemoryServer,
): Promise<void> {
  await app.close();
  await mongod.stop();
}
