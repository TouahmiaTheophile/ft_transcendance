export type ValidationErrorDetails = {
  fields: Record<string, string[]>;
};

export type UniqueConstraintDetails = {
  fields: string[];
};

export type BadRequestDetails = {
  reason?: string;
};

export type UnknownDetails = null;

export type ErrorDetails =
  | ValidationErrorDetails
  | UniqueConstraintDetails
  | BadRequestDetails
  | UnknownDetails;