import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { validateEnvironment } from './utils/validate-env';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { WsExceptionFilter } from './common/filters/ws-exception.filter';
import { validationExceptionFactory } from './common/validation/validation-exception.factory';
import { expressErrorMiddleware } from './common/middlewares/express-error.middleware';
import cookieParser from 'cookie-parser';
import { corsConfig } from './config/cors.config';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  validateEnvironment();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //For Nginx https connections
  app.set('trust proxy', 1);

  app.enableCors(corsConfig);



  // Allow to deliver static files
  // process.cwd() et non __dirname : users.service.ts ecrit les avatars la, et
  // __dirname depend de la profondeur de dist/ (imbriquee a cause de @shared).
  app.useStaticAssets(join(process.cwd(), 'uploads/avatars'), {
    prefix: '/uploads/avatars',
  });

  app.use(cookieParser());

  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new WsExceptionFilter(),  // Normalizes all WsExceptions across all gateways
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

  await app.listen(process.env.BACKEND_PORT || 3000, '0.0.0.0');
  console.log(`Backend running on port ${process.env.BACKEND_PORT || 3000}`);
}
bootstrap();