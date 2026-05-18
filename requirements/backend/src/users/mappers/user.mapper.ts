import { User } from '@prisma/client';
import { UserResponseDto } from '../dto/user-response.dto';

export function toUserResponse(user: User): UserResponseDto {
  return {
    id: String(user.id),
    username: user.username,
    email: user.email,
    passwordHash: user.passwordHash,
    // age: user.age ?? undefined,
    createdAt: user.createdAt,
  };
}