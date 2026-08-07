export type UserResponseDto = {
  id: number;
  username: string;
  avatarUrl: string;
};

export type PrivateUserResponseDto = {
  id: number;
  username: string;
  avatarUrl: string;

  email: string;
  createdAt: Date;
  // -rbauerMod2- `null` for accounts predating the age field and never updated
  // since; new registrations always carry a real number.
  age: number | null;
};

// -rbauerMod2- A paginated search result: the matching users plus what the
// caller needs to render pagination controls.
export type SearchUsersResponse = {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};