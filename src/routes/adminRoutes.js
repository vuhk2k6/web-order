const express = require('express');
const path = require('path');
const multer = require('multer');
const { MenuItem } = require('../models/MenuItem');
const { Promotion } = require('../models/Promotion'); // đảm bảo đăng ký model trước khi populate
const { Order } = require('../models/Order');
const { OrderItem } = require('../models/OrderItem');
const { Category } = require('../models/Category');
const { Customer } = require('../models/Customer');
const { Member } = require('../models/Member');
const { PointTransaction } = require('../models/PointTransaction');
const { uploadImageToS3 } = require('../config/s3');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes except login
router.use((req, res, next) => {
  // Skip auth for login routes
  if (req.path === '/login' || req.path.startsWith('/login')) {
    return next();
  }
  // Apply auth middleware for all other routes
  return authMiddleware(req, res, next);
});
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

// Note: API routes should be defined before catch-all routes
// The /api/reservations route is defined later in this file

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
  // If already logged in, redirect to dashboard
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin');
  }
  const loginPath = path.join(__dirname, '..', 'views', 'admin-login.html');
  res.sendFile(loginPath);
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu' 
    });
  }

  // Check credentials
  if (username === 'admin' && password === '123456') {
    req.session.isAdmin = true;
    return res.json({ 
      success: true,
      message: 'Đăng nhập thành công' 
    });
  }

  return res.status(401).json({ 
    success: false,
    message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
  });
});

router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/admin/login');
});

router.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find()
      .populate('category', 'name _id')
      .sort({ createdAt: -1 })
      .lean();
    console.log(`[Admin API] Tìm thấy ${items.length} món ăn trong database (từ menuitems)`);
    
    const mappedItems = items.map(item => ({
      ...item,
      _id: item._id.toString(),
      id: item._id.toString(),
      category: item.category ? {
        _id: item.category._id.toString(),
        id: item.category._id.toString(),
        name: item.category.name
      } : null
    }));
    
    if (mappedItems.length > 0) {
      console.log(`[Admin API] Mẫu món ăn đầu tiên:`, {
        _id: mappedItems[0]._id,
        id: mappedItems[0].id,
        name: mappedItems[0].name,
        price: mappedItems[0].price,
        image: mappedItems[0].image,
        category: mappedItems[0].category
      });
    }
    
    res.json(mappedItems);
  } catch (error) {
    console.error('[Admin API] Lỗi khi lấy danh sách món ăn:', error);
    res.status(500).json({ message: 'Không thể tải thực đơn', error: error.message });
  }
});

