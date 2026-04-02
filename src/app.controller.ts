import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Müşteri (Kullanıcı) listesini mobil uygulamaya gönderen kapı!
  @Get('users')
  async getUsers() {
    return this.appService.getAllUsers();
  }

  // 🚀 YENİ: Kategorileri mobil uygulamaya gönderen kapı
  @Get('categories')
  async getCategories() {
    return this.appService.getCategories();
  }

  // 🚀 YENİ: Admin panelinden yeni kategori ekleme kapısı
  @Post('categories')
  async addCategory(@Body() body: { title: string; keyword: string }) {
    return this.appService.addCategory(body);
  }
}