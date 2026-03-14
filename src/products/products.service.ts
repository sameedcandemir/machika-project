import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // 1. TÜM ÜRÜNLERİ GETİR (HomeScreen İçin)
  async findAll() {
    try {
      console.log('📡 MUTA SİSTEMİ: Ürün listesi talebi alındı.');
      
      // En son eklenen ürünün en üstte görünmesi için 'desc' (azalan) sıralama yapıyoruz
      return await (this.prisma as any).product.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('❌ MUTA VERİTABANI HATASI (Listeleme):', error.message);
      throw error;
    }
  }

  // 2. YENİ ÜRÜN OLUŞTUR (Admin Paneli İçin)
  async create(data: any) {
    try {
      console.log(`📦 MUTA SİSTEMİ: Ürün kaydı başlatıldı -> ${data.productCode}`);

      // 🚀 GÜNCELLENDİ: Artık mobilden gelen TÜM verileri (Seriler, Renkler, Marka, TL Fiyatı) veritabanına yazıyoruz!
      const newProduct = await (this.prisma as any).product.create({
        data: {
          productCode: data.productCode,
          name_tr: data.name_tr,
          name_en: data.name_en || '',
          name_ar: data.name_ar || '',
          priceUSD: Number(data.priceUSD), 
          priceTRY: Number(data.priceTRY || 0), // ₺ YENİ
          imageUrl: data.imageUrl || null, 
          stockStatus: data.stockStatus !== undefined ? Number(data.stockStatus) : 1,
          
          // 📦 YENİ EKLENEN VARYASYON VE FİLTRELEME ALANLARI
          sizes: data.sizes || 'Seri 1',
          colors: data.colors || '#000000',
          category: data.category || 'Genel',
          productType: data.productType || 'Giyim',
          brand: data.brand || 'MUTΛ',
        },
      });

      console.log(`✅ MUTA SİSTEMİ: Ürün başarıyla kaydedildi (ID: ${newProduct.id})`);
      return newProduct;

    } catch (error) {
      console.error('❌ MUTA VERİTABANI HATASI (Kayıt):', error.message);
      throw error;
    }
  }

  // 👑 3. ADMIN: ÜRÜNÜ SİL
  // 👑 3. ADMIN: ÜRÜNÜ SİL
  async deleteProduct(id: number) {
    try {
      // 🚀 YENİ HAMLE: Önce bu ürünün kayıtlı olduğu sipariş satırlarını (OrderItem) siliyoruz.
      // (Böylece veritabanı "Foreign Key" hatası vermeyecek)
      await this.prisma.orderItem.deleteMany({
        where: { productId: id },
      });

      // 🗑️ Sonra ürünün kendisini tertemiz siliyoruz.
      const deletedProduct = await this.prisma.product.delete({
        where: { id: id },
      });

      return deletedProduct;
    } catch (error: any) {
      console.error('❌ MUTA VERİTABANI HATASI (Silme): ', error.message);
      throw new Error('Ürün silinemedi, ID bulunamamış veya bağlantılı kayıtlar temizlenememiş olabilir.');
    }
  }

  // 👑 4. ADMIN: STOK DURUMUNU GÜNCELLE
  async updateStock(id: number, stockStatus: number) {
    try {
      const updatedProduct = await (this.prisma as any).product.update({
        where: { id: id },
        data: { stockStatus: stockStatus },
      });
      console.log(`📦 MUTA SİSTEMİ: Stok güncellendi (ID: ${id}) -> Yeni Durum: ${stockStatus === 1 ? 'Var' : 'Tükendi'}`);
      return updatedProduct;
    } catch (error) {
      console.error('❌ MUTA VERİTABANI HATASI (Stok Güncelleme):', error.message);
      throw new Error('Stok güncellenemedi.');
    }
  }
}