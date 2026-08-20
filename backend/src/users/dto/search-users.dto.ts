import { Type, Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, IsIn, IsInt, Min, Max, IsArray } from 'class-validator';
import { SearchUsersRequest } from '@shared/users/user-request.types';

export class SearchUsersDto implements SearchUsersRequest {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  query?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ageMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(120)
  ageMax?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value ? String(value).split(',').map((id: string) => Number(id)) : undefined,
  )
  @IsArray()
  @IsInt({ each: true })
  excludeIds?: number[];

  @IsOptional()
  @IsIn(['username', 'createdAt'])
  sortBy: 'username' | 'createdAt' = 'username';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
