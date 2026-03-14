import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Delete, Param, Patch, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // 👈 YENİ: Bulut motorunu çağırdık

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinary: CloudinaryService // 👈 YENİ: Motoru sisteme dahil ettik
  ) {}

  // 1. TÜM ÜRÜNLERİ LİSTELE
  @Get()
  async getAllProducts() {
    return await this.productsService.findAll();
  }

  // 2. 📸 FOTOĞRAFLI YENİ ÜRÜN EKLE (MUTA VİTRİN - CLOUDINARY ENTEGRELİ)
  @Post()
  @UseInterceptors(FileInterceptor('image')) // ⚠️ DİKKAT: diskStorage silindi. Artık dosya uçucu hafızada tutulup direkt buluta gidecek.
  async createProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    console.log(`📱 MUTA SİSTEMİ: Yeni ürün buluta yükleniyor -> ${body.productCode}`);

    if (!file) {
      throw new BadRequestException('Lütfen bir ürün fotoğrafı yükleyin.');
    }

    let imageUrl = null;
    try {
      // 🚀 SİHİRLİ DOKUNUŞ: Fotoğrafı Railway'in içine değil, ömür boyu kalacağı Cloudinary'e yolluyoruz
      const uploadResult = await this.cloudinary.uploadImage(file);
      imageUrl = uploadResult.secure_url; // Cloudinary'nin bize verdiği o güvenli 'https://...' linki
      
      console.log(`✅ MUTA SİSTEMİ: Fotoğraf buluta yüklendi! Link: ${imageUrl}`);
    } catch (error) {
      console.error('Bulut Yükleme Hatası:', error);
      throw new BadRequestException('Fotoğraf yüklenirken bir hata oluştu.');
    }

    // Gelen metinleri (String) sayıya (Float) çeviriyoruz
    const productData = {
      ...body,
      priceUSD: parseFloat(body.priceUSD),
      priceTRY: parseFloat(body.priceTRY || '0'), 
      imageUrl: imageUrl, // Artık local klasör yolu değil, Cloudinary linki kaydediliyor!
    };

    const newProduct = await this.productsService.create(productData);
    
    return {
      message: 'Ürün MUTA veritabanına ve Cloudinary bulutuna başarıyla işlendi.',
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