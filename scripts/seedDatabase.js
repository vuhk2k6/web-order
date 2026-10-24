/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/db');
const { Category } = require('../src/models/Category');
const { Customer } = require('../src/models/Customer');
const { DeliveryAddress } = require('../src/models/DeliveryAddress');
const { DineInOrder } = require('../src/models/DineInOrder');
const { Member } = require('../src/models/Member');
const { MenuItem } = require('../src/models/MenuItem');
const { MenuItemReview } = require('../src/models/MenuItemReview');
const { OnlinePaymentMethod } = require('../src/models/OnlinePaymentMethod');
const { Order } = require('../src/models/Order');
const { OrderItem } = require('../src/models/OrderItem');
const { Payment } = require('../src/models/Payment');
const { PointTransaction } = require('../src/models/PointTransaction');
const { Reservation } = require('../src/models/Reservation');
const { ReservationTable } = require('../src/models/ReservationTable');
const { Table } = require('../src/models/Table');
const { Promotion } = require('../src/models/Promotion');

const models = [
  Category,
  Customer,
  DeliveryAddress,
  DineInOrder,
  Member,
  MenuItem,
  MenuItemReview,
  OnlinePaymentMethod,
  Order,
  OrderItem,
  Payment,
  PointTransaction,
  Promotion,
  Reservation,
  ReservationTable,
  Table
];

const categoriesData = [
  { name: 'Salad & Khai vị', description: 'Các món salad tươi giòn, rau củ hữu cơ và khai vị thanh nhẹ' },
  { name: 'Món chính Healthy', description: 'Cơm gạo lứt, ức gà, cá hồi và thịt bò nạc giàu đạm chuẩn Eat Clean' },
  { name: 'Mì & Bún Eat Clean', description: 'Mì nưa Shirataki, bún gạo lứt và mì nguyên cám ít tinh bột' },
  { name: 'Nước ép & Sinh tố', description: 'Nước ép trái cây tươi ép lạnh nguyên chất và sinh tố detox' },
  { name: 'Tráng miệng Healthy', description: 'Sữa chua Hy Lạp, hạt chia pudding và ngũ cốc yến mạch' }
];

