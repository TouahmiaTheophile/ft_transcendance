import { Prisma } from '@prisma/client';
import { UserResponseDto, PrivateUserResponseDto } from '@shared/users/user-response.dto';
import { USER_PRIVATE_SELECT, USER_PUBLIC_SELECT } from '../constants/user-selects';

type PublicUser = Prisma.UserGetPayload<{
  select: typeof USER_PUBLIC_SELECT;
}>;

export function toUserResponse(user: PublicUser): UserResponseDto {
  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarFilename
      ? `/uploads/avatars/${user.avatarFilename}`
      : null,
  };
}

type PrivateUser = Prisma.UserGetPayload<{
  select: typeof USER_PRIVATE_SELECT;
}>;

export function toPrivateUserResponse(user: PrivateUser): PrivateUserResponseDto {
  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarFilename
      ? `/uploads/avatars/${user.avatarFilename}`
      : null,
    email: user.email,
    createdAt: user.createdAt,
  };
}