router.post('/api/menu', async (req, res) => {
  const { name, price, description, image, category, sizeOptions } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Tên và giá món là bắt buộc' });
  }

  try {
    const parsedPrice = Number(price);
    
    // Validate category if provided
    let categoryId = null;
    if (category) {
      const categoryObj = await Category.findById(category);
      if (!categoryObj) {
        return res.status(400).json({ message: 'Danh mục không hợp lệ' });
      }
      categoryId = category;
    }
    
    // Validate và format sizeOptions
    let formattedSizeOptions = [];
    if (Array.isArray(sizeOptions) && sizeOptions.length > 0) {
      formattedSizeOptions = sizeOptions
        .filter(opt => opt && opt.name && opt.name.trim())
        .map(opt => ({
          name: opt.name.trim(),
          additionalPrice: Number(opt.additionalPrice) || 0
        }));
    }

    const menuItem = await MenuItem.create({
      name,
      price: Number.isNaN(parsedPrice) ? 0 : parsedPrice,
      description: description || '',
      image: image || '',
      category: categoryId,
      sizeOptions: formattedSizeOptions
    });

    const createdItem = await MenuItem.findById(menuItem._id)
      .populate('category', 'name _id')
      .lean();
    return res.status(201).json({
      ...createdItem,
      _id: createdItem._id.toString(),
      id: createdItem._id.toString(),
      category: createdItem.category ? {
        _id: createdItem.category._id.toString(),
        id: createdItem.category._id.toString(),
        name: createdItem.category.name
      } : null
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Không thể tạo món ăn mới', error: error.message });
  }
});

router.put('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, description, image, category, sizeOptions } = req.body;

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

    // Handle category update
    if (category !== undefined) {
      if (category === '' || category === null) {
        updateData.category = null;
      } else {
        const categoryObj = await Category.findById(category);
        if (!categoryObj) {
          return res.status(400).json({ message: 'Danh mục không hợp lệ' });
        }
        updateData.category = category;
      }
    }

    // Validate và format sizeOptions nếu được cung cấp
    if (sizeOptions !== undefined) {
      if (Array.isArray(sizeOptions)) {
        updateData.sizeOptions = sizeOptions
          .filter(opt => opt && opt.name && opt.name.trim())
          .map(opt => ({
            name: opt.name.trim(),
            additionalPrice: Number(opt.additionalPrice) || 0
          }));
      } else {
        updateData.sizeOptions = [];
      }
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, {
      new: true
    })
      .populate('category', 'name _id')
      .lean();

    if (!updatedItem) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }

    return res.json({
      ...updatedItem,
      _id: updatedItem._id.toString(),
      id: updatedItem._id.toString(),
      category: updatedItem.category ? {
        _id: updatedItem.category._id.toString(),
        id: updatedItem.category._id.toString(),
        name: updatedItem.category.name
      } : null
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

// Get dashboard statistics
router.get('/api/stats', async (req, res) => {
  console.log('[Admin API] GET /admin/api/stats - Request received');
  try {
    const { Order } = require('../models/Order');
    const { OrderItem } = require('../models/OrderItem');
    const { Reservation } = require('../models/Reservation');
    const { Table } = require('../models/Table');
    const { MenuItem } = require('../models/MenuItem');
    const { Category } = require('../models/Category');
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get yesterday's date range
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Today's orders
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).lean();
    
    // Yesterday's orders
    const yesterdayOrders = await Order.find({
      createdAt: { $gte: yesterday, $lt: today }
    }).lean();
    
    // Calculate today's revenue (only completed/confirmed orders, exclude cancelled)
    const completedTodayOrders = todayOrders.filter(
      o => !['DA_HUY', 'THANH_TOAN_THAT_BAI'].includes(o.status)
    );
    const todayRevenue = completedTodayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Calculate yesterday's revenue
    const completedYesterdayOrders = yesterdayOrders.filter(
      o => !['DA_HUY', 'THANH_TOAN_THAT_BAI'].includes(o.status)
    );
    const yesterdayRevenue = completedYesterdayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Calculate revenue change
    const revenueChange = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
      : (todayRevenue > 0 ? 100 : 0);
    
    // Today's order count (all orders except cancelled)
    const todayOrderCount = todayOrders.filter(
      o => !['DA_HUY', 'THANH_TOAN_THAT_BAI'].includes(o.status)
    ).length;
    const yesterdayOrderCount = yesterdayOrders.filter(
      o => !['DA_HUY', 'THANH_TOAN_THAT_BAI'].includes(o.status)
    ).length;
    const orderChange = yesterdayOrderCount > 0
      ? ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount * 100).toFixed(1)
      : (todayOrderCount > 0 ? 100 : 0);
    
    // Guests served (from reservations today and dine-in orders)
    const todayReservations = await Reservation.find({
      reservedAt: { $gte: today, $lt: tomorrow },
      status: { $in: ['XAC_NHAN', 'DANG_CHO'] }
    }).lean();
    
    const dineInOrdersToday = completedTodayOrders.filter(o => o.orderType === 'TAI_CHO');
    const guestCountFromReservations = todayReservations.reduce((sum, r) => sum + (r.guestCount || 0), 0);
    // Estimate average 2.5 guests per dine-in order
    const guestCountFromOrders = Math.round(dineInOrdersToday.length * 2.5);
    const totalGuests = guestCountFromReservations + guestCountFromOrders;
    
    // Category performance (from today's order items)
    const todayOrderIds = completedTodayOrders.map(o => o._id);
    const todayOrderItems = await OrderItem.find({
      order: { $in: todayOrderIds }
    }).lean();
    
    // Get all menu items with categories in one query for efficiency
    const dishIds = [...new Set(todayOrderItems.map(item => item.dish).filter(Boolean))];
    const menuItems = await MenuItem.find({
      _id: { $in: dishIds }
    }).populate('category', 'name').lean();
    
    // Create map for quick lookup
    const menuItemMap = {};
    menuItems.forEach(item => {
      menuItemMap[item._id.toString()] = item;
    });
    
    // Get category counts
    const categoryCounts = {};
    for (const item of todayOrderItems) {
      if (item.dish) {
        const dishId = item.dish._id ? item.dish._id.toString() : item.dish.toString();
        const menuItem = menuItemMap[dishId];
        
        if (menuItem && menuItem.category) {
          const categoryName = typeof menuItem.category === 'object' && menuItem.category.name
            ? menuItem.category.name
            : 'Khác';
          
          if (categoryName) {
            categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + (item.quantity || 1);
          }
        }
      }
    }
    
    // Table status
    const allTables = await Table.find({}).lean();
    const totalTables = allTables.length;
    const availableTables = allTables.filter(t => t.status === 'TRONG').length;
    
    // Reservations waiting
    const waitingReservations = await Reservation.find({
      status: 'DANG_CHO'
    }).lean();
    
    // Active reservations (confirmed, today or future)
    const activeReservations = await Reservation.find({
      status: 'XAC_NHAN',
      reservedAt: { $gte: today }
    }).lean();
    const activeGuestsCount = activeReservations.reduce((sum, r) => sum + (r.guestCount || 0), 0);
    
    res.json({
      revenue: {
        today: todayRevenue,
        yesterday: yesterdayRevenue,
        change: parseFloat(revenueChange)
      },
      orders: {
        today: todayOrderCount,
        yesterday: yesterdayOrderCount,
        change: parseFloat(orderChange)
      },
      guests: {
        today: totalGuests
      },
      tables: {
        total: totalTables,
        available: availableTables,
        reserved: totalTables - availableTables
      },
      reservations: {
        waiting: waitingReservations.length,
        active: activeReservations.length,
        activeGuests: activeGuestsCount
      }
    });
  } catch (error) {
    console.error('[Admin API] Error fetching stats:', error);
    res.status(500).json({ message: 'Không thể tải thống kê', error: error.message });
  }
});

// Get pending counts for sidebar badges
router.get('/api/pending-counts', async (req, res) => {
  try {
    const { Order } = require('../models/Order');
    const { Reservation } = require('../models/Reservation');
    
    // Count pending orders (not completed, not cancelled)
    const pendingOrdersCount = await Order.countDocuments({
      status: { $nin: ['HOAN_THANH', 'DA_HUY', 'THANH_TOAN_THAT_BAI'] }
    });
    
    // Count pending reservations (waiting or confirmed but not cancelled)
    const pendingReservationsCount = await Reservation.countDocuments({
      status: { $in: ['DANG_CHO', 'XAC_NHAN'] }
    });
    
    res.json({
      pendingOrders: pendingOrdersCount,
      pendingReservations: pendingReservationsCount
    });
  } catch (error) {
    console.error('[Admin API] Error fetching pending counts:', error);
    res.status(500).json({ message: 'Không thể tải số lượng chờ xử lý', error: error.message });
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
        'CHO_THANH_TOAN': 'Chờ thanh toán',
        'DA_XAC_NHAN': 'Đã xác nhận',
        'DANG_CHUAN_BI': 'Đang chuẩn bị',
        'DANG_GIAO': 'Đang giao',
        'HOAN_THANH': 'Hoàn thành',
        'DA_HUY': 'Đã hủy',
        'THANH_TOAN_THAT_BAI': 'Thanh toán thất bại'
      };
      
      return {
        ...order,
        _id: order._id.toString(),
        id: order._id.toString(),
        orderTypeText: orderTypeMap[order.orderType] || order.orderType,
        statusText: statusMap[order.status] || order.status,
        customerName: order.customer ? (order.customer.name || order.customer.phone || 'Khách vãng lai') : 'Khách vãng lai',
        createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '',
        cancelReason: order.cancelReason || null
      };
    });
    
    res.json(mappedOrders);
  } catch (error) {
    console.error('[Admin API] Lỗi khi lấy danh sách đơn hàng:', error);
    res.status(500).json({ message: 'Không thể tải danh sách đơn hàng', error: error.message });
  }
});

