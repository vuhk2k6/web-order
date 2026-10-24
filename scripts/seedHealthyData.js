/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/db');
const { Category } = require('../src/models/Category');
const { MenuItem } = require('../src/models/MenuItem');
const { Table } = require('../src/models/Table');

const healthyCategories = [
  { name: 'Salad & Khai vị', description: 'Các món salad tươi giòn, rau củ hữu cơ và khai vị thanh nhẹ' },
  { name: 'Món chính Healthy', description: 'Cơm gạo lứt, ức gà, cá hồi và thịt bò nạc giàu đạm chuẩn Eat Clean' },
  { name: 'Mì & Bún Eat Clean', description: 'Mì nưa Shirataki, bún gạo lứt và mì nguyên cám ít tinh bột' },
  { name: 'Nước ép & Sinh tố', description: 'Nước ép trái cây tươi ép lạnh nguyên chất và sinh tố detox' },
  { name: 'Tráng miệng Healthy', description: 'Sữa chua Hy Lạp, hạt chia pudding và ngũ cốc yến mạch' }
];

const healthyMenuItems = [
  // 1. Salad & Khai vị (5 món)
  {
    category: 'Salad & Khai vị',
    name: 'Salad Ức Gà Áp Chảo Sốt Mè Rang',
    price: 85000,
    description: 'Ức gà nướng thảo mộc mềm ngọt, xà lách romaine, cà chua bi, trứng lòng đào rưới sốt mè rang béo ngậy thanh nhẹ.'
  },
  {
    category: 'Salad & Khai vị',
    name: 'Salad Cá Hồi Nauy Bơ Sáp',
    price: 135000,
    description: 'Cá hồi Nauy áp chảo vừa chín tới, bơ sáp chín ngậy thái lát, dưa leo baby kèm sốt chanh dây chua ngọt tươi mát.'
  },
  {
    category: 'Salad & Khai vị',
    name: 'Salad Tôm Quinoa & Rau Chân Vịt',
    price: 110000,
    description: 'Tôm sú hấp tươi ngọt, hạt diêm mạch quinoa giàu đạm, rau bina tươi non và sốt mù tạt mật ong chuẩn phong cách Địa Trung Hải.'
  },
  {
    category: 'Salad & Khai vị',
    name: 'Gỏi Cuốn Tôm Gà Bánh Tráng Gạo Lứt',
    price: 65000,
    description: 'Bánh tráng gạo lứt dẻo dai cuộn tôm sú tươi, ức gà luộc mỏng, ớt chuông, dưa chuột và sốt chấm bơ đậu phộng đặc chế.'
  },
  {
    category: 'Salad & Khai vị',
    name: 'Súp Bí Đỏ Hạnh Nhân Kem Hạt Sen',
    price: 60000,
    description: 'Bí đỏ hữu cơ nấu nhuyễn sánh mịn cùng hạt sen tươi Đồng Tháp bùi ngọt, rắc hạnh nhân lát nướng giòn rụm.'
  },

  // 2. Món chính Healthy (5 món)
  {
    category: 'Món chính Healthy',
    name: 'Poke Bowl Cá Hồi Gạo Lứt Sốt Teriyaki',
    price: 145000,
    description: 'Tô cơm gạo lứt huyết rồng dẻo thơm ăn kèm cá hồi tươi phi lê sốt teriyaki, rong biển wakame, đậu nành edamame và củ cải đỏ.'
  },
  {
    category: 'Món chính Healthy',
    name: 'Thăn Bò Úc Áp Chảo Rau Củ Nướng',
    price: 165000,
    description: 'Thăn bò Úc nạc áp chảo hương thảo mộc, ăn kèm khoai lang mật nướng, măng tây xanh và bí ngòi giòn ngọt.'
  },
  {
    category: 'Món chính Healthy',
    name: 'Ức Gà Nướng Mật Ong Kèm Khoai Lang Nghiền',
    price: 95000,
    description: 'Ức gà phi lê ướp mật ong hoa rừng nướng vàng ươm, dùng kèm khoai lang vàng nghiền mịn thơm dịu và bông cải xanh hấp.'
  },
  {
    category: 'Món chính Healthy',
    name: 'Cơm Gạo Lứt Ức Gà Sốt Nấm Truffle',
    price: 90000,
    description: 'Cơm gạo lứt dẻo bùi kết hợp ức gà xé mọng nước cùng sốt nấm đùi gà thơm lừng hương dầu nấm truffle cao cấp.'
  },
  {
    category: 'Món chính Healthy',
    name: 'Đậu Hũ Non Áp Chảo Sốt Nấm Hương Đông Cô',
    price: 75000,
    description: 'Đậu hũ non organic áp chảo vàng nhẹ hai mặt, rưới sốt nấm đông cô đậm đà thanh tịnh, dùng kèm cơm gạo lứt hấp.'
  },

  // 3. Mì & Bún Eat Clean (4 món)
  {
    category: 'Mì & Bún Eat Clean',
    name: 'Bún Gạo Lứt Xào Bò Rau Củ Ngũ Sắc',
    price: 85000,
    description: 'Bún gạo lứt sợi dai tự nhiên xào thịt bò nạc thái mỏng, nấm đùi gà, cà rốt và ớt chuông với dầu ô liu extra virgin.'
  },
  {
    category: 'Mì & Bún Eat Clean',
    name: 'Mì Nưa Shirataki Trộn Tôm Trứng Lòng Đào',
    price: 95000,
    description: 'Mì nưa Konjac gần như không chứa calories và tinh bột, trộn tôm sú tươi, dưa chuột thái sợi, rong nho giòn mát và sốt mè cay.'
  },
  {
    category: 'Mì & Bún Eat Clean',
    name: 'Mì Ý Lúa Mì Nguyên Cám Sốt Pesto Húng Tây',
    price: 105000,
    description: 'Sợi mì Ý nguyên cám giàu chất xơ quyện sốt pesto thơm nồng từ lá húng quế tươi, hạt óc chó và phô mai Parmesan bào mịn.'
  },
  {
    category: 'Mì & Bún Eat Clean',
    name: 'Phở Gạo Lứt Gà Ta Nước Dùng Rau Củ',
    price: 80000,
    description: 'Bánh phở gạo lứt tươi mềm cùng thịt ức gà ta xé sợi, nước hầm thanh ngọt 100% tự nhiên từ lê, táo và củ cải trắng.'
  },

  // 4. Nước ép & Sinh tố (4 món)
  {
    category: 'Nước ép & Sinh tố',
    name: 'Sinh Tố Green Detox Cải Kale & Bơ Sáp',
    price: 55000,
    description: 'Sự kết hợp hoàn hảo từ cải xoăn kale tươi, chuối chín, bơ sáp và sữa hạt hạnh nhân nguyên chất, không thêm đường.'
  },
  {
    category: 'Nước ép & Sinh tố',
    name: 'Nước Ép Cần Tây Táo Xanh & Gừng Ép Lạnh',
    price: 50000,
    description: 'Cần tây thanh lọc cơ thể ép chậm cùng táo xanh chua giòn và chút gừng ấm bụng, dồi dào khoáng chất và vitamin.'
  },
  {
    category: 'Nước ép & Sinh tố',
    name: 'Nước Ép Củ Dền Cà Rốt & Cam Tươi',
    price: 50000,
    description: 'Củ dền bổ máu kết hợp cà rốt ngọt tự nhiên và cam tươi mọng nước giúp tăng cường đề kháng và làm sáng da.'
  },
  {
    category: 'Nước ép & Sinh tố',
    name: 'Trà Trái Cây Nhiệt Đới Hạt Chia Ủ Lạnh',
    price: 45000,
    description: 'Trà ô long ủ lạnh mát rượi hòa quyện chanh leo, dâu tây tươi và hạt chia hữu cơ, vị ngọt dịu nhẹ tự nhiên.'
  },

  // 5. Tráng miệng Healthy (2 món)
  {
    category: 'Tráng miệng Healthy',
    name: 'Sữa Chua Hy Lạp Granola Quả Mọng',
    price: 65000,
    description: 'Sữa chua Hy Lạp sánh đặc giàu probiotic ăn kèm hạt ngũ cốc granola nướng mật ong giòn tan, dâu tây và việt quất tươi.'
  },
  {
    category: 'Tráng miệng Healthy',
    name: 'Pudding Hạt Chia Sữa Yến Mạch Mâm Xôi',
    price: 55000,
    description: 'Hạt chia ngâm nở trong sữa yến mạch béo bùi, rưới sốt mứt mâm xôi tự nấu không chất bảo quản, tráng miệng nhẹ nhàng.'
  }
];

