/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/db');
const { MenuItem } = require('../src/models/MenuItem');

const dishImages = [
  {
    name: 'Salad Ức Gà Áp Chảo Sốt Mè Rang',
    slug: 'salad-uc-ga-ap-chao',
    url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Salad Cá Hồi Nauy Bơ Sáp',
    slug: 'salad-ca-hoi-nauy-bo-sap',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Salad Tôm Quinoa & Rau Chân Vịt',
    slug: 'salad-tom-quinoa',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Gỏi Cuốn Tôm Gà Bánh Tráng Gạo Lứt',
    slug: 'goi-cuon-tom-ga',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Súp Bí Đỏ Hạnh Nhân Kem Hạt Sen',
    slug: 'sup-bi-do-hanh-nhan',
    url: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Poke Bowl Cá Hồi Gạo Lứt Sốt Teriyaki',
    slug: 'poke-bowl-ca-hoi',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Thăn Bò Úc Áp Chảo Rau Củ Nướng',
    slug: 'than-bo-uc-ap-chao',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Ức Gà Nướng Mật Ong Kèm Khoai Lang Nghiền',
    slug: 'uc-ga-nuong-mat-ong',
    url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Cơm Gạo Lứt Ức Gà Sốt Nấm Truffle',
    slug: 'com-gao-lut-uc-ga-nam',
    url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Đậu Hũ Non Áp Chảo Sốt Nấm Hương Đông Cô',
    slug: 'dau-hu-non-ap-chao',
    url: 'https://images.unsplash.com/photo-1546069901-d7790f9b6b91?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Bún Gạo Lứt Xào Bò Rau Củ Ngũ Sắc',
    slug: 'bun-gao-lut-xao-bo',
    url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Mì Nưa Shirataki Trộn Tôm Trứng Lòng Đào',
    slug: 'mi-nua-shirataki-tom',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Mì Ý Lúa Mì Nguyên Cám Sốt Pesto Húng Tây',
    slug: 'mi-y-nguyen-cam-pesto',
    url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Phở Gạo Lứt Gà Ta Nước Dùng Rau Củ',
    slug: 'pho-gao-lut-ga-ta',
    url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Sinh Tố Green Detox Cải Kale & Bơ Sáp',
    slug: 'sinh-to-green-detox-kale',
    url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Nước Ép Cần Tây Táo Xanh & Gừng Ép Lạnh',
    slug: 'nuoc-ep-can-tay-tao-xanh',
    url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Nước Ép Củ Dền Cà Rốt & Cam Tươi',
    slug: 'nuoc-ep-cu-den-ca-rot',
    url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Trà Trái Cây Nhiệt Đới Hạt Chia Ủ Lạnh',
    slug: 'tra-trai-cay-hat-chia',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Sữa Chua Hy Lạp Granola Quả Mọng',
    slug: 'sua-chua-hy-lap-granola',
    url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Pudding Hạt Chia Sữa Yến Mạch Mâm Xôi',
    slug: 'pudding-hat-chia-mam-xoi',
    url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80'
  }
];

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  const uploadDir = path.join(__dirname, '..', 'src', 'public', 'uploads', 'menu');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  await connectDatabase();
  console.log('Connected to DB, downloading images...');

  for (const item of dishImages) {
    const filename = `${item.slug}.jpg`;
    const dest = path.join(uploadDir, filename);
    const localUrl = `/uploads/menu/${filename}`;

    try {
      console.log(`Downloading image for: ${item.name}...`);
      await downloadFile(item.url, dest);
      console.log(`Saved: ${localUrl}`);

      const result = await MenuItem.updateOne(
        { name: item.name },
        { $set: { image: localUrl } }
      );
      console.log(`Updated DB for "${item.name}": matched ${result.matchedCount}, modified ${result.modifiedCount}`);
    } catch (err) {
      console.error(`Error processing "${item.name}":`, err.message);
    }
  }

  console.log('=== ALL 20 DISH IMAGES DOWNLOADED AND DATABASE UPDATED ===');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
