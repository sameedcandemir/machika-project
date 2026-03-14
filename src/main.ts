import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // 🚀 EKLENDİ: Express yetenekleri için
import * as path from 'path';

async function bootstrap() {
  // PRISMA 7 KRİTİK AYAR: 
  // Veritabanı yolunu motor ayağa kalkmadan sisteme enjekte ediyoruz.
  const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  process.env.DATABASE_URL = `file:${dbPath.replace(/\\/g, '/')}`;

  // 🚀 GÜNCELLEME: NestJS'i Express tabanlı çalıştırdığımızı belirtiyoruz ki fotoğrafları sunabilelim
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // MUTA Mobil uygulaması ile iletişim için CORS şart.
  app.enableCors(); 

  // 📸 MUTA VİTRİNİ: 'uploads' klasörünü dış dünyaya açıyoruz!
  // Bu sayede mobil uygulama fotoğrafları http://IP:3000/uploads/muta-resim.jpg şeklinde çekebilecek.
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // MUTA Markasına Özel Profesyonel Başlangıç Logları
  console.log('\n-------------------------------------------');
  console.log('🚀 MUTA BACKEND SİSTEMİ ATEŞLENDİ');
  console.log(`📡 Servis Adresi: http://localhost:${port}`);
  console.log(`📂 Veritabanı: ${process.env.DATABASE_URL}`);
  console.log('📸 Dosya Sunucusu: /uploads klasörü dışa açıldı'); // Log eklendi
  console.log('🛠️ Geliştirici: Candemir Yazılım');
  console.log('-------------------------------------------\n');
  
  Logger.log(`MUTA Uygulaması ${port} portu üzerinden yayında!`, 'Bootstrap');
}
bootstrap();