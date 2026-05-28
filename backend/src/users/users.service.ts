import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { PasswordService } from '../common/security/password.service';
import { USER_PUBLIC_SELECT } from './constants/user-selects';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {
    console.log('UsersService constructed');
    console.log('UsersService file:', __filename);
    console.log('UsersService TOKEN', UsersService.name);
  }

  async register(dto: RegisterUserDto) {
    const passwordHash =
      await this.passwordService.hash(
        dto.password,
      );

    return this.prisma.user.create({
      data: {
        username: dto.username,
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
}