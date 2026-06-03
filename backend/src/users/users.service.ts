import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../common/security/password.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { USER_PRIVATE_SELECT, USER_PUBLIC_SELECT } from './constants/user-selects';
import { ApiErrors } from '../common/errors/api-exceptions.helper';

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
        publicUsername: dto.publicUsername,
        email: dto.email,
        passwordHash,
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

    if (dto.publicUsername !== undefined) {
      data.publicUsername = dto.publicUsername;
    }

    if (dto.email !== undefined) {
      data.email = dto.email;
    }

    if (dto.newPassword !== undefined) {
      data.passwordHash = await this.passwordService.hash(dto.newPassword);
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
}