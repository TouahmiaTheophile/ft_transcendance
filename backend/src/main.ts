import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateEnvironment } from './utils/validate-env';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { validationExceptionFactory } from './common/validation/validation-exception.factory';
import { expressErrorMiddleware } from './common/middlewares/express-error.middleware';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  validateEnvironment(); // Ensures MariaDB user credentials do not contain invalid characters if start.sh is bypassed

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // Required to be able to read req.cookies

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(   // DTO Validation auto
  new ValidationPipe({
      transform: true,
      whitelist: true,  // Erases unknown fields (prevents fields with no restrictions to be transmitted)
      forbidNonWhitelisted: true, // Returns an error when unknown fields are present
      stopAtFirstError: true, // Prevent DTO Validation to accumulate errors (@IsDefined -> @IsString)

      exceptionFactory: validationExceptionFactory, // Override ValidationPipe default exceptions to return structured API validation errors
    }),
  );
  app.use(expressErrorMiddleware);
  // const configService = app.get(ConfigService);
  await app.listen(process.env.BACKEND_PORT || 3000);
  console.log('API NestJS with Prisma on port 3000');
}
bootstrap();
