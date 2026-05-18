import { ErrorCode } from './error-codes';
import { ErrorDetails } from './error-details.types';

export interface APIErrorResponse {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details: ErrorDetails;
  timestamp: string;
  path: string;
}