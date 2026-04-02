import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common'; // Delete ve Param eklendi!
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('users')
  async getUsers() {
    return this.appService.getAllUsers();
  }

  @Get('categories')
  async getCategories() {
    return this.appService.getCategories();
  }

  @Post('categories')
  async addCategory(@Body() body: { title: string; keyword: string }) {
    return this.appService.addCategory(body);
  }

  // 🚀 YENİ: Mobil uygulamadan gelen silme talebini karşılayan kapı
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.appService.deleteCategory(id);
  }
}