import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
import { OrdersService } from './orders.service';
import type { Response } from 'express'; 

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 1. Mobil Uygulamadan Gelen Siparişi Kaydet
  @Post()
  async createOrder(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }

  // 👑 YENİ: Adminin tüm siparişleri çekmesi için kapı
  @Get()
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  // 👑 YENİ: Siparişi Onaylamak / İptal Etmek için kapı
  @Post(':orderCode/status')
  async updateOrderStatus(@Param('orderCode') orderCode: string, @Body('status') status: string) {
    return this.ordersService.updateOrderStatus(orderCode, status);
  }

  // 2. WhatsApp'taki Linke Tıklanınca Açılacak Olan GÖRSEL WEB SAYFASI
  @Get('view/:orderCode')
  async viewOrder(@Param('orderCode') orderCode: string, @Res() res: Response) {
    try {
      const order = await this.ordersService.getOrderWithDetails(orderCode);
      const BACKEND_URL = 'http://10.102.143.129:3000'; // Resimlerin yüklenmesi için IP adresin

      // Siparişteki her ürün için HTML şablonu oluşturuyoruz
      let itemsHtml = '';
      order.items.forEach((item) => {
        
        // 🛠️ FOTOĞRAF DÜZELTME OPERASYONU (KIRILMAZ LİNK ALGORİTMASI)
        let imgUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500'; // Varsayılan görsel
        let dbPath = item.product.imageUrl;

        if (dbPath) {
          // 1. Windows ters slash (\) işaretlerini normal slash (/) yap
          dbPath = dbPath.replace(/\\/g, '/');

          if (dbPath.startsWith('http')) {
            imgUrl = dbPath; // Zaten tam linkse dokunma
          } else {
            // 2. İçinde 'uploads' kelimesi geçmiyorsa zorla ekle
            if (!dbPath.includes('uploads')) {
              dbPath = `uploads/${dbPath}`;
            }
            // 3. Başında '/' yoksa zorla ekle
            if (!dbPath.startsWith('/')) {
              dbPath = `/${dbPath}`;
            }
            
            // 🚀 İŞTE HAYAT KURTARAN O SATIR (BOŞLUK VE TÜRKÇE HARF ÇÖZÜCÜ)
            const rawUrl = `${BACKEND_URL}${dbPath}`;
            imgUrl = encodeURI(rawUrl); 
          }
        }

        // 🖼️ ÜRÜN KARTI TASARIMI
        itemsHtml += `
          <div style="display: flex; align-items: center; border-bottom: 1px solid #eee; padding: 15px 0;">
            <div style="flex-shrink: 0; width: 80px; height: 110px; margin-right: 15px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); background-color: #f9f9f9;">
               <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Ürün Fotoğrafı" onerror="this.src='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500'" />
            </div>
            <div style="flex: 1;">
              <h3 style="margin: 0 0 5px 0; font-size: 16px; text-transform: uppercase;">${item.product.name_tr}</h3>
              <p style="margin: 0 0 3px 0; color: #666; font-size: 13px;">🔖 Kod: <b>${item.product.productCode}</b></p>
              <p style="margin: 0 0 3px 0; color: #666; font-size: 13px;">🎨 Renk: ${item.color} | 📏 Seri: ${item.size}</p>
              <p style="margin: 0; color: #e11d48; font-size: 13px; font-weight: bold;">📦 ${item.quantity} Adet</p>
            </div>
            <div style="text-align: right;">
              <h4 style="margin: 0; font-size: 16px;">₺${item.unitPrice.toLocaleString('tr-TR')}</h4>
            </div>
          </div>
        `;
      });

      // Ana Web Sayfası Tasarımı (Kurumsal Fatura Görünümü)
      const html = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MUTA Sipariş - ${order.orderCode}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 20px; margin: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 28px; letter-spacing: 8px; font-weight: 300; }
            .order-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
            .order-info p { margin: 6px 0; font-size: 14px; color: #334155; }
            .total-box { background: #111; color: #fff; text-align: right; padding: 20px; border-radius: 8px; margin-top: 25px; }
            .total-box h2 { margin: 0; font-size: 22px; font-weight: 600; }
            .total-box p { margin: 5px 0 0 0; font-size: 12px; opacity: 0.8; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MUTΛ</h1>
              <p style="color: #666; margin-top: 5px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">DİJİTAL SİPARİŞ FİŞİ</p>
            </div>
            
            <div class="order-info">
              <p>🧾 <strong>Sipariş Kodu:</strong> ${order.orderCode}</p>
              <p>📅 <strong>Tarih:</strong> ${new Date(order.createdAt).toLocaleString('tr-TR')}</p>
              <p>📱 <strong>Müşteri No:</strong> ${order.user.phone}</p>
              <p>⏳ <strong>Durum:</strong> <span style="color: #d97706; font-weight: bold;">${order.status}</span></p>
            </div>

            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Sipariş Edilen Ürünler</h3>
            
            ${itemsHtml}
            
            <div class="total-box">
              <p>GENEL TOPLAM</p>
              <h2>₺${order.totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</h2>
            </div>
          </div>
        </body>
        </html>
      `;

      res.send(html); 
    } catch (error) {
      res.status(404).send("<h2 style='text-align:center; font-family:sans-serif; margin-top:50px;'>⚠️ Sipariş Bulunamadı</h2>");
    }
  }

  // 🚀 YENİ: Mobil uygulamadan kullanıcının geçmiş siparişlerini çekmek için kapı
  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    return this.ordersService.getUserOrders(Number(userId));
  }
}