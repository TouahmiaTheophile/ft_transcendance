import { ErrorDetailsMap } from '@shared/errors/error-details-map';
import { ErrorCode } from '@shared/errors/error-codes';

export class ApiException<K extends ErrorCode = ErrorCode> extends Error {
  public readonly code: K;
  public readonly statusCode: number;
  public readonly details: ErrorDetailsMap[K];

  constructor(params: {
    code: K;
    message?: string;
    statusCode?: number;
    details?: ErrorDetailsMap[K];
  }) {
    super(params.message ?? 'Error');

    this.code = params.code;
    this.statusCode = params.statusCode ?? 500;
    this.details = params.details;
  }
}