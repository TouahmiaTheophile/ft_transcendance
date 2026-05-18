import { IsDefined, IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, {
    message: 'Invalid email format',
  })
  @IsDefined({
    message: 'Email is required',
  })
  email: string;

  @IsString({
    message: 'Password must be a string',
  })
  @IsDefined({
    message: 'Password is required',
  })
  password: string;
}