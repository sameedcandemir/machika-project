import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module'; // Müşteri yönetimi için eklendi
import { PrismaModule } from './prisma/prisma.module'; // DB bağlantısı için eklendi
import { CloudinaryModule } from './cloudinary/cloudinary.module'; // 👈 YENİ: Resim yükleme motoru eklendi

@Module({
  imports: [
    PrismaModule,     // Ana veritabanı motoru
    ProductsModule,   // Ürün yönetimi
    AuthModule,       // Giriş ve yetkilendirme
    OrdersModule,     // Sipariş işlemleri
    UsersModule,      // Müşteri kayıt ve sorgulama
    CloudinaryModule, // 👈 YENİ: Resimlerin Cloudinary'e gitmesi için eklendi
  ],
})
export class AppModule {}