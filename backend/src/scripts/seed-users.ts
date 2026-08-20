import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';

const DEMO_PASSWORD = 'DemoUser123!';

const USER_COUNT = 20;
const MIN_AGE = 18;
const MAX_AGE = 74;

function buildFakeUser(index: number): RegisterUserDto {
  const step = (MAX_AGE - MIN_AGE) / (USER_COUNT - 1);
  const age = Math.round(MIN_AGE + step * index);

  const number = String(index + 1).padStart(2, '0');

  const dto = new RegisterUserDto();
  dto.username = `demo_user_${number}`;
  dto.email = `demo_user_${number}@example.com`;
  dto.password = DEMO_PASSWORD;
  dto.age = age;
  return dto;
}

async function run() {
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
      skipped++;
      const reason = error?.code === 'P2002' ? 'already exists' : (error?.message ?? 'unknown error');
      console.log(`skipped ${dto.username} (${reason})`);
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped (out of ${USER_COUNT}).`);
  if (created > 0) {
    console.log(`All demo accounts share the password: ${DEMO_PASSWORD}`);
  }

  await app.close();
  process.exit(0);
}

run();
