import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async login(@Body() body: { phone: string; role: string }) {
    return this.usersService.createOrFindUser(body.phone, body.role);
  }
}