const tenTables = [
  { name: 'Bàn 1', seats: 2, location: 'Tầng trệt - Cạnh cửa sổ đón nắng', status: 'TRONG' },
  { name: 'Bàn 2', seats: 2, location: 'Tầng trệt - Cạnh cửa sổ đón nắng', status: 'TRONG' },
  { name: 'Bàn 3', seats: 4, location: 'Tầng trệt - Khu trung tâm thoáng mát', status: 'TRONG' },
  { name: 'Bàn 4', seats: 4, location: 'Tầng trệt - Khu trung tâm thoáng mát', status: 'TRONG' },
  { name: 'Bàn 5', seats: 4, location: 'Tầng trệt - Khu vườn cây xanh', status: 'TRONG' },
  { name: 'Bàn 6', seats: 4, location: 'Tầng trệt - Khu vườn cây xanh', status: 'TRONG' },
  { name: 'Bàn 7', seats: 6, location: 'Lầu 1 - Ban công ngắm cảnh phố', status: 'TRONG' },
  { name: 'Bàn 8', seats: 6, location: 'Lầu 1 - Góc yên tĩnh thư giãn', status: 'TRONG' },
  { name: 'Bàn 9', seats: 8, location: 'Lầu 1 - Phòng riêng VIP 1 (Gia đình / Nhóm bạn)', status: 'TRONG' },
  { name: 'Bàn 10', seats: 10, location: 'Lầu 1 - Phòng tiệc VIP 2 (Họp mặt / Sinh nhật)', status: 'TRONG' }
];

