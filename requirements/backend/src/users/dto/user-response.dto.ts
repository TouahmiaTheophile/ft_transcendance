export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  // age?: number;
  createdAt: Date;
}