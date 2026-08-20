import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { validateEnvironment } from './utils/validate-env';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { WsExceptionFilter } from './common/filters/ws-exception.filter';
import { validationExceptionFactory } from './common/validation/validation-exception.factory';
import { expressErrorMiddleware } from './common/middlewares/express-error.middleware';
import cookieParser from 'cookie-parser';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  validateEnvironment();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  app.enableCors({
  origin: [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://localhost',
    'https://127.0.0.1',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
});



  app.useStaticAssets(join(process.cwd(), 'uploads/avatars'), {
    prefix: '/uploads/avatars',
  });

  app.use(cookieParser());

  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new WsExceptionFilter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  app.use(expressErrorMiddleware);

  await app.listen(process.env.BACKEND_PORT || 3000);
  console.log(`Backend running on port ${process.env.BACKEND_PORT || 3000}`);
}
bootstrap();