export type UserResponseDto = {
  id: number;
  username: string;
};

export type PrivateUserResponseDto = {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
};