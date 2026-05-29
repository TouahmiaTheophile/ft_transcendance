import {
  IsDefined,
  IsEmail,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @MinLength(3, {
    message: 'Username must contain at least 3 characters',
  })
  @Matches(/^[a-zA-Z0-9.-]+$/, {
    message:
      'Username can only contain letters, numbers, dots and hyphens',
  })
  @IsString({ message: 'Username must be a string' })
  @IsDefined({ message: 'Username is required' })
  username: string;

  @MinLength(8, { message: 'Password must contain at least 8 characters', })
  @IsString({ message: 'Password must be a string' })
  @IsDefined({ message: 'Password is required' })
  password: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsDefined({ message: 'Email is required' })
  email: string;

  // @Max(120, { message: 'Age must be at most 120' })
  // @Min(0, { message: 'Age must be at least 0' })
  // @IsInt({ message: 'Age must be an integer' })
  // @IsNumber({}, { message: 'Age must be a valid number' })
  // @Type(() => Number)
  // @IsOptional()
  // age?: number;
}
