import { ValidationError } from 'class-validator';
import { ApiException } from '../errors/api.exception';

export function validationExceptionFactory(errors: ValidationError[]) {
  const fields: Record<string, string[]> = {};

  for (const error of errors) {
    // Case 1: class-validator constraints
    if (error.constraints) {
      fields[error.property] = Object.values(error.constraints).map(String);
    }

    // Case 2: nested validation errors (DTO objects)
    if (error.children?.length) {
      for (const child of error.children) {
        if (child.constraints) {
          const path = `${error.property}.${child.property}`;
          fields[path] = Object.values(child.constraints).map(String);
        }
      }
    }
  }

  return new ApiException({
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    statusCode: 400,
    details: {
      fields,
    },
  });
}