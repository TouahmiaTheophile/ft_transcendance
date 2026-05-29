import { ErrorCode } from '../errors/error-codes';
import { ErrorDetailsMap } from '../errors/error-details-map';

export interface APIErrorResponse<K extends ErrorCode = ErrorCode> {
  statusCode: number;
  code: K;
  message: string;
  details: ErrorDetailsMap[K];
  timestamp: string;
  path: string;
}