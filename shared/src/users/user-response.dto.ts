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
  // -rbauerMod2- `null` for accounts created before the age field existed
  // and never updated since — new registrations always have a real number
  // here.
  age: number | null;
};

// -rbauerMod2- What a paginated search returns: not just the matching
// users, but enough information for the caller to render pagination
// controls (current page, total number of matches, total number of pages).
export type SearchUsersResponse = {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};