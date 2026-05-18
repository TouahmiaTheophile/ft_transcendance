import { ApiException } from './api.exception';
import { ErrorCode } from './error-codes';

export const ApiErrors = {
  unauthorized(message = 'Unauthorized') {
    return new ApiException({
      code: ErrorCode.UNAUTHORIZED,
      message,
      statusCode: 401,
    });
  },

  forbidden(message = 'Forbidden') {
    return new ApiException({
      code: ErrorCode.FORBIDDEN,
      message,
      statusCode: 403,
    });
  },

  notFound(message = 'Not found') {
    return new ApiException({
      code: ErrorCode.NOT_FOUND,
      message,
      statusCode: 404,
    });
  },

  conflict(message = 'Conflict') {
    return new ApiException({
      code: ErrorCode.CONFLICT,
      message,
      statusCode: 409,
    });
  },

  badRequest(message = 'Bad request') {
    return new ApiException({
      code: ErrorCode.BAD_REQUEST,
      message,
      statusCode: 400,
    });
  },

  unique(message = 'Resource already exists', details?: any) {
    return new ApiException({
      code: ErrorCode.UNIQUE_CONSTRAINT,
      message,
      statusCode: 409,
      details,
    });
  },
};