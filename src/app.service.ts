import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      orderBy: {
        id: 'desc', 
      },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { 
        createdAt: 'asc' 
      },
    });
  }

  async addCategory(data: { title: string; keyword: string }) {
    return this.prisma.category.create({
      data: {
        title: data.title,
        keyword: data.keyword,
      },
    });
  }

  // 🚀 YENİ: Veritabanından kategori silen görev!
  async deleteCategory(id: string) {
    return this.prisma.category.delete({
      where: { 
        id: id // Not: Eğer Prisma schema'nda ID'ler rakam (Int) ise burayı Number(id) yapmalısın.
      },
    });
  }
}