// Get order detail with items
router.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('customer', 'name phone')
      .populate('promotion', 'name')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Get order items with menu item details
    const orderItems = await OrderItem.find({ order: order._id }).lean();
    const items = await Promise.all(orderItems.map(async (item) => {
      try {
        const menuItem = item.dish ? await MenuItem.findById(item.dish).lean() : null;
        return {
          name: menuItem?.name || 'Món không xác định',
          quantity: item.quantity || 1,
          price: item.priceAtOrderTime || 0,
          total: (item.quantity || 1) * (item.priceAtOrderTime || 0),
          size: item.selectedSize || null,
          note: item.note || null
        };
      } catch (error) {
        console.error('[Admin API] Error processing order item:', error);
        return {
          name: 'Món không xác định',
          quantity: item.quantity || 1,
          price: item.priceAtOrderTime || 0,
          total: (item.quantity || 1) * (item.priceAtOrderTime || 0),
          size: item.selectedSize || null,
          note: item.note || null
        };
      }
    }));

    const orderTypeMap = {
      'TAI_CHO': 'Tại chỗ',
      'ONLINE': 'Giao hàng',
      'MANG_VE': 'Mang về'
    };
    
    const statusMap = {
      'CHO_XAC_NHAN': 'Chờ xác nhận',
      'CHO_THANH_TOAN': 'Chờ thanh toán',
      'DA_XAC_NHAN': 'Đã xác nhận',
      'DANG_CHUAN_BI': 'Đang chuẩn bị',
      'DANG_GIAO': 'Đang giao',
      'HOAN_THANH': 'Hoàn thành',
      'DA_HUY': 'Đã hủy',
      'THANH_TOAN_THAT_BAI': 'Thanh toán thất bại'
    };

    const orderDetail = {
      ...order,
      _id: order._id.toString(),
      id: order._id.toString(),
      orderTypeText: orderTypeMap[order.orderType] || order.orderType,
      statusText: statusMap[order.status] || order.status,
      customerName: order.customer ? (order.customer.name || order.customer.phone || 'Khách vãng lai') : 'Khách vãng lai',
      createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '',
      cancelReason: order.cancelReason || null,
      items
    };

    res.json(orderDetail);
  } catch (error) {
    console.error('[Admin API] Lỗi khi lấy chi tiết đơn hàng:', error);
    res.status(500).json({ message: 'Không thể tải chi tiết đơn hàng', error: error.message });
  }
});

