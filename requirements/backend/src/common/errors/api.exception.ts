import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';
import { ErrorDetails } from './error-details.types';

export class ApiException extends Error {
  code: ErrorCode;
  statusCode: number;
  details: ErrorDetails;

  constructor(params: {
    code: ErrorCode;
    message: string;
    statusCode?: number;
    details?: ErrorDetails;
  }) {
    super(params.message);

    this.code = params.code;
    this.statusCode = params.statusCode ?? 500;
    this.details = params.details ?? null;
  }
}