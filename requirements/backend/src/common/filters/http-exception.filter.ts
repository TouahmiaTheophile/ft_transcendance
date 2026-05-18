import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { createErrorResponse } from '../errors/create-error-response';
import { normalizeError } from '../errors/normalize-error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const error = normalizeError(exception);

    return response.status(error.statusCode).json(
      createErrorResponse({
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
        details: error.details,
        path: request.url,
      }),
    );
  }
}