// Update order status
router.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    const validStatuses = [
      'CHO_XAC_NHAN',
      'CHO_THANH_TOAN',
      'DA_XAC_NHAN',
      'DANG_CHUAN_BI',
      'DANG_GIAO',
      'HOAN_THANH',
      'DA_HUY',
      'THANH_TOAN_THAT_BAI'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    // Build update object
    const updateData = { status };
    if (cancelReason) {
      updateData.cancelReason = cancelReason;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('customer', 'name phone')
      .populate('promotion', 'name')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const orderTypeMap = {
      'TAI_CHO': 'Tại chỗ',
      'ONLINE': 'Giao hàng',
      'MANG_VE': 'Mang về'
    };
    
    const statusMap = {
      'CHO_XAC_NHAN': 'Chờ xác nhận',
      'CHO_THANH_TOAN': 'Chờ thanh toán',
      'DA_XAC_NHAN': 'Đã xác nhận',
      'DANG_CHUAN_BI': 'Đang chuẩn bị',
      'DANG_GIAO': 'Đang giao',
      'HOAN_THANH': 'Hoàn thành',
      'DA_HUY': 'Đã hủy',
      'THANH_TOAN_THAT_BAI': 'Thanh toán thất bại'
    };

    const updatedOrder = {
      ...order,
      _id: order._id.toString(),
      id: order._id.toString(),
      orderTypeText: orderTypeMap[order.orderType] || order.orderType,
      statusText: statusMap[order.status] || order.status,
      customerName: order.customer ? (order.customer.name || order.customer.phone || 'Khách vãng lai') : 'Khách vãng lai',
      createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '',
      cancelReason: order.cancelReason || null
    };

    res.json({
      message: 'Cập nhật trạng thái đơn hàng thành công',
      order: updatedOrder
    });
  } catch (error) {
    console.error('[Admin API] Lỗi khi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái đơn hàng', error: error.message });
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

// Category CRUD routes
router.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    const mappedCategories = categories.map(cat => ({
      ...cat,
      _id: cat._id.toString(),
      id: cat._id.toString()
    }));
    res.json(mappedCategories);
  } catch (error) {
    console.error('[Admin API] Lỗi khi lấy danh sách danh mục:', error);
    res.status(500).json({ message: 'Không thể tải danh sách danh mục', error: error.message });
  }
});

