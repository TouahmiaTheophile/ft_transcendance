export const ErrorRegistry = {
  BAD_REQUEST: {
    status: 400,
    defaultMessage: 'Bad request',
  },

  UNAUTHORIZED: {
    status: 401,
    defaultMessage: 'Unauthorized',
  },

  FORBIDDEN: {
    status: 403,
    defaultMessage: 'Forbidden',
  },

  NOT_FOUND: {
    status: 404,
    defaultMessage: 'Not found',
  },

  CONFLICT: {
    status: 409,
    defaultMessage: 'Conflict',
  },

  INTERNAL_ERROR: {
    status: 500,
    defaultMessage: 'Internal error',
  },

  VALIDATION_ERROR: {
    status: 400,
    defaultMessage: 'Validation failed',
  },

  UNIQUE_CONSTRAINT: {
    status: 409,
    defaultMessage: 'Resource already exists',
  },

  FRIENDSHIP_SELF_REQUEST: {
    status: 400,
    defaultMessage: 'Cannot add yourself',
  },

  FRIENDSHIP_ALREADY_EXISTS: {
    status: 409,
    defaultMessage: 'Friendship already exists',
  },

  FRIENDSHIP_NOT_PENDING: {
    status: 409,
    defaultMessage: 'Friend request is not pending',
  },

  FRIENDSHIP_FORBIDDEN: {
    status: 403,
    defaultMessage: 'Forbidden',
  },
} as const;