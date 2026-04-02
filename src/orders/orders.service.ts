import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrdersService {
  private prisma = new PrismaClient(); 

  async createOrder(data: any) {
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
        user: true, 
        items: {
          include: {
            product: {
              include: {
                colors: true 
              }
            }, 
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Sipariş bulunamadı!');
    return order;
  }

  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }, 
      include: {
        items: {
          include: { 
            product: {
              include: { colors: true } 
            } 
          } 
        }
      }
    });
  }

  // 👑 🚀 GÜNCELLENDİ: Admin sipariş listesinde artık ürün fotoğrafları ve detayları da çekiliyor!
  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        user: true, // Müşteri numarasını getir
        items: {    // 🚀 Siparişin içindeki ürünleri getir
          include: {
            product: { // O ürünlerin ana bilgilerini getir
              include: {
                colors: true // Ve tabii ki resimlerin olduğu renk bilgisini getir
              }
            }
          }
        }
      } 
    });
  }

  async updateOrderStatus(orderCode: string, status: string) {
    return this.prisma.order.update({
      where: { orderCode },
      data: { status }
    });
  }

  async deleteOrder(orderId: number) {
    try {
      await this.prisma.orderItem.deleteMany({
        where: { orderId: orderId },
      });

      const deletedOrder = await this.prisma.order.delete({
        where: { id: orderId },
      });

      return { message: 'Sipariş ve detayları başarıyla silindi', deletedOrder };
    } catch (error) {
      console.error('Sipariş silinirken hata:', error);
      throw new NotFoundException('Sipariş silinemedi veya sistemde bulunamadı.');
    }
  }
}