router.post('/api/categories', async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
  }

  try {
    // Check if category with same name exists
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Danh mục với tên này đã tồn tại' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || ''
    });

    const createdCategory = await Category.findById(category._id).lean();
    return res.status(201).json({
      ...createdCategory,
      _id: createdCategory._id.toString(),
      id: createdCategory._id.toString()
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Không thể tạo danh mục mới', error: error.message });
  }
});

router.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updateData = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Tên danh mục không được để trống' });
      }
      // Check if another category with same name exists
      const existing = await Category.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: 'Danh mục với tên này đã tồn tại' });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description || '';
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true
    }).lean();

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    return res.json({
      ...updatedCategory,
      _id: updatedCategory._id.toString(),
      id: updatedCategory._id.toString()
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Không thể cập nhật danh mục', error: error.message });
  }
});

router.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if any menu items use this category
    const itemsWithCategory = await MenuItem.countDocuments({ category: id });
    if (itemsWithCategory > 0) {
      return res.status(400).json({ 
        message: `Không thể xóa danh mục này vì có ${itemsWithCategory} món ăn đang sử dụng. Vui lòng xóa hoặc chuyển các món ăn sang danh mục khác trước.` 
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    return res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Không thể xóa danh mục', error: error.message });
  }
});

// Get all tables with reservation info for admin
router.get('/api/tables', async (req, res) => {
  try {
    console.log('[Admin API] GET /admin/api/tables - Request received');
    const { Table } = require('../models/Table');
    const { ReservationTable } = require('../models/ReservationTable');
    const { Reservation } = require('../models/Reservation');
    
    const tables = await Table.find({}).sort({ name: 1 }).lean();
    console.log(`[Admin API] Found ${tables.length} tables`);
    const now = new Date();
    
    // Get all active reservations
    const activeReservations = await Reservation.find({
      status: { $in: ['DANG_CHO', 'XAC_NHAN'] }
    }).lean();
    
    const reservationIds = activeReservations.map(r => r._id);
    
    let reservationTables = [];
    if (reservationIds.length > 0) {
      reservationTables = await ReservationTable.find({
        reservation: { $in: reservationIds }
      })
      .populate('table', 'name seats location status _id')
      .populate('reservation', 'status reservedAt')
      .lean();
    }
    
    console.log(`[Admin API] Found ${reservationTables.length} reservation-table links`);
    
    // Create map: tableId -> reservation info
    const tableReservationMap = {};
    reservationTables.forEach(rt => {
      // Handle both populated and non-populated table field
      const tableId = rt.table && typeof rt.table === 'object' && rt.table._id
        ? rt.table._id.toString()
        : (rt.table ? rt.table.toString() : null);
      
      if (tableId && rt.reservation) {
        if (!tableReservationMap[tableId]) {
          tableReservationMap[tableId] = [];
        }
        const reservationData = typeof rt.reservation === 'object' ? rt.reservation : {};
        tableReservationMap[tableId].push({
          status: reservationData.status || rt.reservation?.status,
          reservedAt: reservationData.reservedAt || rt.reservation?.reservedAt
        });
      }
    });
    
    const tablesData = tables.map(table => {
      const tableId = table._id.toString();
      const reservations = tableReservationMap[tableId] || [];
      
      // Determine display status
      let displayStatus = table.status; // TRONG, DANG_DUNG, DANG_DON
      let hasReservedPending = false;
      
      if (table.status === 'TRONG' && reservations.length > 0) {
        // Check if there's a reservation that's not confirmed or not yet time
        hasReservedPending = reservations.some(r => {
          const reservedTime = new Date(r.reservedAt);
          return r.status === 'DANG_CHO' || reservedTime > now;
        });
        
        if (hasReservedPending) {
          displayStatus = 'RESERVED';
        }
      }
      
      return {
        id: tableId,
        name: table.name,
        seats: table.seats,
        location: table.location || '',
        status: table.status,
        displayStatus: displayStatus, // TRONG, DANG_DUNG, DANG_DON, RESERVED
        reservations: reservations.map(r => ({
          status: r.status,
          reservedAt: r.reservedAt ? new Date(r.reservedAt).toISOString() : null
        }))
      };
    });
    
    res.json(tablesData);
  } catch (error) {
    console.error('[Admin API] Error fetching tables:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách bàn', error: error.message });
  }
});

