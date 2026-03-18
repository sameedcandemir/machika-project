import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // 1. TÜM ÜRÜNLERİ GETİR (Renkleri ve resimleriyle birlikte)
  async findAll() {
    try {
      console.log('📡 MUTA SİSTEMİ: Ürün listesi talebi alındı.');
      
      return await this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: { 
          colors: true // 🎨 YENİ: Artık ürünler listelenirken renkleri ve Cloudinary resim URL'leri de gelecek!
        }
      });
    } catch (error: any) {
      console.error('❌ MUTA VERİTABANI HATASI (Listeleme):', error.message);
      throw error;
    }
  }

  // 2. YENİ ÜRÜN OLUŞTUR (Varyasyonlu Yapı)
  async create(data: any) {
    try {
      console.log(`📦 MUTA SİSTEMİ: Ürün kaydı başlatıldı -> ${data.productCode}`);

      const newProduct = await this.prisma.product.create({
        data: {
          productCode: data.productCode,
          name_tr: data.name_tr,
          name_en: data.name_en || '',
          name_ar: data.name_ar || '',
          priceUSD: Number(data.priceUSD), 
          priceTRY: Number(data.priceTRY || 0), 
          stockStatus: data.stockStatus !== undefined ? Number(data.stockStatus) : 1,
          sizes: data.sizes || 'Seri 1',
          category: data.category || 'Genel',
          productType: data.productType || 'Giyim',
          brand: data.brand || 'MUTΛ',
          
          // 🎨 YENİ SİHİR BURADA: Ürün oluşturulurken, ona bağlı renkler de aynı anda ProductColor tablosuna yazılıyor.
          colors: {
            create: data.colorsData // Controller'dan gelen dizi (Array) buraya dökülüyor.
          }
        },
        include: { colors: true }
      });

      console.log(`✅ MUTA SİSTEMİ: Ürün ve ${data.colorsData.length} farklı renk başarıyla kaydedildi (ID: ${newProduct.id})`);
      return newProduct;

    } catch (error: any) {
      console.error('❌ MUTA VERİTABANI HATASI (Kayıt):', error.message);
      throw error;
    }
  }

  // 3. ADMIN: ÜRÜNÜ SİL
  async deleteProduct(id: number) {
    try {
      await this.prisma.orderItem.deleteMany({
        where: { productId: id },
      });

      // Product silindiğinde, ProductColor tablosundaki o ürüne ait renkler de Prisma "Cascade" sayesinde otomatik silinecek!
      const deletedProduct = await this.prisma.product.delete({
        where: { id: id },
      });

      return deletedProduct;
    } catch (error: any) {
      console.error('❌ MUTA VERİTABANI HATASI (Silme): ', error.message);
      throw new Error('Ürün silinemedi.');
    }
  }

  // 4. ADMIN: STOK DURUMUNU GÜNCELLE
  async updateStock(id: number, stockStatus: number) {
    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id: id },
        data: { stockStatus: stockStatus },
      });
      console.log(`📦 MUTA SİSTEMİ: Stok güncellendi (ID: ${id}) -> Yeni Durum: ${stockStatus === 1 ? 'Var' : 'Tükendi'}`);
      return updatedProduct;
    } catch (error: any) {
      console.error('❌ MUTA VERİTABANI HATASI (Stok Güncelleme):', error.message);
      throw new Error('Stok güncellenemedi.');
    }
  }
}