const menuItemsData = [
  {
    category: 'Salad & Khai vị',
    name: 'Salad Ức Gà Áp Chảo Sốt Mè Rang',
    price: 85000,
    description: 'Ức gà nướng thảo mộc mềm ngọt, xà lách romaine, cà chua bi, trứng lòng đào rưới sốt mè rang béo ngậy thanh nhẹ.',
    image: '/uploads/menu/salad-uc-ga-ap-chao.jpg'
  },
  {
    category: 'Salad & Khai vị',
    name: 'Salad Cá Hồi Nauy Bơ Sáp',
    price: 135000,
    description: 'Cá hồi Nauy áp chảo vừa chín tới, bơ sáp chín ngậy thái lát, dưa leo baby kèm sốt chanh dây chua ngọt tươi mát.',
    image: '/uploads/menu/salad-ca-hoi-nauy-bo-sap.jpg'
  },
  {
    category: 'Salad & Khai vị',
    name: 'Salad Tôm Quinoa & Rau Chân Vịt',
    price: 110000,
    description: 'Tôm sú hấp tươi ngọt, hạt diêm mạch quinoa giàu đạm, rau bina tươi non và sốt mù tạt mật ong chuẩn phong cách Địa Trung Hải.',
    image: '/uploads/menu/salad-tom-quinoa.jpg'
  },
  {
    category: 'Salad & Khai vị',
    name: 'Gỏi Cuốn Tôm Gà Bánh Tráng Gạo Lứt',
    price: 65000,
    description: 'Bánh tráng gạo lứt dẻo dai cuộn tôm sú tươi, ức gà luộc mỏng, ớt chuông, dưa chuột và sốt chấm bơ đậu phộng đặc chế.',
    image: '/uploads/menu/goi-cuon-tom-ga.jpg'
  },
  {
    category: 'Salad & Khai vị',
    name: 'Súp Bí Đỏ Hạnh Nhân Kem Hạt Sen',
    price: 60000,
    description: 'Bí đỏ hữu cơ nấu nhuyễn sánh mịn cùng hạt sen tươi Đồng Tháp bùi ngọt, rắc hạnh nhân lát nướng giòn rụm.',
    image: '/uploads/menu/sup-bi-do-hanh-nhan.jpg'
  },
  {
    category: 'Món chính Healthy',
    name: 'Poke Bowl Cá Hồi Gạo Lứt Sốt Teriyaki',
    price: 145000,
    description: 'Tô cơm gạo lứt huyết rồng dẻo thơm ăn kèm cá hồi tươi phi lê sốt teriyaki, rong biển wakame, đậu nành edamame và củ cải đỏ.',
    image: '/uploads/menu/poke-bowl-ca-hoi.jpg'
  },
  {
    category: 'Món chính Healthy',
    name: 'Thăn Bò Úc Áp Chảo Rau Củ Nướng',
    price: 165000,
    description: 'Thăn bò Úc nạc áp chảo hương thảo mộc, ăn kèm khoai lang mật nướng, măng tây xanh và bí ngòi giòn ngọt.',
    image: '/uploads/menu/than-bo-uc-ap-chao.jpg'
  },
  {
    category: 'Món chính Healthy',
    name: 'Ức Gà Nướng Mật Ong Kèm Khoai Lang Nghiền',
    price: 95000,
    description: 'Ức gà phi lê ướp mật ong hoa rừng nướng vàng ươm, dùng kèm khoai lang vàng nghiền mịn thơm dịu và bông cải xanh hấp.',
    image: '/uploads/menu/uc-ga-nuong-mat-ong.jpg'
  },
  {
    category: 'Món chính Healthy',
    name: 'Cơm Gạo Lứt Ức Gà Sốt Nấm Truffle',
    price: 90000,
    description: 'Cơm gạo lứt dẻo bùi kết hợp ức gà xé mọng nước cùng sốt nấm đùi gà thơm lừng hương dầu nấm truffle cao cấp.',
    image: '/uploads/menu/com-gao-lut-uc-ga-nam.jpg'
  },
  {
    category: 'Món chính Healthy',
    name: 'Đậu Hũ Non Áp Chảo Sốt Nấm Hương Đông Cô',
    price: 75000,
    description: 'Đậu hũ non organic áp chảo vàng nhẹ hai mặt, rưới sốt nấm đông cô đậm đà thanh tịnh, dùng kèm cơm gạo lứt hấp.',
    image: '/uploads/menu/dau-hu-non-ap-chao.jpg'
  },
  {
    category: 'Mì & Bún Eat Clean',
    name: 'Bún Gạo Lứt Xào Bò Rau Củ Ngũ Sắc',
    price: 85000,
    description: 'Bún gạo lứt sợi dai tự nhiên xào thịt bò nạc thái mỏng, nấm đùi gà, cà rốt và ớt chuông với dầu ô liu extra virgin.',
    image: '/uploads/menu/bun-gao-lut-xao-bo.jpg'
  },
  {
    category: 'Mì & Bún Eat Clean',
    name: 'Mì Nưa Shirataki Trộn Tôm Trứng Lòng Đào',
    price: 95000,
    description: 'Mì nưa Konjac gần như không chứa calories và tinh bột, trộn tôm sú tươi, dưa chuột thái sợi, rong nho giòn mát và sốt mè cay.',
    image: '/uploads/menu/mi-nua-shirataki-tom.jpg'
  },
  {
    category: 'Mì & Bún Eat Clean',
    name: 'Mì Ý Lúa Mì Nguyên Cám Sốt Pesto Húng Tây',
    price: 105000,
    description: 'Sợi mì Ý nguyên cám giàu chất xơ quyện sốt pesto thơm nồng từ lá húng quế tươi, hạt óc chó và phô mai Parmesan bào mịn.',
    image: '/uploads/menu/mi-y-nguyen-cam-pesto.jpg'
  },
  {
    category: 'Mì & Bún Eat Clean',
    name: 'Phở Gạo Lứt Gà Ta Nước Dùng Rau Củ',
    price: 80000,
    description: 'Bánh phở gạo lứt tươi mềm cùng thịt ức gà ta xé sợi, nước hầm thanh ngọt 100% tự nhiên từ lê, táo và củ cải trắng.',
    image: '/uploads/menu/pho-gao-lut-ga-ta.jpg'
  },
  {
    category: 'Nước ép & Sinh tố',
    name: 'Sinh Tố Green Detox Cải Kale & Bơ Sáp',
    price: 55000,
    description: 'Sự kết hợp hoàn hảo từ cải xoăn kale tươi, chuối chín, bơ sáp và sữa hạt hạnh nhân nguyên chất, không thêm đường.',
    image: '/uploads/menu/sinh-to-green-detox-kale.jpg'
  },
  {
    category: 'Nước ép & Sinh tố',
    name: 'Nước Ép Cần Tây Táo Xanh & Gừng Ép Lạnh',
    price: 50000,
    description: 'Cần tây thanh lọc cơ thể ép chậm cùng táo xanh chua giòn và chút gừng ấm bụng, dồi dào khoáng chất và vitamin.',
    image: '/uploads/menu/nuoc-ep-can-tay-tao-xanh.jpg'
  },
  {
    category: 'Nước ép & Sinh tố',
    name: 'Nước Ép Củ Dền Cà Rốt & Cam Tươi',
    price: 50000,
    description: 'Củ dền bổ máu kết hợp cà rốt ngọt tự nhiên và cam tươi mọng nước giúp tăng cường đề kháng và làm sáng da.',
    image: '/uploads/menu/nuoc-ep-cu-den-ca-rot.jpg'
  },
  {
    category: 'Nước ép & Sinh tố',
    name: 'Trà Trái Cây Nhiệt Đới Hạt Chia Ủ Lạnh',
    price: 45000,
    description: 'Trà ô long ủ lạnh mát rượi hòa quyện chanh leo, dâu tây tươi và hạt chia hữu cơ, vị ngọt dịu nhẹ tự nhiên.',
    image: '/uploads/menu/tra-trai-cay-hat-chia.jpg'
  },
  {
    category: 'Tráng miệng Healthy',
    name: 'Sữa Chua Hy Lạp Granola Quả Mọng',
    price: 65000,
    description: 'Sữa chua Hy Lạp sánh đặc giàu probiotic ăn kèm hạt ngũ cốc granola nướng mật ong giòn tan, dâu tây và việt quất tươi.',
    image: '/uploads/menu/sua-chua-hy-lap-granola.jpg'
  },
  {
    category: 'Tráng miệng Healthy',
    name: 'Pudding Hạt Chia Sữa Yến Mạch Mâm Xôi',
    price: 55000,
    description: 'Hạt chia ngâm nở trong sữa yến mạch béo bùi, rưới sốt mứt mâm xôi tự nấu không chất bảo quản, tráng miệng nhẹ nhàng.',
    image: '/uploads/menu/pudding-hat-chia-mam-xoi.jpg'
  }
];

