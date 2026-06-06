import { IsDefined, IsEmail, IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator';
import { UpdateUserRequest } from '@shared/users/user-request.types';

export class UpdateUserDto implements UpdateUserRequest {
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