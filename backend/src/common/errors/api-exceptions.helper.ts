import { ApiException } from './api.exception';

export const ApiErrors = {
  unauthorized(message?: string) {
    return new ApiException({
      code: 'UNAUTHORIZED',
      statusCode: 401,
      message: message ?? 'Unauthorized',
      details: null,
    });
  },

  forbidden(message?: string) {
    return new ApiException({
      code: 'FORBIDDEN',
      statusCode: 403,
      message: message ?? 'Forbidden',
      details: null,
    });
  },

  notFound(message?: string) {
    return new ApiException({
      code: 'NOT_FOUND',
      statusCode: 404,
      message: message ?? 'Not found',
      details: null,
    });
  },

  badRequest(message?: string) {
    return new ApiException({
      code: 'BAD_REQUEST',
      statusCode: 400,
      message: message ?? 'Bad request',
      details: null,
    });
  },

  conflict(message?: string) {
    return new ApiException({
      code: 'CONFLICT',
      statusCode: 409,
      message: message ?? 'Conflict',
      details: null,
    });
  },
};