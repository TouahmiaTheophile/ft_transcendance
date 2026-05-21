import { FriendshipSnapshot } from "../friendship/friendship-snapshot.type";

export type ErrorDetailsMap = {
  BAD_REQUEST: null;
  UNAUTHORIZED: null;
  FORBIDDEN: null;
  NOT_FOUND: null;
  CONFLICT: null;
  INTERNAL_ERROR: null;

  VALIDATION_ERROR: {
    fields: Record<string, string[]>;
  };

  UNIQUE_CONSTRAINT: {
    fields: string[];
  };

  FRIENDSHIP_SELF_REQUEST: {
    friendship?: null;
  };

  FRIENDSHIP_ALREADY_EXISTS: {
    friendship: FriendshipSnapshot;
  };

  FRIENDSHIP_NOT_PENDING: {
    friendship: FriendshipSnapshot;
  };

  FRIENDSHIP_FORBIDDEN: {
    friendship: FriendshipSnapshot;
  };
};