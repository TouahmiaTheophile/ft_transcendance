export type RegisterUserRequest = {
  username: string;
  publicUsername: string;
  email: string;
  password: string;
};

export type UpdateUserRequest = {
  publicUsername?: string;
  email?: string;
  newPassword?: string;
  // Required when email or newPassword is provided
  currentPassword?: string;
};

export type DeleteUserRequest = {
  password: string;
};