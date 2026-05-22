import { ErrorCode } from '../errors/error-codes';
// import { ErrorCode } from '@shared/errors/error-codes';

export interface APIErrorResponse {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
}