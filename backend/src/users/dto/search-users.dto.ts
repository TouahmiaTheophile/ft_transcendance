import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SearchUsersRequest } from '@shared/users/user-request.types';

export class SearchUsersDto implements SearchUsersRequest {
  @IsString()
  query: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  max?: number = 20;
}