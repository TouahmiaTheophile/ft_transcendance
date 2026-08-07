// ============================================================================
// -rbauerMod2- Seed script: creates fake accounts so the advanced search
// (searchUsers) has enough data to be testable. A fresh database holds only
// the few accounts registered by hand -- not enough for a second page of
// results or a visible age filter.
//
// Run with `make prod-users`, which executes this file inside the running
// backend container and refuses to start if that container is down.
//
// It goes through UsersService.register() rather than writing with Prisma
// directly, so each account follows the exact path of a real registration
// (same hashing, same call) and cannot fall out of sync when register()
// changes.
// ============================================================================

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';

// -rbauerMod2- Shared by every fake account. These exist only for local demos,
// so one known password is simpler than one per account.
const DEMO_PASSWORD = 'DemoUser123!';

// -rbauerMod2- How many users to create and over which age range. A wide,
// evenly spread range demonstrates the age filter and the sort options, with
// enough users to fill several pages at the default size of 10.
const USER_COUNT = 20;
const MIN_AGE = 18;
const MAX_AGE = 74;

// -rbauerMod2- Builds the Nth fake user (0-based index).
function buildFakeUser(index: number): RegisterUserDto {
  // -rbauerMod2- Ages spread evenly across [MIN_AGE, MAX_AGE] rather than
  // random, so two runs produce identical users and the expected result of a
  // filter stays predictable.
  const step = (MAX_AGE - MIN_AGE) / (USER_COUNT - 1);
  const age = Math.round(MIN_AGE + step * index);

  // -rbauerMod2- Zero-padded so usernames sort predictably (demo_user_01..20).
  const number = String(index + 1).padStart(2, '0');

  const dto = new RegisterUserDto();
  dto.username = `demo_user_${number}`;
  dto.email = `demo_user_${number}@example.com`;
  dto.password = DEMO_PASSWORD;
  dto.age = age;
  return dto;
}

async function run() {
  // -rbauerMod2- Boots the Nest container with the real server's providers but
  // no HTTP listener: only UsersService is needed here.
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
      // -rbauerMod2- A second run would otherwise crash on the first user, since
      // usernames and emails are unique (Prisma P2002). "Already exists" is
      // expected here, so the batch continues.
      skipped++;
      const reason = error?.code === 'P2002' ? 'already exists' : (error?.message ?? 'unknown error');
      console.log(`skipped ${dto.username} (${reason})`);
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped (out of ${USER_COUNT}).`);
  if (created > 0) {
    console.log(`All demo accounts share the password: ${DEMO_PASSWORD}`);
  }

  // -rbauerMod2- Closing releases the database connection and Nest's other
  // resources; without it the script hangs and `docker compose exec` never
  // returns.
  await app.close();
  process.exit(0);
}

run();
