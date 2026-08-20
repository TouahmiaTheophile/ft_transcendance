import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ApiException } from './api.exception';
import { resolveUniqueConstraintFields } from '../../prisma/prisma-error.utils';
import { ErrorCode } from '@shared/errors/error-codes';

export function normalizeError(error: unknown): ApiException {
  if (error instanceof ApiException) {
    return error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return normalizePrismaError(error);
  }

  if (error instanceof HttpException) {
    return normalizeHttpException(error);
  }

  if (isSyntaxError(error)) {
    return new ApiException({
      code: 'BAD_REQUEST',
      message: 'Malformed request syntax',
      statusCode: HttpStatus.BAD_REQUEST,
      details: null,
    });
  }

  console.log("normalizeError: non-handled error: ");
  console.log(error);

  return new ApiException({
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    details: null,
  });
}

function normalizePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
): ApiException {
  switch (error.code) {
    case 'P2002': {
      return new ApiException({
        code: 'UNIQUE_CONSTRAINT',
        message: 'Resource already exists',
        statusCode: HttpStatus.CONFLICT,
        details: {
          fields: resolveUniqueConstraintFields(error),
        },
      });
    }
  }

  return new ApiException({
    code: 'INTERNAL_ERROR',
    message: 'Database error',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    details: null,
  });
}

function normalizeHttpException(error: HttpException): ApiException {
  const response = error.getResponse();
  const status = error.getStatus();

  return new ApiException({
    code: mapStatusToErrorCode(status),
    message: mapStatusToMessage(status),
    statusCode: status,
    details: null,
  });
}

function mapStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    default:
      return 'INTERNAL_ERROR';
  }
}

function isSyntaxError(error: unknown): error is SyntaxError {
  return (
    error instanceof SyntaxError &&
    (error as any).status === 400 &&
    'body' in (error as any)
  );
}

function mapStatusToMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request';

    case 401:
      return 'Authentication required';

    case 403:
      return 'Access denied';

    case 404:
      return 'Resource not found';

    case 409:
      return 'Conflict detected';

    default:
      return 'Request failed';
  }
}