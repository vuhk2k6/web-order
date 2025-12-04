/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/db');
const { MenuItem } = require('../src/models/MenuItem');
const { Table } = require('../src/models/Table');
const { Promotion } = require('../src/models/Promotion');
const { OnlinePaymentMethod } = require('../src/models/OnlinePaymentMethod');
const { Customer } = require('../src/models/Customer');
const { Member } = require('../src/models/Member');

const seedDatabase = async () => {
  try {
    await connectDatabase();

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

    // Thực đơn mẫu
    const menuItems = await MenuItem.insertMany([
      {
        name: 'Bò bít tết sốt tiêu đen',
        price: 250000,
        description:
          'Thăn bò Úc nướng vừa chín tới, sốt tiêu đen, phục vụ kèm khoai tây và salad.',
        image: ''
      },
      {
        name: 'Mì Ý hải sản sốt cà chua',
        price: 185000,
        description: 'Mì Ý tươi với tôm, mực và nghêu, sốt cà chua tươi và lá basil.',
        image: ''
      },
      {
        name: 'Salad Caesar gà nướng',
        price: 125000,
        description: 'Xà lách Romaine, phô mai Parmesan, sốt Caesar và ức gà nướng.',
        image: ''
      },
      {
        name: 'Súp bí đỏ kem tươi',
        price: 85000,
        description: 'Súp bí đỏ béo nhẹ với kem tươi, dùng nóng.',
        image: ''
      },
      {
        name: 'Trà đào cam sả',
        price: 65000,
        description: 'Trà đen ủ lạnh, đào miếng, cam tươi và sả.',
        image: ''
      },
      {
        name: 'Tiramisu',
        price: 95000,
        description: 'Bánh Tiramisu kiểu Ý với mascarpone và cà phê espresso.',
        image: ''
      }
    ]);

    console.log(`Inserted ${menuItems.length} menu items.`);

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


