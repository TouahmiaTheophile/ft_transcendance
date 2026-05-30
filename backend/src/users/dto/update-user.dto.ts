import { IsDefined, IsEmail, IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator';
import { UpdateUserRequest } from '@shared/users/user-request.types';

export class UpdateUserDto implements UpdateUserRequest {
  // Freely modifiable — no password required
  @MinLength(3, { message: 'Public username must contain at least 3 characters' })
  @Matches(/^[a-zA-Z0-9._\- ]+$/, {
    message: 'Public username can only contain letters, numbers, spaces, dots, hyphens and underscores',
  })
  @IsString({ message: 'Public username must be a string' })
  @IsOptional()
  publicUsername?: string;

  // Sensitive — requires currentPassword
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  // Sensitive — requires currentPassword
  @MinLength(8, { message: 'New password must contain at least 8 characters' })
  @IsString({ message: 'New password must be a string' })
  @IsOptional()
  newPassword?: string;

  // Required when changing email or password
  @IsString({ message: 'Current password must be a string' })
  @ValidateIf(o => o.email !== undefined || o.newPassword !== undefined)
  @IsDefined({ message: 'Current password is required to change email or password' })
  currentPassword?: string;
}