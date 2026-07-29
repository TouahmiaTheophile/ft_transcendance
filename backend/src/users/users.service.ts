import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/security/password.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { USER_PRIVATE_SELECT, USER_PUBLIC_SELECT } from './constants/user-selects';
import { ApiErrors } from '../common/errors/api-exceptions.helper';

import path from 'path';
import { promises as fs } from 'fs';
import { toUserResponse } from './mappers/user.mapper';

import sharp from 'sharp';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async register(dto: RegisterUserDto) {
    const passwordHash = await this.passwordService.hash(dto.password);

    return this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash,
        age: dto.age,
      },
      select: USER_PUBLIC_SELECT,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: USER_PUBLIC_SELECT,
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });
  }

  async findById_private(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: USER_PRIVATE_SELECT,
    });
  }

  // -rbauerMod2- Advanced user search: combines a text filter, an age-range
  // filter, an exclude-list filter, sorting, and pagination -- all in one
  // query.
  //
  // `dto` has already been validated and given its default values by
  // SearchUsersDto (see dto/search-users.dto.ts) before this method is even
  // called, so we can trust every field here without re-checking anything.
  async searchUsers(dto: SearchUsersDto) {
    // --- Step 1: build the "where" clause (the FILTERS) -------------------
    // -rbauerMod2- We build it as a list of small conditions combined with AND. Each
    // condition is only added "for real" when the caller actually asked for
    // it -- an empty `{}` inside an AND array is simply ignored by Prisma,
    // so filters the caller didn't use have zero effect on the query.
    const where = {
      AND: [
        // -rbauerMod2- Filter: username contains the search text (MariaDB is
        // case insensitive by default, so "bob" also matches "Bob").
        dto.query ? { username: { contains: dto.query } } : {},

        // -rbauerMod2- Filter: age is at least `ageMin` (if provided).
        dto.ageMin !== undefined ? { age: { gte: dto.ageMin } } : {},

        // -rbauerMod2- Filter: age is at most `ageMax` (if provided).
        dto.ageMax !== undefined ? { age: { lte: dto.ageMax } } : {},

        // -rbauerMod2- Filter: hide specific user ids (e.g. the current user
        // themself, and people who are already their friends).
        dto.excludeIds && dto.excludeIds.length > 0
          ? { id: { notIn: dto.excludeIds } }
          : {},
      ],
    };

    // --- Step 2: build the "orderBy" clause (the SORTING) ------------------
    // -rbauerMod2- dto.sortBy is either "username" or "createdAt" (enforced by @IsIn in
    // the DTO), so this safely becomes { username: "asc" } or similar.
    const orderBy = { [dto.sortBy]: dto.order };

    // --- Step 3: compute the "skip" value (the PAGINATION) ------------------
    // -rbauerMod2- Prisma's `skip` counts rows from 0, but `dto.page` counts pages from 1
    // (page 1 is the first page). Example: page 3 with a limit of 10 means
    // "skip the first 20 rows, then take the next 10".
    const skip = (dto.page - 1) * dto.limit;

    // --- Step 4: run the search and the count at the same time --------------
    // -rbauerMod2- We need two separate queries: one to fetch this page's rows (`findMany`
    // with skip/take), and one to know the TOTAL number of matches across
    // every page (`count`, ignoring skip/take) -- the frontend needs that
    // total to know how many pages exist. `Promise.all` runs both at once
    // instead of one after the other, since neither depends on the other's
    // result.
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: dto.limit,
        select: USER_PUBLIC_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    // --- Step 5: shape the response for the frontend -------------------------
    // -rbauerMod2- `users.map(toUserResponse)` turns each raw database row (which has an
    // `avatarFilename`) into the public shape the frontend expects (which
    // has a ready-to-use `avatarUrl`) -- the same mapper already used by
    // every other endpoint that returns user data.
    return {
      data: users.map(toUserResponse),
      total,
      page: dto.page,
      limit: dto.limit,
      // -rbauerMod2- Math.ceil rounds up: 25 total results with a limit of 10 means 3
      // pages (10 + 10 + 5), not 2.5. Math.max(1, ...) guarantees we always
      // report at least 1 page, even when there are 0 results.
      totalPages: Math.max(1, Math.ceil(total / dto.limit)),
    };
  }

  async update(userId: number, dto: UpdateUserDto) {
    const sensitiveChange = dto.email !== undefined || dto.newPassword !== undefined;

    if (sensitiveChange) {
      // Fetch full user to verify current password
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) throw ApiErrors.notFound('User not found');

      const valid = await this.passwordService.compare(dto.currentPassword, user.passwordHash);
      if (!valid) {
        throw ApiErrors.invalidCredentials('password', 'Current password is incorrect');
      }
    }

    const data: Record<string, unknown> = {};

    if (dto.email !== undefined) {
      data.email = dto.email;
    }

    if (dto.newPassword !== undefined) {
      data.passwordHash = await this.passwordService.hash(dto.newPassword);
    }

    // -rbauerMod2- Age is not part of `sensitiveChange` above — it can be
    // updated on its own, without re-entering the current password, the same
    // way a display name or bio would be in most apps.
    if (dto.age !== undefined) {
      data.age = dto.age;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: USER_PUBLIC_SELECT,
    });
  }

  async delete(userId: number, dto: DeleteUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw ApiErrors.notFound('User not found');

    const valid = await this.passwordService.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw ApiErrors.invalidCredentials('password', 'Incorrect password');
    }

    // Cascade delete handles RefreshSession and Friendship via schema onDelete: Cascade
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async updateAvatar(userId: number, file: Express.Multer.File) {
    const meta = await sharp(file.buffer).metadata();

    if (!meta.format || !['jpeg', 'png', 'webp'].includes(meta.format)) {
      throw ApiErrors.badRequest('Invalid image content');
    }

    const avatarsDir = path.join(process.cwd(), 'uploads/avatars');
    await fs.mkdir(avatarsDir, { recursive: true });

    const buffer = await sharp(file.buffer)
      .resize(256, 256)
      .webp({ quality: 80 })
      .toBuffer();

    // Generate unique filename
    const maxAttempts = 5;

    let filename: string | null = null;
    let filePath: string | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = `${randomUUID()}.webp`;
      const candidatePath = path.join(avatarsDir, candidate);

      try {
        await fs.writeFile(candidatePath, buffer, { flag: 'wx' });

        filename = candidate;
        filePath = candidatePath;
        break;
      } catch (err: any) {
        if (err?.code === 'EEXIST') continue;
        throw err;
      }
    }

    if (!filename || !filePath) {
      throw ApiErrors.internal('Unable to create avatar file');
    }

    // Store current avatar filename for cleaning
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarFilename: true },
    });
    const oldAvatar = user?.avatarFilename ?? null;

    try {
      // Concurrent safe update
      const result = await this.prisma.user.updateMany({
        where: {
          id: userId,
          avatarFilename: oldAvatar,
        },
        data: {
          avatarFilename: filename,
        },
      });

      // No update done
      if (result.count === 0) {
        throw ApiErrors.conflict('Avatar was modified by another request');
      }
    } catch (err) {
      await fs.unlink(filePath).catch(() => undefined);
      throw err;
    }

    if (oldAvatar) {
      const oldPath = path.join(avatarsDir, oldAvatar);
      await fs.unlink(oldPath).catch(() => undefined);
    }

    const updated = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return toUserResponse(updated);
  }

  async deleteAvatar(userId: number) {
    // Store current avatar filename for cleaning
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarFilename: true },
    });
    const oldAvatar = user?.avatarFilename ?? null;

    // Concurrent safe update
    const result = await this.prisma.user.updateMany({
      where: {
        id: userId,
        avatarFilename: oldAvatar,
      },
      data: {
        avatarFilename: null,
      },
    });
    // No update done
    if (result.count === 0) {
      throw ApiErrors.conflict('Avatar was modified by another request');
    }

    const avatarsDir = path.join(process.cwd(), 'uploads/avatars');
    if (oldAvatar) {
      const oldPath = path.join(avatarsDir, oldAvatar);
      await fs.unlink(oldPath).catch(() => undefined);
    }

    const updated = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return toUserResponse(updated);
  }
}