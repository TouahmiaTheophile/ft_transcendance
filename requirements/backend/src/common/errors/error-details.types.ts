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
// HTTP
  | ValidationErrorDetails
  | UniqueConstraintDetails
  | BadRequestDetails
// Friends
  | FriendshipErrorDetails
// Fallback
  | UnknownDetails;

export type FriendshipErrorDetails = {
  reason:
    | 'SELF_REQUEST'
    | 'ALREADY_EXISTS'
    | 'NOT_PENDING'
    | 'FORBIDDEN';

  friendship?: {
    id: number;
    requesterId: number;
    addresseeId: number;
    status: string;
    createdAt?: Date;
  } | null;
};