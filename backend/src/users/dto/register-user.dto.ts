import { IsDefined, IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { RegisterUserRequest } from '@shared/users/user-request.types';

export class RegisterUserDto implements RegisterUserRequest {
  // Permanent login identifier — cannot be changed after registration
  @MinLength(3, { message: 'Username must contain at least 3 characters' })
  @Matches(/^[a-zA-Z0-9.-]+$/, {
    message: 'Username can only contain letters, numbers, dots and hyphens',
  })
  @IsString({ message: 'Username must be a string' })
  @IsDefined({ message: 'Username is required' })
  username: string;

  @MinLength(8, { message: 'Password must contain at least 8 characters' })
  @IsString({ message: 'Password must be a string' })
  @IsDefined({ message: 'Password is required' })
  password: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsDefined({ message: 'Email is required' })
  email: string;
}