// Update table status
router.put('/api/tables/:id', async (req, res) => {
  try {
    const { Table } = require('../models/Table');
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['TRONG', 'DANG_DUNG', 'DANG_DON'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    
    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({ message: 'Không tìm thấy bàn' });
    }
    
    table.status = status;
    await table.save();
    
    res.json({
      message: 'Cập nhật trạng thái bàn thành công',
      table: {
        id: table._id.toString(),
        name: table.name,
        status: table.status
      }
    });
  } catch (error) {
    console.error('[Admin API] Error updating table:', error);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái bàn', error: error.message });
  }
});

// Get all reservations
router.get('/api/reservations', async (req, res) => {
  try {
    console.log('[Admin API] GET /admin/api/reservations - Request received');
    const { Reservation } = require('../models/Reservation');
    const { ReservationTable } = require('../models/ReservationTable');
    const { Table } = require('../models/Table');
    
    const reservations = await Reservation.find({})
      .populate('customer', 'name phone')
      .sort({ reservedAt: -1, createdAt: -1 })
      .lean();
    
    console.log(`[Admin API] Found ${reservations.length} reservations in database`);
    
    // Get tables for each reservation
    const reservationsWithTables = await Promise.all(
      reservations.map(async (reservation) => {
        const reservationTables = await ReservationTable.find({ 
          reservation: reservation._id 
        }).populate('table', 'name seats location status').lean();
        
        const statusMap = {
          'DANG_CHO': 'Chờ xác nhận',
          'XAC_NHAN': 'Đã xác nhận',
          'DA_HUY': 'Đã hủy'
        };
        
        return {
          _id: reservation._id.toString(),
          id: reservation._id.toString(),
          customerName: reservation.customer 
            ? (reservation.customer.name || reservation.customer.phone || 'Khách vãng lai')
            : reservation.guestName || 'Khách vãng lai',
          customerPhone: reservation.customer?.phone || reservation.guestPhone || '',
          guestName: reservation.guestName,
          guestPhone: reservation.guestPhone,
          guestCount: reservation.guestCount,
          reservedAt: reservation.reservedAt ? new Date(reservation.reservedAt).toLocaleString('vi-VN') : '',
          reservedAtDate: reservation.reservedAt,
          status: reservation.status || 'DANG_CHO',
          statusText: statusMap[reservation.status] || reservation.status,
          createdAt: reservation.createdAt ? new Date(reservation.createdAt).toLocaleString('vi-VN') : '',
          tables: reservationTables.map(rt => rt.table ? {
            id: rt.table._id.toString(),
            name: rt.table.name,
            seats: rt.table.seats,
            location: rt.table.location || '',
            status: rt.table.status
          } : null).filter(Boolean),
          note: reservation.note || ''
        };
      })
    );
    
    console.log(`[Admin API] Returning ${reservationsWithTables.length} reservations`);
    res.json(reservationsWithTables);
  } catch (error) {
    console.error('[Admin API] Lỗi khi lấy danh sách đặt bàn:', error);
    res.status(500).json({ message: 'Không thể tải danh sách đặt bàn', error: error.message });
  }
});

