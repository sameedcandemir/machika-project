import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Önce varsa eski ürünleri temizleyelim (isteğe bağlı)
  await prisma.product.deleteMany();

  const products = [
    {
      productCode: 'MUTA-PH-01',
      name_tr: 'MUTA X1 Pro',
      name_en: 'MUTA X1 Pro',
      name_ar: 'ميوتا إكس 1 برو',
      priceUSD: 999.0,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500',
    },
    {
      productCode: 'MUTA-LP-02',
      name_tr: 'MUTA Book Air',
      name_en: 'MUTA Book Air',
      name_ar: 'ميوتا بوك إير',
      priceUSD: 1499.0,
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=500',
    },
    {
      productCode: 'MUTA-WT-03',
      name_tr: 'MUTA Watch S',
      name_en: 'MUTA Watch S',
      name_ar: 'ميوتا واتش إس',
      priceUSD: 299.0,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500',
    }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ MUTA Vitrini: Ürünler başarıyla yerleştirildi!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());