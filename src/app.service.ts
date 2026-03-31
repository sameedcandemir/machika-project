import { Injectable } from '@nestjs/common';
// PrismaService'in senin projendeki yeri farklıysa bu satırın altı kırmızı çizilebilir. 
// Genelde 'prisma.service' dosyasından gelir.
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  // Prisma'yı işçimize (Service) alet çantası olarak veriyoruz
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  // 🚀 YENİ: Veritabanından tüm kullanıcıları (müşterileri) çeken görev!
  async getAllUsers() {
    return this.prisma.user.findMany({
      orderBy: {
        id: 'desc', // En son kayıt olan en üstte gelsin
      },
    });
  }
}