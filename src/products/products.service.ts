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
          colors: true 
        }
      });
    } catch (error: any) {
      console.error('❌ MUTA VERİTABANI HATASI (Listeleme):', error.message);
      throw error;
    }
  }

  // 2. YENİ ÜRÜN OLUŞTUR (İndirim Yüzdesi Eklendi)
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
          
          // 🚀 YENİ: Mobilden gelen indirim veritabanına işleniyor
          discountPercentage: data.discountPercentage ? Number(data.discountPercentage) : 0,

          sizes: data.sizes || 'Seri 1',
          category: data.category || 'Genel',
          productType: data.productType || 'Giyim',
          brand: data.brand || 'MUTΛ',
          
          colors: {
            create: data.colorsData 
          }
        },
        include: { colors: true }
      });

      console.log(`✅ MUTA SİSTEMİ: Ürün ve ${data.colorsData?.length || 0} farklı renk başarıyla kaydedildi (ID: ${newProduct.id})`);
      return newProduct;

    } catch (error: any) {
      console.error('❌ MUTA VERİTABANI HATASI (Kayıt):', error.message);
      throw error;
    }
  }

  // 🚀 YENİ: 3. MEVCUT ÜRÜNÜ GÜNCELLE (Düzenleme Modu)
  async updateProduct(id: number, data: any) {
    try {
      console.log(`📦 MUTA SİSTEMİ: Ürün güncelleme başlatıldı -> ID: ${id}`);

      const updatedProduct = await this.prisma.product.update({
        where: { id: id },
        data: {
          productCode: data.productCode,
          name_tr: data.name_tr,
          name_en: data.name_en,
          name_ar: data.name_ar,
          priceUSD: data.priceUSD ? Number(data.priceUSD) : undefined, 
          priceTRY: data.priceTRY ? Number(data.priceTRY) : undefined,
          
          // 🚀 YENİ: İndirim Yüzdesi güncelleniyor
          discountPercentage: data.discountPercentage !== undefined ? Number(data.discountPercentage) : undefined,

          sizes: data.sizes,
          category: data.category,
          productType: data.productType,
          brand: data.brand,
        },
        include: { colors: true }
      });

      console.log(`✅ MUTA SİSTEMİ: Ürün başarıyla güncellendi (ID: ${id})`);
      return updatedProduct;

    } catch (error: any) {
      console.error('❌ MUTA VERİTABANI HATASI (Güncelleme):', error.message);
      throw error;
    }
  }

  // 4. ADMIN: ÜRÜNÜ SİL
  async deleteProduct(id: number) {
    try {
      await this.prisma.orderItem.deleteMany({
        where: { productId: id },
      });

      const deletedProduct = await this.prisma.product.delete({
        where: { id: id },
      });

      return deletedProduct;
    } catch (error: any) {
      console.error('❌ MUTA VERİTABANI HATASI (Silme): ', error.message);
      throw new Error('Ürün silinemedi.');
    }
  }

  // 5. ADMIN: STOK DURUMUNU GÜNCELLE
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