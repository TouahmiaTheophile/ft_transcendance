// ============================================================================
// -rbauerMod2- Seed script: creates a batch of fake user accounts so the
// "advanced search" module (filters, sorting, pagination -- see
// users/users.service.ts -> searchUsers) actually has enough data to be
// testable. A freshly deployed database only has whatever real accounts
// you registered by hand -- usually far too few to see a second page of
// results, or to notice an age filter doing anything at all.
//
// HOW IT'S RUN:
//   `make prod-users` (see the Makefile) runs this file INSIDE the already
//   running production backend container -- see the Makefile target for
//   the check that refuses to run it if that container isn't up yet.
//
// WHY THIS GOES THROUGH UsersService.register() INSTEAD OF WRITING TO THE
// DATABASE DIRECTLY WITH PRISMA:
// Reusing the real service means every fake account is created through the
// EXACT same code path as someone registering via the actual UI: same
// password hashing (PasswordService), same Prisma call. If register() ever
// changes (a new required field, different hashing...), this script can't
// quietly fall out of sync with it, because it's calling that same code,
// not a copy of it.
// ============================================================================

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';

// -rbauerMod2- Every fake account uses this same password. It only exists
// for local testing/demoing, so one well-known password is simpler than
// generating (and then having to remember) a different one per account.
const DEMO_PASSWORD = 'DemoUser123!';

// -rbauerMod2- How many fake users to create, and the age range to spread
// them across. A wide, evenly-spaced range makes both the age filter and
// the "sort by" options easy to demonstrate (enough users to fill several
// pages at the default page size of 10 -- see SearchUsersDto).
const USER_COUNT = 20;
const MIN_AGE = 18;
const MAX_AGE = 74;

// -rbauerMod2- Builds the data for the Nth fake user (index is 0-based).
function buildFakeUser(index: number): RegisterUserDto {
  // -rbauerMod2- Spreads ages evenly across [MIN_AGE, MAX_AGE] instead of
  // picking them randomly -- running this script twice in a row produces
  // the exact same 20 users with the exact same ages every time, which
  // makes it easy to reason about what the search filters SHOULD return
  // while testing.
  const step = (MAX_AGE - MIN_AGE) / (USER_COUNT - 1);
  const age = Math.round(MIN_AGE + step * index);

  // -rbauerMod2- Zero-padded so usernames sort predictably: demo_user_01 ..
  // demo_user_20.
  const number = String(index + 1).padStart(2, '0');

  const dto = new RegisterUserDto();
  dto.username = `demo_user_${number}`;
  dto.email = `demo_user_${number}@example.com`;
  dto.password = DEMO_PASSWORD;
  dto.age = age;
  return dto;
}

async function run() {
  // -rbauerMod2- Boots the full Nest dependency injection container -- the
  // same providers the real server uses -- but WITHOUT starting an HTTP
  // listener, since all we need here is access to UsersService.
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < USER_COUNT; i++) {
    const dto = buildFakeUser(i);

    try {
      await usersService.register(dto);
      created++;
      console.log(`created ${dto.username} (age ${dto.age})`);
    } catch (error: any) {
      // -rbauerMod2- Running this script a second time would otherwise
      // crash on the very first user, since usernames/emails are unique in
      // the database (Prisma error code P2002). We treat "this account
      // already exists" as expected -- not a real failure -- and keep
      // going with the rest of the batch.
      skipped++;
      const reason = error?.code === 'P2002' ? 'already exists' : (error?.message ?? 'unknown error');
      console.log(`skipped ${dto.username} (${reason})`);
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped (out of ${USER_COUNT}).`);
  if (created > 0) {
    console.log(`All demo accounts share the password: ${DEMO_PASSWORD}`);
  }

  // -rbauerMod2- Closing the context releases the database connection and
  // every other resource Nest opened for us -- without this, the script
  // would hang instead of letting `docker compose exec` return.
  await app.close();
  process.exit(0);
}

run();
