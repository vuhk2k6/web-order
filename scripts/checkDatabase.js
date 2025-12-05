/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/db');
const { Dish } = require('../src/models/Dish');

const checkDatabase = async () => {
  try {
    await connectDatabase();
    console.log('=== KIỂM TRA DATABASE ===\n');
    
    const count = await Dish.countDocuments();
    console.log(`Số lượng món ăn trong database: ${count}\n`);
    
    if (count > 0) {
      const items = await Dish.find().limit(3).lean();
      console.log('Mẫu dữ liệu (3 món đầu):\n');
      items.forEach((item, idx) => {
        console.log(`Món ${idx + 1}:`);
        console.log('  _id:', item._id);
        console.log('  name:', item.name);
        console.log('  price:', item.price);
        console.log('  imageUrl:', item.imageUrl || '(trống)');
        console.log('  category:', item.category);
        console.log('');
      });
    } else {
      console.log('⚠️ Database trống! Vui lòng chạy: npm run db:seed\n');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
};

checkDatabase();

