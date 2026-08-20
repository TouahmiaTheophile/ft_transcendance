import { IsDefined, IsEmail, IsInt, IsOptional, IsString, Max, Min, MinLength, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserRequest } from '@shared/users/user-request.types';

export class UpdateUserDto implements UpdateUserRequest {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @MinLength(8, { message: 'New password must contain at least 8 characters' })
  @IsString({ message: 'New password must be a string' })
  @IsOptional()
  newPassword?: string;

  @IsString({ message: 'Current password must be a string' })
  @ValidateIf(o => o.email !== undefined || o.newPassword !== undefined)
  @IsDefined({ message: 'Current password is required to change email or password' })
  currentPassword?: string;

  @Type(() => Number)
  @IsInt({ message: 'Age must be a whole number' })
  @Min(0, { message: 'Age must be at least 0' })
  @Max(150, { message: 'Age must be at most 150' })
  @IsOptional()
  age?: number;
}