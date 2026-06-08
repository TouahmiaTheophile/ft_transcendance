export type RegisterUserRequest = {
  username: string;
  email: string;
  password: string;
};

export type UpdateUserRequest = {
  email?: string;
  newPassword?: string;
  // Required when email or newPassword is provided
  currentPassword?: string;
};

export type DeleteUserRequest = {
  password: string;
};

export type SearchUsersRequest = {
  query: string;
  size?: number;
};