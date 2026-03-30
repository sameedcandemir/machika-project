import { Controller, Get, Post, Body, UseInterceptors, UploadedFiles, Delete, Param, Patch, BadRequestException } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinary: CloudinaryService 
  ) {}

  @Get()
  async getAllProducts() {
    return await this.productsService.findAll();
  }

  @Post() 
  @UseInterceptors(AnyFilesInterceptor()) 
  async createProduct(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any
  ) {
    console.log(`📱 MUTA SİSTEMİ: Varyasyonlu yeni ürün işleniyor -> ${body.productCode}`);

    let parsedColors: any[] = [];
    try {
      parsedColors = JSON.parse(body.colors || '[]');
    } catch (e) {
      throw new BadRequestException('Renk verileri hatalı formatta (Geçersiz JSON).');
    }

    if (parsedColors.length === 0) {
      throw new BadRequestException('Ürüne en az bir renk varyasyonu eklemelisiniz.');
    }

    const colorsDataToSave: any[] = [];

    for (let i = 0; i < parsedColors.length; i++) {
      const colorInfo = parsedColors[i];
      let image1Url = null;
      let image2Url = null;

      const file1 = files.find(f => f.fieldname === `image_${i}_1`);
      const file2 = files.find(f => f.fieldname === `image_${i}_2`);

      if (file1) {
        const upload1 = await this.cloudinary.uploadImage(file1);
        image1Url = upload1.secure_url;
      }
      
      if (file2) {
        const upload2 = await this.cloudinary.uploadImage(file2);
        image2Url = upload2.secure_url;
      }

      colorsDataToSave.push({
        colorName: colorInfo.colorName,
        colorHex: colorInfo.colorHex || null,
        image1: image1Url,
        image2: image2Url
      });
    }

    const productData = {
      ...body,
      priceUSD: parseFloat(body.priceUSD),
      priceTRY: parseFloat(body.priceTRY || '0'), 
      
      // 🚀 YENİ: Mobilden gelen indirim yüzdesini Controller'da yakalıyoruz
      discountPercentage: body.discountPercentage ? parseInt(body.discountPercentage, 10) : 0,

      colorsData: colorsDataToSave,
    };

    const newProduct = await this.productsService.create(productData);
    
    return {
      message: 'Ürün ve renk varyasyonları MUTA veritabanına başarıyla işlendi.',
      data: newProduct
    };
  }

  @Delete(':id') 
  async deleteProduct(@Param('id') id: string) {
    console.log(`🗑️ MUTA SİSTEMİ: Ürün siliniyor -> ID: ${id}`);
    return await this.productsService.deleteProduct(Number(id));
  }

  // 🚀 GÜNCELLENDİ: Hem Stok Güncellemesini Hem de Ürün Düzenlemeyi (İndirim dahil) Yönetir
  @Patch(':id') 
  @UseInterceptors(AnyFilesInterceptor()) 
  async updateProduct(
    @Param('id') id: string, 
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any
  ) {
    // 1. Senaryo: Sadece Stok Güncellemesi Gelmişse (Eski yapıyı bozmamak için)
    if (body.stockStatus !== undefined && Object.keys(body).length <= 2) {
      console.log(`📦 MUTA SİSTEMİ: Sadece Stok güncelleniyor -> ID: ${id}, Yeni Durum: ${body.stockStatus}`);
      return await this.productsService.updateStock(Number(id), Number(body.stockStatus));
    }

    // 2. Senaryo: Mobilden Kapsamlı Ürün Güncellemesi (İndirim, Fiyat, İsim vs.) Gelmişse
    console.log(`📝 MUTA SİSTEMİ: Ürün detayları düzenleniyor -> ID: ${id}`);
    
    const updateData = {
      ...body,
      // Eğer fiyatlar geldiyse sayıya çevir
      priceUSD: body.priceUSD ? parseFloat(body.priceUSD) : undefined,
      priceTRY: body.priceTRY ? parseFloat(body.priceTRY) : undefined,
      
      // 🚀 YENİ: İndirim yüzdesi güncelleniyorsa yakala
      discountPercentage: body.discountPercentage !== undefined ? parseInt(body.discountPercentage, 10) : undefined,
    };

    const updatedProduct = await this.productsService.updateProduct(Number(id), updateData);
    
    return {
      message: 'Ürün başarıyla güncellendi.',
      data: updatedProduct
    };
  }
}