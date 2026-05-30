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

  // Publicly displayed name — can be changed later
  @MinLength(3, { message: 'Public username must contain at least 3 characters' })
  @Matches(/^[a-zA-Z0-9._\- ]+$/, {
    message: 'Public username can only contain letters, numbers, spaces, dots, hyphens and underscores',
  })
  @IsString({ message: 'Public username must be a string' })
  @IsDefined({ message: 'Public username is required' })
  publicUsername: string;

  @MinLength(8, { message: 'Password must contain at least 8 characters' })
  @IsString({ message: 'Password must be a string' })
  @IsDefined({ message: 'Password is required' })
  password: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsDefined({ message: 'Email is required' })
  email: string;
}