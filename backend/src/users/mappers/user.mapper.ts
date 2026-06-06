import { Prisma } from '@prisma/client';
import { UserResponseDto } from '@shared/users/user-response.dto';
import { USER_PUBLIC_SELECT } from '../constants/user-selects';

type PublicUser = Prisma.UserGetPayload<{
  select: typeof USER_PUBLIC_SELECT;
}>;

export function toUserResponse(user: PublicUser): UserResponseDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}