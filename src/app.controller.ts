import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 🚀 YENİ: Müşteri (Kullanıcı) listesini mobil uygulamaya gönderen kapı!
  @Get('users')
  async getUsers() {
    return this.appService.getAllUsers();
  }
}