const updateHealthyData = async () => {
  try {
    await connectDatabase();
    console.log('Connected to database...');

    // 1. Tạo/cập nhật Categories
    const categoryMap = new Map();
    for (const cat of healthyCategories) {
      const doc = await Category.findOneAndUpdate(
        { name: cat.name },
        { $set: { description: cat.description } },
        { upsert: true, new: true }
      );
      categoryMap.set(doc.name, doc._id);
    }

    // 2. Làm mới Menu Items: xóa các món cũ và chèn 20 món Healthy
    await MenuItem.deleteMany({});
    console.log('Cleared old menu items.');

    const slugMap = {
      'Salad Ức Gà Áp Chảo Sốt Mè Rang': '/uploads/menu/salad-uc-ga-ap-chao.jpg',
      'Salad Cá Hồi Nauy Bơ Sáp': '/uploads/menu/salad-ca-hoi-nauy-bo-sap.jpg',
      'Salad Tôm Quinoa & Rau Chân Vịt': '/uploads/menu/salad-tom-quinoa.jpg',
      'Gỏi Cuốn Tôm Gà Bánh Tráng Gạo Lứt': '/uploads/menu/goi-cuon-tom-ga.jpg',
      'Súp Bí Đỏ Hạnh Nhân Kem Hạt Sen': '/uploads/menu/sup-bi-do-hanh-nhan.jpg',
      'Poke Bowl Cá Hồi Gạo Lứt Sốt Teriyaki': '/uploads/menu/poke-bowl-ca-hoi.jpg',
      'Thăn Bò Úc Áp Chảo Rau Củ Nướng': '/uploads/menu/than-bo-uc-ap-chao.jpg',
      'Ức Gà Nướng Mật Ong Kèm Khoai Lang Nghiền': '/uploads/menu/uc-ga-nuong-mat-ong.jpg',
      'Cơm Gạo Lứt Ức Gà Sốt Nấm Truffle': '/uploads/menu/com-gao-lut-uc-ga-nam.jpg',
      'Đậu Hũ Non Áp Chảo Sốt Nấm Hương Đông Cô': '/uploads/menu/dau-hu-non-ap-chao.jpg',
      'Bún Gạo Lứt Xào Bò Rau Củ Ngũ Sắc': '/uploads/menu/bun-gao-lut-xao-bo.jpg',
      'Mì Nưa Shirataki Trộn Tôm Trứng Lòng Đào': '/uploads/menu/mi-nua-shirataki-tom.jpg',
      'Mì Ý Lúa Mì Nguyên Cám Sốt Pesto Húng Tây': '/uploads/menu/mi-y-nguyen-cam-pesto.jpg',
      'Phở Gạo Lứt Gà Ta Nước Dùng Rau Củ': '/uploads/menu/pho-gao-lut-ga-ta.jpg',
      'Sinh Tố Green Detox Cải Kale & Bơ Sáp': '/uploads/menu/sinh-to-green-detox-kale.jpg',
      'Nước Ép Cần Tây Táo Xanh & Gừng Ép Lạnh': '/uploads/menu/nuoc-ep-can-tay-tao-xanh.jpg',
      'Nước Ép Củ Dền Cà Rốt & Cam Tươi': '/uploads/menu/nuoc-ep-cu-den-ca-rot.jpg',
      'Trà Trái Cây Nhiệt Đới Hạt Chia Ủ Lạnh': '/uploads/menu/tra-trai-cay-hat-chia.jpg',
      'Sữa Chua Hy Lạp Granola Quả Mọng': '/uploads/menu/sua-chua-hy-lap-granola.jpg',
      'Pudding Hạt Chia Sữa Yến Mạch Mâm Xôi': '/uploads/menu/pudding-hat-chia-mam-xoi.jpg'
    };

    for (const item of healthyMenuItems) {
      const categoryId = categoryMap.get(item.category);
      await MenuItem.create({
        name: item.name,
        price: item.price,
        description: item.description,
        category: categoryId,
        image: slugMap[item.name] || '',
        sizeOptions: [
          { name: 'Tiêu chuẩn', additionalPrice: 0 },
          { name: 'Phần lớn (Extra Protein/Upsize)', additionalPrice: 20000 }
        ]
      });
    }
    console.log(`Successfully inserted ${healthyMenuItems.length} healthy menu items!`);

    // 3. Làm mới Tables: cập nhật thành đúng 10 bàn
    await Table.deleteMany({});
    console.log('Cleared old tables.');

    for (const tbl of tenTables) {
      await Table.create(tbl);
    }
    console.log(`Successfully created ${tenTables.length} tables!`);

    console.log('=== UPDATE HEALTHY MENU AND 10 TABLES COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
};

updateHealthyData();
