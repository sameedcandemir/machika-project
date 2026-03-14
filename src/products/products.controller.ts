import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Delete, Param, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 1. TÜM ÜRÜNLERİ LİSTELE
  @Get()
  async getAllProducts() {
    return await this.productsService.findAll();
  }

  // 2. 📸 FOTOĞRAFLI YENİ ÜRÜN EKLE (MUTA VİTRİN)
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads', 
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `muta-${uniqueSuffix}${ext}`);
      }
    })
  }))
  async createProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    console.log(`📱 MUTA SİSTEMİ: Yeni ürün yükleniyor -> ${body.productCode}`);
    
    const imageUrl = file ? `/uploads/${file.filename}` : null;

    // ⚠️ KRİTİK DÜZELTME: FormData her şeyi 'String' (Metin) olarak gönderir.
    // Veritabanı (Prisma) ise priceUSD ve priceTRY için 'Float' (Sayı) bekler.
    // Bu yüzden gelen fiyat metinlerini parseFloat ile sayıya çeviriyoruz!
    const productData = {
      ...body,
      priceUSD: parseFloat(body.priceUSD),
      priceTRY: parseFloat(body.priceTRY || '0'), // Eğer TL fiyatı boşsa 0 kaydet
      imageUrl: imageUrl, 
    };

    const newProduct = await this.productsService.create(productData);
    
    return {
      message: 'Ürün MUTA veritabanına başarıyla işlendi.',
      data: newProduct
    };
  }

  // 👑 3. ADMIN: ÜRÜNÜ SİL
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    console.log(`🗑️ MUTA SİSTEMİ: Ürün siliniyor -> ID: ${id}`);
    return await this.productsService.deleteProduct(Number(id));
  }

  // 👑 4. ADMIN: STOK DURUMUNU GÜNCELLE (Tükendi / Var)
  @Patch(':id')
  async updateStockStatus(@Param('id') id: string, @Body() body: { stockStatus: number }) {
    console.log(`📦 MUTA SİSTEMİ: Stok güncelleniyor -> ID: ${id}, Yeni Durum: ${body.stockStatus}`);
    return await this.productsService.updateStock(Number(id), body.stockStatus);
  }
}