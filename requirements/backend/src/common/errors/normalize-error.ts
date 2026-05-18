import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ApiException } from './api.exception';
import { ErrorCode } from './error-codes';
import { resolveUniqueConstraintFields } from '../../prisma/prisma-error.utils';

/**
 * Central error normalization layer.
 * ALL errors from Express / Nest / Prisma / ValidationPipe
 * are transformed into a single ApiException format.
 */
export function normalizeError(error: unknown): ApiException {
  // 1. Already normalized error (your domain errors)
  if (error instanceof ApiException) {
    return error;
  }

  // 2. Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return normalizePrismaError(error);
  }

  // 3. Nest HTTP exceptions
  if (error instanceof HttpException) {
    return normalizeHttpException(error);
  }

  // 4. Syntax / body parser errors (Express / Fastify adapter level)
  if (isSyntaxError(error)) {
    return new ApiException({
      code: ErrorCode.BAD_REQUEST,
      message: 'Malformed request syntax',
      statusCode: HttpStatus.BAD_REQUEST,
      details: null,
    });
  }

  console.log("normalizeError: non-handled error: "); // rm tmp debug
  console.log(error); // rm tmp debug

  // 5. Fallback (unknown error)
  return new ApiException({
    code: ErrorCode.INTERNAL_ERROR,
    message: 'Internal server error',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    details: null,
  });
}

/**
 * Prisma normalization
 */
function normalizePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
): ApiException {
  switch (error.code) {
    case 'P2002': {
      return new ApiException({
        code: ErrorCode.UNIQUE_CONSTRAINT,
        message: 'Resource already exists',
        statusCode: HttpStatus.CONFLICT,
        details: {
          fields: resolveUniqueConstraintFields(error),
        },
      });
    }
  }

  return new ApiException({
    code: ErrorCode.INTERNAL_ERROR,
    message: 'Database error',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    details: null,
  });
}

/**
 * Nest HTTP exception normalization
 */
function normalizeHttpException(error: HttpException): ApiException {
  const response = error.getResponse();
  const status = error.getStatus();

  // const message =
  //   typeof response === 'string'
  //     ? response
  //     : (response as any)?.message ?? 'Request error';

  // const message = "HTTP Error";

  return new ApiException({
    code: mapStatusToErrorCode(status),
    message: mapStatusToMessage(status),
    statusCode: status,
    details: null,
  });
}

/**
 * Map HTTP status -> internal error code
 */
function mapStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ErrorCode.BAD_REQUEST;
    case HttpStatus.UNAUTHORIZED:
      return ErrorCode.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return ErrorCode.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return ErrorCode.NOT_FOUND;
    case HttpStatus.CONFLICT:
      return ErrorCode.CONFLICT;
    default:
      return ErrorCode.INTERNAL_ERROR;
  }
}

/**
 * Detect syntax errors from body parsing (Express / adapter level)
 */
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