import { IsDefined, IsEmail, IsInt, IsString, Matches, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
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

  // -rbauerMod2- Required so the search module's age filter (SearchUsersDto)
  // always has real data on new accounts. `@Type(() => Number)` converts before
  // the checks below, in case a client sends "25" as a string.
  @Type(() => Number)
  @IsInt({ message: 'Age must be a whole number' })
  @Min(0, { message: 'Age must be at least 0' })
  @Max(150, { message: 'Age must be at most 150' })
  @IsDefined({ message: 'Age is required' })
  age: number;
}