import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module'; // Prisma bağlantısı için eklendi

@Module({
  imports: [
    CloudinaryModule, // Resim yükleme yeteneği kazandırır
    PrismaModule,     // Veritabanı (Neon) işlemlerini yapabilmesini sağlar
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}