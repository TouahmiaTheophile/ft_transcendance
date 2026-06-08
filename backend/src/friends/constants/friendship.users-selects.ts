import { USER_PUBLIC_SELECT } from "src/users/constants/user-selects";

export const FRIENDSHIP_USERS_INCLUDE = {
  requester: { select: USER_PUBLIC_SELECT },
  addressee: { select: USER_PUBLIC_SELECT },
} as const;