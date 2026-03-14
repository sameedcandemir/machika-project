import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Prisma 6, şemadaki 'file:./dev.db' adresini otomatik tanır. Constructor'a gerek yok!

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ MUTA SİSTEMİ: Veritabanı (Prisma 6) KUSURSUZ bağlandı!');
    } catch (error: any) {
      console.error('❌ MUTA Bağlantı Hatası:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}