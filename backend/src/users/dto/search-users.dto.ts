// ============================================================================
// -rbauerMod2- Describes what a "search users" request may contain: which query
// params exist, their types and their accepted ranges.
//
// A class, not a `type`/`interface`: those vanish at compile time, while a
// class still exists at runtime and can carry class-validator decorators.
//
// The global ValidationPipe (main.ts) builds an instance of this class from
// each request and checks every decorator before the controller runs, so bad
// input gets a clean 400 instead of reaching Prisma and causing a 500.
// ============================================================================

import { Type, Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, IsIn, IsInt, Min, Max, IsArray } from 'class-validator';
import { SearchUsersRequest } from '@shared/users/user-request.types';

export class SearchUsersDto implements SearchUsersRequest {
  // ---- FILTER 1: free-text search on the username -------------------------
  // -rbauerMod2- Optional: an empty search box means no text filter, leaving the
  // other filters (or nothing) to narrow the results.
  @IsOptional()
  @IsString()
  @MaxLength(50) // -rbauerMod2- no username is realistically longer
  query?: string;

  // ---- FILTER 2: age range --------------------------------------------------
  // -rbauerMod2- Two independent bounds, so the caller can use one alone
  // ("18 and older" = ageMin) or both as a range.
  //
  // `@Type(() => Number)` is required because query-string values always
  // arrive as text: it converts before validation, otherwise `@IsInt()` would
  // reject the string "25".
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

  // ---- FILTER 3: exclude specific user ids ----------------------------------
  // -rbauerMod2- Used by the frontend to hide the current user and existing
  // friends. It arrives as one comma-separated string ("?excludeIds=3,9,14"),
  // converted here into an array of numbers.
  @IsOptional()
  @Transform(({ value }) =>
    value ? String(value).split(',').map((id: string) => Number(id)) : undefined,
  )
  @IsArray()
  @IsInt({ each: true }) // -rbauerMod2- checks each element, not the array itself
  excludeIds?: number[];

  // ---- SORTING ----------------------------------------------------------------
  // -rbauerMod2- `@IsIn([...])` accepts only the listed values; anything else
  // (a typo, a hand-made curl call) gets a 400 instead of breaking the query.
  @IsOptional()
  @IsIn(['username', 'createdAt'])
  sortBy: 'username' | 'createdAt' = 'username';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  // ---- PAGINATION ---------------------------------------------------------
  // -rbauerMod2- `page` is 1-based, matching what a UI displays ("Page 1 of 5").
  // The conversion to Prisma's 0-based `skip` happens in the service.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  // -rbauerMod2- `limit` is capped at 50: without an upper bound a client could
  // ask for "?limit=999999" and make the database return far more rows than
  // any UI can display.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
