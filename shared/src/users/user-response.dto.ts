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
};