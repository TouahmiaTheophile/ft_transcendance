import { ErrorCode } from './error-codes';
import { APIErrorResponse } from './api-error-response.interface';

type CreateErrorResponseParams = {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: any;
  path: string;
};

export function createErrorResponse(
  params: CreateErrorResponseParams,
): APIErrorResponse {
  return {
    statusCode: params.statusCode,
    code: params.code,
    message: params.message,
    details: params.details,
    timestamp: new Date().toISOString(),
    path: params.path,
  };
}