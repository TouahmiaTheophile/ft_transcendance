// ============================================================================
// -rbauerMod2- SearchUsersDto -- describes exactly what a "search users" HTTP
// request is allowed to contain: which query params exist, what type they
// must be, and what range of values is acceptable.
//
// WHY THIS IS A *CLASS* AND NOT JUST A `type`/`interface`:
// A TypeScript `type`/`interface` only exists at compile time -- it vanishes
// completely once the code is compiled to JavaScript, so it can't protect
// anything while the server is actually running. A `class`, on the other
// hand, still exists at runtime, which lets us attach real `class-validator`
// decorators (@IsInt, @Min, ...) to each field.
//
// Nest's global ValidationPipe (see backend/src/main.ts) takes every
// incoming request, builds a real instance of this class from it, and checks
// every decorator BEFORE our controller method's code even runs. If a check
// fails, the caller automatically gets a clean "400 Bad Request" with a
// clear message -- instead of bad data (e.g. the text "abc" where a page
// number was expected) reaching Prisma and crashing with a raw 500 error.
// ============================================================================

import { Type, Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, IsIn, IsInt, Min, Max, IsArray } from 'class-validator';
import { SearchUsersRequest } from '@shared/users/user-request.types';

export class SearchUsersDto implements SearchUsersRequest {
  // ---- FILTER 1: free-text search on the username -------------------------
  // -rbauerMod2- Optional: an empty search box just means "no text filter,
  // rely on the other filters (or show everyone) instead".
  @IsOptional()
  @IsString()
  @MaxLength(50) // -rbauerMod2- a username can't realistically be longer than this anyway
  query?: string;

  // ---- FILTER 2: age range --------------------------------------------------
  // -rbauerMod2- Two separate optional bounds so the caller can use either
  // one alone ("18 and older" = ageMin only) or both together (a min-max
  // range).
  //
  // `@Type(() => Number)` is required because EVERYTHING coming from a URL
  // query string arrives as plain text (e.g. the characters "25"), never as
  // a real number. This decorator runs BEFORE validation and converts that
  // text into an actual JS number. Without it, `@IsInt()` would always
  // fail, because it would still be checking the text "25", not the number.
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
  // -rbauerMod2- Used by the frontend to say "don't show my own account, and
  // don't show people who are already my friends". The frontend sends this
  // as ONE comma-separated string in the URL (e.g. "?excludeIds=3,9,14"), so
  // we convert that single string into a real array of numbers ourselves here.
  @IsOptional()
  @Transform(({ value }) =>
    value ? String(value).split(',').map((id: string) => Number(id)) : undefined,
  )
  @IsArray()
  @IsInt({ each: true }) // -rbauerMod2- "each: true" -> check every element of the array, not the array itself
  excludeIds?: number[];

  // ---- SORTING ----------------------------------------------------------------
  // -rbauerMod2- `@IsIn([...])` only accepts the exact values listed.
  // Anything else (a typo, or someone poking the API with curl) is rejected
  // with a 400 instead of being silently ignored or breaking the Prisma query.
  @IsOptional()
  @IsIn(['username', 'createdAt'])
  sortBy: 'username' | 'createdAt' = 'username';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

  // ---- PAGINATION ---------------------------------------------------------
  // -rbauerMod2- `page` is 1-based (page 1 = first page) because that's what
  // makes sense to display in a UI ("Page 1 of 5"), even though Prisma's
  // `skip` counts from 0 internally -- that conversion happens in the
  // service, not here.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  // -rbauerMod2- `limit` is capped at 50 on purpose: without an upper bound,
  // a client could ask for an enormous page (e.g. "?limit=999999") and force
  // the database to read and send back far more rows than any UI could ever
  // usefully display -- wasted work for no real benefit.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
