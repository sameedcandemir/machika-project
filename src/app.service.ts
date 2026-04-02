import { Injectable } from '@nestjs/common';
// PrismaService'in yolu klasör yapına göre './prisma/prisma.service' olarak güncellendi.
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  // Prisma'yı işçimize (Service) alet çantası olarak veriyoruz
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  // Veritabanından tüm kullanıcıları (müşterileri) çeken görev!
  async getAllUsers() {
    return this.prisma.user.findMany({
      orderBy: {
        id: 'desc', // En son kayıt olan en üstte gelsin
      },
    });
  }

  // 🚀 YENİ: Veritabanından tüm kategorileri çeken görev!
  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { 
        createdAt: 'asc' // Eklenme sırasına göre gelsin
      },
    });
  }

  // 🚀 YENİ: Veritabanına yeni kategori ekleyen görev!
  async addCategory(data: { title: string; keyword: string }) {
    return this.prisma.category.create({
      data: {
        title: data.title,
        keyword: data.keyword,
      },
    });
  }
}