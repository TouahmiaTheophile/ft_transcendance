export type UserResponseDto = {
  id: number;
  username: string;
  publicUsername: string;
};

export type PrivateUserResponseDto = {
  id: number;
  username: string;
  publicUsername: string;
  email: string;
  createdAt: Date;
};