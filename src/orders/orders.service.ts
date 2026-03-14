import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrdersService {
  private prisma = new PrismaClient(); // Veritabanı bağlantısı

  async createOrder(data: any) {
    // Rastgele havalı bir sipariş kodu üretiyoruz (Örn: SIP-8492)
    const orderCode = `SIP-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await this.prisma.order.create({
      data: {
        orderCode: orderCode,
        userId: data.userId, 
        totalPrice: data.totalPrice,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });

    return { orderCode: order.orderCode };
  }

  async getOrderWithDetails(orderCode: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderCode },
      include: {
        user: true, // Müşteri numarası için
        items: {
          include: {
            product: true, // Ürünün fotoğrafı ve adı için
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Sipariş bulunamadı!');
    return order;
  }

  // 🚀 YENİ EKLENDİ: Belirli bir müşterinin tüm geçmiş siparişlerini getir
  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }, // En yeniler (son siparişler) en üstte görünsün
      include: {
        items: {
          include: { product: true } // Fişte fotoğraf ve isimleri göstermek için ürün detaylarını da çekiyoruz
        }
      }
    });
  }

  // 👑 YENİ EKLENDİ: ADMİN İÇİN TÜM SİPARİŞLERİ GETİRİR
  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true } // Müşterinin telefon numarasını görmek için
    });
  }

  // 👑 YENİ EKLENDİ: SİPARİŞ DURUMUNU GÜNCELLE (Örn: BEKLIYOR -> ONAYLANDI)
  async updateOrderStatus(orderCode: string, status: string) {
    return this.prisma.order.update({
      where: { orderCode },
      data: { status }
    });
  }
}