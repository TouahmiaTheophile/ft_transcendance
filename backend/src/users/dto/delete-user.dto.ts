import { IsDefined, IsString } from 'class-validator';
import { DeleteUserRequest } from '@shared/users/user-request.types';

export class DeleteUserDto implements DeleteUserRequest {
  @IsString({ message: 'Password must be a string' })
  @IsDefined({ message: 'Password is required to delete account' })
  password: string;
}