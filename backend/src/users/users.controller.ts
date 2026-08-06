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
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayload } from '../auth/types/access-token-payload.type';
import { UsersService } from './users.service';
import { toPrivateUserResponse, toUserResponse } from './mappers/user.mapper';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { ApiErrors } from '../common/errors/api-exceptions.helper';

import { FileInterceptor } from '@nestjs/platform-express';

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
    const fullUser = await this.usersService.findById_private(user.sub);
    if (!fullUser) throw ApiErrors.notFound('User not found');
    return toPrivateUserResponse(fullUser);
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

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  async uploadAvatar(
    @CurrentUser() user: AccessTokenPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(user.sub, file);
  }

  @Delete('me/avatar')
  @UseGuards(JwtAuthGuard)
  async deleteAvatar(
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.usersService.deleteAvatar(user.sub);
  }

  // -rbauerMod2- `@Query() dto: SearchUsersDto` -- unlike `@Query('query') query: string`,
  // this tells Nest: "take ALL the query params from the URL, build a real
  // SearchUsersDto instance out of them, and run it through the global
  // ValidationPipe (see main.ts) before calling this method". That's what
  // actually enforces every @IsInt/@Min/@Max/@IsIn rule declared in the DTO.
  @Get('search')
  async searchUsers(@Query() dto: SearchUsersDto) {
    return this.usersService.searchUsers(dto);
  }
}