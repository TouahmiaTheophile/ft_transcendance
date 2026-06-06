import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetMessagesDto {
  @Max(200, { message: 'Limit must not exceed 200' })
  @Min(1,   { message: 'Limit must be at least 1' })
  @IsInt({ message: 'Limit must be an integer' })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 50;
}