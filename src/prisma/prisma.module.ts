// backend/src/prisma/prisma.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Bu sayede AuthModule ve diğerleri Prisma'yı kullanabilir
})
export class PrismaModule {}