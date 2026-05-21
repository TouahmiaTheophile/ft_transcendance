// import { ErrorCode } from './error-codes';
import { ErrorCode } from '@shared/errors/error-codes';

type CreateErrorResponseParams = {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
  path: string;
};

export function createErrorResponse(params: CreateErrorResponseParams) {
  return {
    statusCode: params.statusCode,
    code: params.code,
    message: params.message,
    details: params.details,
    timestamp: new Date().toISOString(),
    path: params.path,
  };
}