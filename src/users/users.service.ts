import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createOrFindUser(phone: string, role: string) {
    // 1. Önce bu numaraya sahip kullanıcı var mı bak
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    // 2. Eğer yoksa yeni bir kullanıcı oluştur (Siparişler için ID lazım)
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          role: role || 'CUSTOMER',
        },
      });
      console.log('🆕 Yeni müşteri oluşturuldu:', phone);
    }

    return user;
  }
}