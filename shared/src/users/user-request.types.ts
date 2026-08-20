export type RegisterUserRequest = {
  username: string;
  email: string;
  password: string;
  age: number;
};

export type UpdateUserRequest = {
  email?: string;
  newPassword?: string;
  currentPassword?: string;
  age?: number;
};

export type DeleteUserRequest = {
  password: string;
};

export type SearchUsersRequest = {
  query?: string;
  ageMin?: number;
  ageMax?: number;
  excludeIds?: number[];
  sortBy?: 'username' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};