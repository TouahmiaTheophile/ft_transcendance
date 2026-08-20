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

  async searchUsers(dto: SearchUsersDto) {
    const where = {
      AND: [
        dto.query ? { username: { contains: dto.query } } : {},

        dto.ageMin !== undefined ? { age: { gte: dto.ageMin } } : {},

        dto.ageMax !== undefined ? { age: { lte: dto.ageMax } } : {},

        dto.excludeIds && dto.excludeIds.length > 0
          ? { id: { notIn: dto.excludeIds } }
          : {},
      ],
    };

    const orderBy = { [dto.sortBy]: dto.order };

    const skip = (dto.page - 1) * dto.limit;

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

    return {
      data: users.map(toUserResponse),
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.max(1, Math.ceil(total / dto.limit)),
    };
  }

  async update(userId: number, dto: UpdateUserDto) {
    const sensitiveChange = dto.email !== undefined || dto.newPassword !== undefined;

    if (sensitiveChange) {
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

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarFilename: true },
    });
    const oldAvatar = user?.avatarFilename ?? null;

    try {
      const result = await this.prisma.user.updateMany({
        where: {
          id: userId,
          avatarFilename: oldAvatar,
        },
        data: {
          avatarFilename: filename,
        },
      });

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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarFilename: true },
    });
    const oldAvatar = user?.avatarFilename ?? null;

    const result = await this.prisma.user.updateMany({
      where: {
        id: userId,
        avatarFilename: oldAvatar,
      },
      data: {
        avatarFilename: null,
      },
    });
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