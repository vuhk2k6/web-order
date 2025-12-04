/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/db');
const { Dish } = require('../src/models/Dish');
const { Category } = require('../src/models/Category');
const { Table } = require('../src/models/Table');
const { Promotion } = require('../src/models/Promotion');
const { OnlinePaymentMethod } = require('../src/models/OnlinePaymentMethod');
const { Customer } = require('../src/models/Customer');
const { Member } = require('../src/models/Member');

const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');
    await connectDatabase();
    console.log('Database connected.');

    // Xóa toàn bộ dữ liệu trong database hiện tại
    await mongoose.connection.dropDatabase();
    console.log('Database cleared.');

    // Tạo khách hàng mẫu + thành viên
    const demoCustomer = await Customer.create({
      name: 'Nguyễn Văn A',
      email: 'demo@example.com',
      phone: '0900000000',
      passwordHash: 'demo-password-hash',
      accountType: 'THANH_VIEN'
    });

    await Member.create({
      customer: demoCustomer._id,
      points: 120,
      tier: 'GOLD',
      totalSpent: 5000000
    });

    // Tạo danh mục món ăn
    const categories = await Category.insertMany([
      {
        name: 'Món chính',
        description: 'Các món ăn chính của nhà hàng'
      },
      {
        name: 'Khai vị',
        description: 'Các món khai vị và salad'
      },
      {
        name: 'Thức uống',
        description: 'Các loại thức uống'
      },
      {
        name: 'Tráng miệng',
        description: 'Các món tráng miệng'
      }
    ]);

    console.log(`Inserted ${categories.length} categories.`);

    // Thực đơn mẫu
    const mainCourseCategory = categories.find(c => c.name === 'Món chính');
    const appetizerCategory = categories.find(c => c.name === 'Khai vị');
    const drinkCategory = categories.find(c => c.name === 'Thức uống');
    const dessertCategory = categories.find(c => c.name === 'Tráng miệng');

    const dishes = await Dish.insertMany([
      {
        category: mainCourseCategory._id,
        name: 'Bò bít tết sốt tiêu đen',
        price: 250000,
        description:
          'Thăn bò Úc nướng vừa chín tới, sốt tiêu đen, phục vụ kèm khoai tây và salad.',
        imageUrl: '',
        status: 'CON'
      },
      {
        category: mainCourseCategory._id,
        name: 'Mì Ý hải sản sốt cà chua',
        price: 185000,
        description: 'Mì Ý tươi với tôm, mực và nghêu, sốt cà chua tươi và lá basil.',
        imageUrl: '',
        status: 'CON'
      },
      {
        category: appetizerCategory._id,
        name: 'Salad Caesar gà nướng',
        price: 125000,
        description: 'Xà lách Romaine, phô mai Parmesan, sốt Caesar và ức gà nướng.',
        imageUrl: '',
        status: 'CON'
      },
      {
        category: appetizerCategory._id,
        name: 'Súp bí đỏ kem tươi',
        price: 85000,
        description: 'Súp bí đỏ béo nhẹ với kem tươi, dùng nóng.',
        imageUrl: '',
        status: 'CON'
      },
      {
        category: drinkCategory._id,
        name: 'Trà đào cam sả',
        price: 65000,
        description: 'Trà đen ủ lạnh, đào miếng, cam tươi và sả.',
        imageUrl: '',
        status: 'CON'
      },
      {
        category: dessertCategory._id,
        name: 'Tiramisu',
        price: 95000,
        description: 'Bánh Tiramisu kiểu Ý với mascarpone và cà phê espresso.',
        imageUrl: '',
        status: 'CON'
      }
    ]);

    console.log(`Inserted ${dishes.length} dishes.`);

    // Bàn ăn mẫu
    const tables = await Table.insertMany([
      {
        name: 'Bàn 1',
        seats: 2,
        location: 'Tầng trệt - Gần cửa sổ'
      },
      {
        name: 'Bàn 2',
        seats: 4,
        location: 'Tầng trệt - Khu trung tâm'
      },
      {
        name: 'Bàn 3',
        seats: 6,
        location: 'Lầu 1 - Góc riêng tư'
      },
      {
        name: 'Bàn 4',
        seats: 8,
        location: 'Lầu 1 - Phòng riêng'
      }
    ]);

    console.log(`Inserted ${tables.length} tables.`);

    // Khuyến mãi mẫu
    const promotions = await Promotion.insertMany([
      {
        name: 'Combo nhóm bạn',
        discountType: 'PERCENT',
        value: 15,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        minOrderAmount: 800000
      },
      {
        name: 'Ưu đãi giờ vàng',
        discountType: 'AMOUNT',
        value: 50000,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        minOrderAmount: 300000
      }
    ]);

    console.log(`Inserted ${promotions.length} promotions.`);

    // Phương thức thanh toán online mẫu
    const paymentMethods = await OnlinePaymentMethod.insertMany([
      { name: 'Momo', isActive: true },
      { name: 'ZaloPay', isActive: true },
      { name: 'Thẻ tín dụng', isActive: true }
    ]);

    console.log(`Inserted ${paymentMethods.length} online payment methods.`);

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error while seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();


