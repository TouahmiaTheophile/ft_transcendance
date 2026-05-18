import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { toUserResponse } from './mappers/user.mapper';

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
}

// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Post()
//   async create(@Body() RegisterUserDto: RegisterUserDto) {
//     return this.usersService.create(RegisterUserDto);
//   }

//   @Get()
//   async findAll() {
//     return this.usersService.findAll();
//   }

//   // @Put(':id')
//   // async update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<RegisterUserDto>) {
//   //   return this.usersService.update(id, body);
//   // }

//   // @Delete(':id')
//   // @HttpCode(HttpStatus.NO_CONTENT)
//   // async remove(@Param('id', ParseIntPipe) id: number) {
//   //   await this.usersService.remove(id);
//   // }

//   // @Post('login')
//   // async login(@Body() body: { username: string; email: string }) {
//   //   return this.usersService.login(body.username, body.email);
//   // }
// }