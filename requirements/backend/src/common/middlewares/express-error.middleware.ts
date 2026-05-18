import { normalizeError } from '../errors/normalize-error';
import { createErrorResponse } from '../errors/create-error-response';
import { Request, Response, NextFunction } from 'express';

// Handle some of pre-nest-errors due to HTTP request
export function expressErrorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const normalized = normalizeError(err);

  return res.status(normalized.statusCode).json(
    createErrorResponse({
      statusCode: normalized.statusCode,
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      path: req.url,
    }),
  );
}