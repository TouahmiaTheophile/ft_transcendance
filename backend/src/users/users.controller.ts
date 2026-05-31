import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '../auth/types/access-token-payload.type';
import { UsersService } from './users.service';
import { toUserResponse } from './mappers/user.mapper';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ApiErrors } from '../common/errors/api-exceptions.helper';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: RegisterUserDto) {
    const user = await this.usersService.register(dto);
    return toUserResponse(user);
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(toUserResponse);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AccessTokenPayload) {
    const fullUser = await this.usersService.findById(user.sub);
    if (!fullUser) throw ApiErrors.notFound('User not found');
    return toUserResponse(fullUser);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async update(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: UpdateUserDto,
  ) {
    const updated = await this.usersService.update(user.sub, dto);
    return toUserResponse(updated);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: DeleteUserDto,
  ) {
    await this.usersService.delete(user.sub, dto);
  }
}