// Update reservation status
router.put('/api/reservations/:id', async (req, res) => {
  try {
    const { Reservation } = require('../models/Reservation');
    const { ReservationTable } = require('../models/ReservationTable');
    const { Table } = require('../models/Table');
    
    const { id } = req.params;
    const { status, cancelReason } = req.body;
    
    if (!status || !['DANG_CHO', 'XAC_NHAN', 'DA_HUY', 'HOAN_THANH'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu đặt bàn' });
    }
    
    const oldStatus = reservation.status;
    reservation.status = status;
    if (cancelReason) {
      reservation.cancelReason = cancelReason;
    }
    await reservation.save();
    
    // Get tables linked to this reservation
    const reservationTables = await ReservationTable.find({ reservation: id })
      .populate('table')
      .lean();
    
    // Update table status based on reservation status
    if (status === 'XAC_NHAN') {
      // Confirm: set tables to DANG_DUNG
      for (const rt of reservationTables) {
        if (rt.table) {
          const table = await Table.findById(rt.table._id);
          if (table && table.status === 'TRONG') {
            table.status = 'DANG_DUNG';
            await table.save();
          }
        }
      }
    } else if (status === 'DA_HUY' && oldStatus === 'XAC_NHAN') {
      // Cancel after confirmed: set tables back to TRONG
      for (const rt of reservationTables) {
        if (rt.table) {
          const table = await Table.findById(rt.table._id);
          if (table && table.status === 'DANG_DUNG') {
            table.status = 'TRONG';
            await table.save();
          }
        }
      }
    } else if (status === 'HOAN_THANH') {
      // Complete: set tables back to TRONG
      for (const rt of reservationTables) {
        if (rt.table) {
          const table = await Table.findById(rt.table._id);
          if (table && table.status === 'DANG_DUNG') {
            table.status = 'TRONG';
            await table.save();
          }
        }
      }
    }
    
    res.json({ 
      message: 'Cập nhật trạng thái đặt bàn thành công',
      reservation: {
        id: reservation._id.toString(),
        status: reservation.status
      }
    });
  } catch (error) {
    console.error('[Admin API] Lỗi khi cập nhật đặt bàn:', error);
    res.status(500).json({ message: 'Không thể cập nhật đặt bàn', error: error.message });
  }
});

module.exports = router;


