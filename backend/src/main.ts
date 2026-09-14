import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Mobile app runs on a device/emulator on a different origin — allow it
  // to call this API. Wide-open for local development; tighten to a
  // specific origin if this is ever deployed publicly.
  app.enableCors();

  // Validates every incoming request body/query against its DTO:
  // - whitelist: strips properties not declared on the DTO
  // - forbidNonWhitelisted: rejects the request instead of silently
  //   dropping unknown fields (catches client bugs/typos early)
  // - transform: turns plain JSON into the typed DTO class instance
  //   (needed for class-validator decorators like @IsDateString to run,
  //   and so query params like ?priority=high arrive correctly typed)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Normalizes every error response (Nest exceptions, Mongoose errors,
  // Mongo duplicate-key errors, anything unexpected) into one JSON shape.
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Modulus17 To-Do API')
    .setDescription(
      'Backend API for the Modulus17 React Native To-Do assignment',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = configService.get<number>('port', { infer: true }) ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Modulus17 backend listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
