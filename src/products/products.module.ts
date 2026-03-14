import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // 👈 1. Bulut modülünü içeri alıyoruz

@Module({
  imports: [
    CloudinaryModule, // 👈 2. Buraya ekleyerek Controller'ın bu servisi kullanmasına izin veriyoruz
  ],
  controllers: [ProductsController],
  providers: [ProductsService], // Not: PrismaService genelde PrismaModule içinden gelir, burada tekrar yazmaya gerek kalmaz
})
export class ProductsModule {}