const express = require('express');
const path = require('path');
const multer = require('multer');
const { MenuItem } = require('../models/MenuItem');
const { Order } = require('../models/Order');
const { Customer } = require('../models/Customer');
const { uploadImageToS3 } = require('../config/s3');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.get('/', (req, res) => {
  const adminPath = path.join(__dirname, '..', 'views', 'admin.html');
  res.sendFile(adminPath);
});

router.get('/login', (req, res) => {
  const loginPath = path.join(__dirname, '..', 'views', 'admin.html');
  res.sendFile(loginPath);
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === '123456') {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }

  return res.status(401).send('Tên đăng nhập hoặc mật khẩu không đúng');
});

router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/admin/login');
});

router.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 }).lean();
    console.log(`[Admin API] Tìm thấy ${items.length} món ăn trong database (từ menuitems)`);
    
    const mappedItems = items.map(item => ({
      ...item,
      _id: item._id.toString(),
      id: item._id.toString()
    }));
    
    if (mappedItems.length > 0) {
      console.log(`[Admin API] Mẫu món ăn đầu tiên:`, {
        _id: mappedItems[0]._id,
        id: mappedItems[0].id,
        name: mappedItems[0].name,
        price: mappedItems[0].price,
        image: mappedItems[0].image
      });
    }
    
    res.json(mappedItems);
  } catch (error) {
    console.error('[Admin API] Lỗi khi lấy danh sách món ăn:', error);
    res.status(500).json({ message: 'Không thể tải thực đơn', error: error.message });
  }
});

router.post('/api/menu', async (req, res) => {
  const { name, price, description, image } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Tên và giá món là bắt buộc' });
  }

  try {
    const parsedPrice = Number(price);
    const menuItem = await MenuItem.create({
      name,
      price: Number.isNaN(parsedPrice) ? 0 : parsedPrice,
      description: description || '',
      image: image || ''
    });

    const createdItem = await MenuItem.findById(menuItem._id).lean();
    return res.status(201).json({
      ...createdItem,
      _id: createdItem._id.toString(),
      id: createdItem._id.toString()
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Không thể tạo món ăn mới', error: error.message });
  }
});

router.put('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, description, image } = req.body;

  try {
    const updateData = {};

    if (name) {
      updateData.name = name;
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);
      updateData.price = Number.isNaN(parsedPrice) ? 0 : parsedPrice;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (image !== undefined) {
      updateData.image = image;
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, {
      new: true
    }).lean();

    if (!updatedItem) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }

    return res.json({
      ...updatedItem,
      _id: updatedItem._id.toString(),
      id: updatedItem._id.toString()
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Không thể cập nhật món ăn', error: error.message });
  }
});

router.delete('/api/menu/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }

    return res.json({
      ...deletedItem.toObject(),
      _id: deletedItem._id.toString(),
      id: deletedItem._id.toString()
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Không thể xóa món ăn', error: error.message });
  }
});

router.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name phone')
      .populate('promotion', 'name')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`[Admin API] Tìm thấy ${orders.length} đơn hàng trong database`);
    
    const mappedOrders = orders.map(order => {
      const orderTypeMap = {
        'TAI_CHO': 'Tại chỗ',
        'ONLINE': 'Giao hàng',
        'MANG_VE': 'Mang về'
      };
      
      const statusMap = {
        'CHO_XAC_NHAN': 'Chờ xác nhận',
        'DA_XAC_NHAN': 'Đã xác nhận',
        'DANG_CHUAN_BI': 'Đang chuẩn bị',
        'DANG_GIAO': 'Đang giao',
        'HOAN_THANH': 'Hoàn thành',
        'DA_HUY': 'Đã hủy'
      };
      
      return {
        ...order,
        _id: order._id.toString(),
        id: order._id.toString(),
        orderTypeText: orderTypeMap[order.orderType] || order.orderType,
        statusText: statusMap[order.status] || order.status,
        customerName: order.customer ? (order.customer.name || order.customer.phone || 'Khách vãng lai') : 'Khách vãng lai',
        createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''
      };
    });
    
    res.json(mappedOrders);
  } catch (error) {
    console.error('[Admin API] Lỗi khi lấy danh sách đơn hàng:', error);
    res.status(500).json({ message: 'Không thể tải danh sách đơn hàng', error: error.message });
  }
});

router.post(
  '/api/upload/menu-image',
  upload.single('image'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Không tìm thấy file ảnh để tải lên' });
    }

    try {
      const timestamp = Date.now();
      const safeName = req.file.originalname.replace(/\s+/g, '-').toLowerCase();
      const key = `menu/${timestamp}-${safeName}`;

      const url = await uploadImageToS3(
        req.file.buffer,
        key,
        req.file.mimetype || 'image/jpeg'
      );

      return res.status(201).json({ url });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Không thể tải ảnh lên AWS S3', error: error.message });
    }
  }
);

module.exports = router;