const tablesData = [
  { name: 'Bàn 1', seats: 2, location: 'Tầng trệt - Cạnh cửa sổ đón nắng' },
  { name: 'Bàn 2', seats: 2, location: 'Tầng trệt - Cạnh cửa sổ đón nắng' },
  { name: 'Bàn 3', seats: 4, location: 'Tầng trệt - Khu trung tâm thoáng mát' },
  { name: 'Bàn 4', seats: 4, location: 'Tầng trệt - Khu trung tâm thoáng mát' },
  { name: 'Bàn 5', seats: 4, location: 'Tầng trệt - Khu vườn cây xanh' },
  { name: 'Bàn 6', seats: 4, location: 'Tầng trệt - Khu vườn cây xanh' },
  { name: 'Bàn 7', seats: 6, location: 'Lầu 1 - Ban công ngắm cảnh phố' },
  { name: 'Bàn 8', seats: 6, location: 'Lầu 1 - Góc yên tĩnh thư giãn' },
  { name: 'Bàn 9', seats: 8, location: 'Lầu 1 - Phòng riêng VIP 1 (Gia đình / Nhóm bạn)' },
  { name: 'Bàn 10', seats: 10, location: 'Lầu 1 - Phòng tiệc VIP 2 (Họp mặt / Sinh nhật)' }
];

const seedDatabase = async () => {
  try {
    await connectDatabase();
    const database = mongoose.connection.db;

    for (const model of models) {
      const collectionExists = await database
        .listCollections({ name: model.collection.collectionName }, { nameOnly: true })
        .hasNext();

      if (!collectionExists) {
        await model.createCollection();
      }

      await model.createIndexes();
    }

    const categoriesByName = new Map();
    for (const category of categoriesData) {
      const result = await Category.findOneAndUpdate(
        { name: category.name },
        { $set: category },
        { upsert: true, new: true }
      );
      categoriesByName.set(result.name, result._id);
    }

    for (const item of menuItemsData) {
      const category = categoriesByName.get(item.category);
      await MenuItem.updateOne(
        { name: item.name },
        {
          $set: {
            name: item.name,
            category,
            price: item.price,
            description: item.description,
            image: item.image,
            sizeOptions: [
              { name: 'Tiêu chuẩn', additionalPrice: 0 },
              { name: 'Phần lớn (Extra Protein/Upsize)', additionalPrice: 20000 }
            ]
          }
        },
        { upsert: true }
      );
    }

    for (const table of tablesData) {
      await Table.updateOne({ name: table.name }, { $set: table }, { upsert: true });
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);
    const promotions = [
      {
        name: 'Combo nhóm bạn',
        discountType: 'PERCENT',
        value: 15,
        startDate: now,
        endDate,
        minOrderAmount: 800000
      },
      {
        name: 'Ưu đãi giờ vàng',
        discountType: 'AMOUNT',
        value: 50000,
        startDate: now,
        endDate,
        minOrderAmount: 300000
      }
    ];

    for (const promotion of promotions) {
      await Promotion.updateOne(
        { name: promotion.name },
        { $setOnInsert: promotion },
        { upsert: true }
      );
    }

    for (const name of ['Momo', 'ZaloPay', 'Thẻ tín dụng']) {
      await OnlinePaymentMethod.updateOne(
        { name },
        { $setOnInsert: { name, isActive: true } },
        { upsert: true }
      );
    }

    console.log(`Database "${database.databaseName}" is ready.`);
    console.log(`Initialized ${models.length} collections and their indexes.`);
    console.log('Seeded categories, menu items, tables, promotions, and online payment methods.');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
