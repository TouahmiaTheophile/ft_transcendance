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
  age: number | null;
};

export type SearchUsersResponse = {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};