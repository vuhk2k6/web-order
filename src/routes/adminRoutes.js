const express = require('express');
const path = require('path');
const multer = require('multer');
const { MenuItem } = require('../models/MenuItem');
const { Promotion } = require('../models/Promotion'); // đảm bảo đăng ký model trước khi populate
const { Order } = require('../models/Order');
const { Customer } = require('../models/Customer');
const { Member } = require('../models/Member');
const { PointTransaction } = require('../models/PointTransaction');
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

router.get('/orders', (req, res) => {
  const ordersPath = path.join(__dirname, '..', 'views', 'admin-orders.html');
  res.sendFile(ordersPath);
});

router.get('/orders/', (req, res) => {
  const ordersPath = path.join(__dirname, '..', 'views', 'admin-orders.html');
  res.sendFile(ordersPath);
});

router.get('/reservations', (req, res) => {
  const reservationsPath = path.join(__dirname, '..', 'views', 'admin-reservations.html');
  res.sendFile(reservationsPath);
});

router.get('/reservations/', (req, res) => {
  const reservationsPath = path.join(__dirname, '..', 'views', 'admin-reservations.html');
  res.sendFile(reservationsPath);
});

router.get('/menu', (req, res) => {
  const menuPath = path.join(__dirname, '..', 'views', 'admin-menu.html');
  res.sendFile(menuPath);
});

router.get('/menu/', (req, res) => {
  const menuPath = path.join(__dirname, '..', 'views', 'admin-menu.html');
  res.sendFile(menuPath);
});

router.get('/customers', (req, res) => {
  const customersPath = path.join(__dirname, '..', 'views', 'admin-customers.html');
  res.sendFile(customersPath);
});

router.get('/customers/', (req, res) => {
  const customersPath = path.join(__dirname, '..', 'views', 'admin-customers.html');
  res.sendFile(customersPath);
});

router.get('/api/customers/:id/detail', async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id).select('-passwordHash').lean();
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    const member = await Member.findOne({ customer: id }).lean();

    const orders = await Order.find({ customer: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const orderTypeMap = {
      TAI_CHO: 'Tại chỗ',
      ONLINE: 'Giao hàng',
      MANG_VE: 'Mang về'
    };

    const statusMap = {
      CHO_XAC_NHAN: 'Chờ xác nhận',
      DA_XAC_NHAN: 'Đã xác nhận',
      DANG_CHUAN_BI: 'Đang chuẩn bị',
      DANG_GIAO: 'Đang giao',
      HOAN_THANH: 'Hoàn thành',
      DA_HUY: 'Đã hủy'
    };

    const mappedOrders = orders.map((order) => ({
      id: order._id.toString(),
      totalAmount: order.totalAmount,
      orderTypeText: orderTypeMap[order.orderType] || order.orderType,
      statusText: statusMap[order.status] || order.status,
      createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''
    }));

    const pointBalance = member?.points ?? 0;

    const recentTransactions = await PointTransaction.find({ member: member?._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const mappedTransactions = (recentTransactions || []).map((tx) => ({
      id: tx._id.toString(),
      type: tx.type,
      points: tx.points,
      note: tx.note || '',
      createdAt: tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : ''
    }));

    res.json({
      customer: {
        ...customer,
        _id: customer._id.toString(),
        id: customer._id.toString(),
        createdAt: customer.createdAt ? new Date(customer.createdAt).toLocaleString('vi-VN') : ''
      },
      member: member
        ? {
            ...member,
            _id: member._id.toString(),
            id: member._id.toString(),
            points: member.points ?? 0,
            totalSpent: member.totalSpent ?? 0,
            tier: member.tier || '',
            createdAt: member.createdAt ? new Date(member.createdAt).toLocaleString('vi-VN') : ''
          }
        : null,
      orders: mappedOrders,
      points: {
        balance: pointBalance,
        transactions: mappedTransactions
      }
    });
  } catch (error) {
    console.error('[Admin API] Lỗi khi lấy chi tiết khách hàng:', error);
    res.status(500).json({ message: 'Không thể tải chi tiết khách hàng', error: error.message });
  }
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

router.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`[Admin API] Tìm thấy ${customers.length} khách hàng trong database`);
    
    const mappedCustomers = customers.map(customer => {
      const accountTypeMap = {
        'THANH_VIEN': 'Thành viên',
        'KHACH': 'Khách'
      };
      
      return {
        ...customer,
        _id: customer._id.toString(),
        id: customer._id.toString(),
        accountTypeText: accountTypeMap[customer.accountType] || customer.accountType,
        createdAt: customer.createdAt ? new Date(customer.createdAt).toLocaleString('vi-VN') : ''
      };
    });
    
    res.json(mappedCustomers);
  } catch (error) {
    console.error('[Admin API] Lỗi khi lấy danh sách khách hàng:', error);
    res.status(500).json({ message: 'Không thể tải danh sách khách hàng', error: error.message });
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


