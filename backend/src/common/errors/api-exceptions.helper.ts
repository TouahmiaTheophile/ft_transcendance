import { ApiException } from './api.exception';

export const ApiErrors = {
  unauthorized(message?: string) {
    return new ApiException({
      code: 'UNAUTHORIZED',
      message,
    });
  },

  forbidden(message?: string) {
    return new ApiException({
      code: 'FORBIDDEN',
      message,
    });
  },

  notFound(message?: string) {
    return new ApiException({
      code: 'NOT_FOUND',
      message,
    });
  },

  badRequest(message?: string) {
    return new ApiException({
      code: 'BAD_REQUEST',
      message,
    });
  },
};