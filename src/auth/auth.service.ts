import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // AŞAMA 1: SMS Gönder (Kod Üret ve Veritabanına Yaz)
  async sendOtp(phone: string) {
    // 1. 6 haneli rastgele bir OTP kodu üret
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Veritabanında numarayı bul, yoksa yeni müşteri olarak kaydet
    // DİKKAT: Eğer kullanıcı zaten varsa 'role' kısmına dokunmaz, sadece kodu günceller.
    await (this.prisma as any).user.upsert({
      where: { phone },
      update: { otpCode },
      create: { 
        phone, 
        otpCode, 
        role: 'CUSTOMER' // Yeni kayıt olan herkes müşteri olarak başlar
      },
    });

    // 3. SMS Gönderme Simülasyonu
    console.log(`--------------------------------------------------`);
    console.log(`✉️  MUTA SMS SERVİSİ: [ ${phone} ]`);
    console.log(`🔑 GÜVENLİK KODU: [ ${otpCode} ]`);
    console.log(`--------------------------------------------------`);

    return { success: true, message: 'Doğrulama kodu gönderildi.' };
  }

  // AŞAMA 2: Kodu Doğrula
  async verifyOtp(phone: string, code: string) {
    // 1. Kullanıcıyı en güncel haliyle (Rolü dahil) veritabanından bul
    const user = await (this.prisma as any).user.findUnique({
      where: { phone },
    });

    // 2. Güvenlik Kontrolleri
    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı!');
    }

    if (user.otpCode !== code) {
      console.error(`❌ MUTA GÜVENLİK: ${phone} için hatalı kod denemesi!`);
      throw new BadRequestException('Hatalı veya süresi dolmuş kod!');
    }

    // 3. Kod doğruysa veritabanındaki kodu temizle (Tek kullanımlık güvenlik)
    await (this.prisma as any).user.update({
      where: { phone },
      data: { otpCode: null },
    });

    console.log(`✅ MUTA GÜVENLİK: ${phone} başarıyla doğrulandı.`);
    console.log(`🛡️  YETKİ SEVİYESİ: [ ${user.role} ]`);

    // 4. KRİTİK: Rolü ve Kullanıcı bilgisini dön
    return { 
      success: true, 
      message: 'Giriş başarılı.', 
      role: user.role, // HomeScreen'deki '+' butonunu bu satır açar!
      phone: user.phone 
    };
  }
}