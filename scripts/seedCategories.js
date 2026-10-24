const mongoose = require('mongoose');
require('dotenv').config();
const { connectDatabase } = require('../src/config/db');
const { Category } = require('../src/models/Category');

const categories = [
  { name: 'Combo', description: 'Các combo tiết kiệm' },
  { name: 'Khai vị', description: 'Các món khai vị' },
  { name: 'Món chính', description: 'Các món chính' },
  { name: 'Thức uống', description: 'Đồ uống các loại' },
  { name: 'Tráng miệng', description: 'Các món tráng miệng' },
  { name: 'Món chay', description: 'Các món ăn chay' }
];

async function seedCategories() {
  try {
    await connectDatabase();
    console.log('Đã kết nối MongoDB');

    // Clear existing categories (optional - comment out if you want to keep existing)
    // await Category.deleteMany({});
    // console.log('Đã xóa các danh mục cũ');

    // Insert categories
    for (const catData of categories) {
      const existing = await Category.findOne({ name: catData.name });
      if (!existing) {
        await Category.create(catData);
        console.log(`✓ Đã tạo danh mục: ${catData.name}`);
      } else {
        console.log(`- Danh mục "${catData.name}" đã tồn tại, bỏ qua`);
      }
    }

    console.log('\n✓ Hoàn tất seed categories!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed categories:', error);
    process.exit(1);
  }
}

seedCategories();





