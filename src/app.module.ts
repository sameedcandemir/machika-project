import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module'; // 👈 YENİ: Müşteri yönetimi için eklendi
import { PrismaModule } from './prisma/prisma.module'; // 👈 KRİTİK: DB bağlantısı için eklendi

@Module({
  imports: [
    PrismaModule,   // Ana veritabanı motoru
    ProductsModule, // Ürün yönetimi
    AuthModule,     // Giriş ve yetkilendirme
    OrdersModule,   // Sipariş işlemleri
    UsersModule,    // Müşteri kayıt ve sorgulama
  ],
})
export class AppModule {}