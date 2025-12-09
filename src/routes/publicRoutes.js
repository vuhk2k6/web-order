const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const { MenuItem } = require('../models/MenuItem');

const router = express.Router();

// MoMo Payment Configuration
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
  accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
  secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: process.env.MOMO_ENDPOINT || 'test-payment.momo.vn',
  requestType: 'captureWallet'
};

router.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'views', 'index.html');
  res.sendFile(indexPath);
});

router.get('/menu', (req, res) => {
  const menuPath = path.join(__dirname, '..', 'views', 'menu.html');
  res.sendFile(menuPath);
});

router.get('/menu/:id', (req, res) => {
  const menuItemDetailPath = path.join(__dirname, '..', 'views', 'menu-item-detail.html');
  res.sendFile(menuItemDetailPath);
});

router.get('/cart', (req, res) => {
  const cartPath = path.join(__dirname, '..', 'views', 'cart.html');
  res.sendFile(cartPath);
});

router.get('/reservation', (req, res) => {
  try {
    console.log('[Route /reservation] Route matched!');
    const reservationPath = path.join(__dirname, '..', 'views', 'reservation.html');
    console.log('[Route /reservation] Full path:', reservationPath);
    
    // Check if file exists
    if (!fs.existsSync(reservationPath)) {
      console.error('[Route /reservation] File not found at:', reservationPath);
      return res.status(404).send('Reservation page file not found');
    }
    
    console.log('[Route /reservation] File exists, sending...');
    res.sendFile(reservationPath);
  } catch (error) {
    console.error('[Route /reservation] Unexpected error:', error);
    if (!res.headersSent) {
      res.status(500).send('Error loading reservation page');
    }
  }
});

router.get('/profile', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/');
  }

  const profilePath = path.join(__dirname, '..', 'views', 'profile.html');
  return res.sendFile(profilePath);
});

router.get('/checkout', (req, res) => {
  const checkoutPath = path.join(__dirname, '..', 'views', 'checkout.html');
  res.sendFile(checkoutPath);
});

router.get('/orders/:orderId', (req, res) => {
  // Extract clean orderId - handle cases where MoMo might append extra data
  let orderId = req.params.orderId;
  if (orderId && orderId.includes(',')) {
    orderId = orderId.split(',')[0];
  }
  
  // Store cleaned orderId for the view to use
  // The view will extract it from URL anyway, but we can validate here
  const orderPath = path.join(__dirname, '..', 'views', 'order.html');
  res.sendFile(orderPath);
});

router.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find()
      .populate('category', 'name _id')
      .sort({ createdAt: -1 })
      .lean();

    // Map _id to string for frontend compatibility and format category
    const mappedItems = items.map(item => ({
      ...item,
      _id: item._id.toString(),
      category: item.category ? {
        _id: item.category._id.toString(),
        id: item.category._id.toString(),
        name: item.category.name
      } : null
    }));

    res.json(mappedItems);
  } catch (error) {
    console.error('[API /api/menu] Lỗi:', error);
    res.status(500).json({ message: 'Không thể tải thực đơn', error: error.message });
  }
});

// Get single menu item detail
router.get('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id)
      .populate('category', 'name _id')
      .lean();

    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }

    // Map _id to string for frontend compatibility and format category
    const mappedItem = {
      ...item,
      _id: item._id.toString(),
      id: item._id.toString(),
      category: item.category ? {
        _id: item.category._id.toString(),
        id: item.category._id.toString(),
        name: item.category.name
      } : null
    };

    res.json(mappedItem);
  } catch (error) {
    console.error('[API /api/menu/:id] Lỗi:', error);
    res.status(500).json({ message: 'Không thể tải chi tiết món ăn', error: error.message });
  }
});

// Get reviews for a menu item
router.get('/api/menu/:id/reviews', async (req, res) => {
  try {
    const { MenuItemReview } = require('../models/MenuItemReview');
    const { id } = req.params;
    
    const reviews = await MenuItemReview.find({ menuItem: id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate average rating
    const ratings = reviews.map(r => r.rating);
    const averageRating = ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : 0;

    // Count ratings by star
    const ratingCounts = {
      5: ratings.filter(r => r === 5).length,
      4: ratings.filter(r => r === 4).length,
      3: ratings.filter(r => r === 3).length,
      2: ratings.filter(r => r === 2).length,
      1: ratings.filter(r => r === 1).length
    };

    const mappedReviews = reviews.map(review => ({
      _id: review._id.toString(),
      id: review._id.toString(),
      rating: review.rating,
      content: review.content || '',
      customer: review.customer ? {
        name: review.customer.name || 'Khách hàng',
        email: review.customer.email || ''
      } : { name: 'Khách hàng', email: '' },
      createdAt: review.createdAt
    }));

    res.json({
      reviews: mappedReviews,
      averageRating: parseFloat(averageRating),
      totalReviews: reviews.length,
      ratingCounts
    });
  } catch (error) {
    console.error('[API /api/menu/:id/reviews] Lỗi:', error);
    res.status(500).json({ message: 'Không thể tải đánh giá', error: error.message });
  }
});

// Create a review for a menu item
router.post('/api/menu/:id/reviews', async (req, res) => {
  try {
    const { MenuItemReview } = require('../models/MenuItemReview');
    const { Customer } = require('../models/Customer');
    const { id } = req.params;
    const { rating, content } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });
    }

    // Get customer from session or token
    const customerId = req.session?.userId || req.user?.id;
    if (!customerId) {
      console.error('[API /api/menu/:id/reviews POST] No customer ID found in session:', {
        hasSession: !!req.session,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        userId: req.session?.userId,
        customerId: req.session?.customerId,
        user: req.user
      });
      return res.status(401).json({ message: 'Vui lòng đăng nhập để đánh giá' });
    }

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    // Check if menu item exists
    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }

    // Check if customer already reviewed this item
    const existingReview = await MenuItemReview.findOne({
      menuItem: id,
      customer: customerId
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.content = content || '';
      await existingReview.save();

      const updatedReview = await MenuItemReview.findById(existingReview._id)
        .populate('customer', 'name email')
        .lean();

      return res.json({
        review: {
          _id: updatedReview._id.toString(),
          id: updatedReview._id.toString(),
          rating: updatedReview.rating,
          content: updatedReview.content || '',
          customer: updatedReview.customer ? {
            name: updatedReview.customer.name || 'Khách hàng',
            email: updatedReview.customer.email || ''
          } : { name: 'Khách hàng', email: '' },
          createdAt: updatedReview.createdAt
        },
        message: 'Cập nhật đánh giá thành công'
      });
    }

    // Create new review
    const review = new MenuItemReview({
      menuItem: id,
      customer: customerId,
      rating,
      content: content || ''
    });

    await review.save();

    const newReview = await MenuItemReview.findById(review._id)
      .populate('customer', 'name email')
      .lean();

    res.status(201).json({
      review: {
        _id: newReview._id.toString(),
        id: newReview._id.toString(),
        rating: newReview.rating,
        content: newReview.content || '',
        customer: newReview.customer ? {
          name: newReview.customer.name || 'Khách hàng',
          email: newReview.customer.email || ''
        } : { name: 'Khách hàng', email: '' },
        createdAt: newReview.createdAt
      },
      message: 'Đánh giá thành công'
    });
  } catch (error) {
    console.error('[API /api/menu/:id/reviews POST] Lỗi:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bạn đã đánh giá món ăn này rồi' });
    }
    res.status(500).json({ message: 'Không thể tạo đánh giá', error: error.message });
  }
});

// Get member info
router.get('/api/member/:userId', async (req, res) => {
  try {
    const { Member } = require('../models/Member');
    const member = await Member.findOne({ customer: req.params.userId }).lean();
    
    if (!member) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin thành viên' });
    }
    
    res.json({ member });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin thành viên:', error);
    res.status(500).json({ message: 'Không thể lấy thông tin thành viên', error: error.message });
  }
});

// Get user profile data (orders, stats, member info)
router.get('/api/profile', async (req, res) => {
  try {
    const customerId = req.session?.userId;
    if (!customerId) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const { Customer } = require('../models/Customer');
    const { Order } = require('../models/Order');
    const { Member } = require('../models/Member');
    const { PointTransaction } = require('../models/PointTransaction');
    const { DeliveryAddress } = require('../models/DeliveryAddress');
    
    // Get customer info from database
    const customer = await Customer.findById(customerId).lean();
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng' });
    }
    
    // Get member info
    const member = await Member.findOne({ customer: customerId }).lean();
    
    // Get orders statistics
    const allOrders = await Order.find({ customer: customerId }).lean();
    const totalOrders = allOrders.length;
    const totalSpent = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const completedOrders = allOrders.filter(o => o.status === 'HOAN_THANH').length;
    
    // Get recent orders (last 5)
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

    const orderTypeMap = {
      'TAI_CHO': 'Tại chỗ',
      'ONLINE': 'Giao hàng',
      'MANG_VE': 'Mang về'
    };

    const recentOrders = allOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        _id: order._id.toString(),
        id: order._id.toString(),
        totalAmount: order.totalAmount || 0,
        status: order.status,
        statusText: statusMap[order.status] || order.status,
        orderType: order.orderType,
        orderTypeText: orderTypeMap[order.orderType] || order.orderType,
        createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''
      }));
    
    // Get point transactions
    const pointTransactions = [];
    if (member) {
      const transactions = await PointTransaction.find({ member: member._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      
      pointTransactions.push(...transactions.map(tx => ({
        id: tx._id.toString(),
        type: tx.type,
        points: tx.points || 0,
        note: tx.note || '',
        createdAt: tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : ''
      })));
    }
    
    // Get saved addresses
    const orderIds = allOrders.map(o => o._id);
    const addresses = await DeliveryAddress.find({ order: { $in: orderIds } })
      .select('address ward district deliveryNote')
      .lean();
    
    // Remove duplicates addresses
    const uniqueAddresses = [];
    const addressStrings = new Set();
    addresses.forEach(addr => {
      const addrString = [addr.address, addr.ward, addr.district].filter(Boolean).join(', ');
      if (addrString && !addressStrings.has(addrString)) {
        addressStrings.add(addrString);
        uniqueAddresses.push({
          address: addr.address,
          ward: addr.ward,
          district: addr.district,
          note: addr.deliveryNote || ''
        });
      }
    });
    
    const responseData = {
      customer: {
        id: customer._id.toString(),
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        accountType: customer.accountType || 'KHACH',
        createdAt: customer.createdAt ? new Date(customer.createdAt).toISOString() : null
      },
      member: member ? {
        points: member.points || 0,
        tier: member.tier || 'BRONZE',
        totalSpent: member.totalSpent || 0
      } : null,
      stats: {
        totalOrders,
        totalSpent,
        completedOrders,
        points: member?.points || 0
      },
      recentOrders,
      pointTransactions,
      savedAddresses: uniqueAddresses
    };

    console.log('[Profile API] Response data:', {
      customer: responseData.customer,
      stats: responseData.stats,
      recentOrdersCount: responseData.recentOrders.length,
      pointTransactionsCount: responseData.pointTransactions.length,
      savedAddressesCount: responseData.savedAddresses.length,
      hasMember: !!responseData.member
    });

    res.json(responseData);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin profile:', error);
    res.status(500).json({ message: 'Không thể lấy thông tin profile', error: error.message });
  }
});

// Get saved delivery addresses (for logged-in users)
router.get('/api/delivery-addresses', async (req, res) => {
  try {
    const customerId = req.session?.userId;
    if (!customerId) {
      return res.json({ addresses: [] });
    }

    const { DeliveryAddress } = require('../models/DeliveryAddress');
    const { Order } = require('../models/Order');
    
    // Get addresses from previous orders
    const orders = await Order.find({ customer: customerId }).select('_id').lean();
    const orderIds = orders.map(o => o._id);
    
    const addresses = await DeliveryAddress.find({ order: { $in: orderIds } })
      .select('address ward district deliveryNote')
      .lean();
    
    res.json({ addresses });
  } catch (error) {
    console.error('Lỗi khi lấy địa chỉ đã lưu:', error);
    res.status(500).json({ message: 'Không thể lấy địa chỉ đã lưu', error: error.message });
  }
});

// Get order details
router.get('/api/orders/:orderId', async (req, res) => {
  try {
    console.log('[Order Details] Request received:', req.params.orderId);
    
    const { Order } = require('../models/Order');
    const { OrderItem } = require('../models/OrderItem');
    const { Payment } = require('../models/Payment');
    const { DeliveryAddress } = require('../models/DeliveryAddress');
    const { DineInOrder } = require('../models/DineInOrder');
    const { Promotion } = require('../models/Promotion');
    const { MenuItem } = require('../models/MenuItem');
    const { Customer } = require('../models/Customer');
    
    // Extract orderId - handle cases where MoMo might append extra data
    let orderId = req.params.orderId;
    // If there's a comma, take only the part before it (our MongoDB ObjectId)
    if (orderId && orderId.includes(',')) {
      orderId = orderId.split(',')[0];
      console.log('[Order Details] Cleaned orderId:', orderId);
    }
    
    // Validate MongoDB ObjectId format
    if (!orderId || !/^[a-f\d]{24}$/i.test(orderId)) {
      console.error('[Order Details] Invalid orderId format:', orderId);
      return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
    }
    
    console.log('[Order Details] Looking up order:', orderId);
    
    let order;
    try {
      order = await Order.findById(orderId)
        .populate('customer', 'firstname lastname phone email')
        .populate('promotion')
        .lean();
    } catch (error) {
      console.error('[Order Details] Error fetching order:', error);
      throw error;
    }
    
    if (!order) {
      console.error('[Order Details] Order not found:', orderId);
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    console.log('[Order Details] Order found:', order._id);
    
    // Get order items
    const orderItems = await OrderItem.find({ order: order._id }).lean();
    
    // Map items with menu item details
    const items = await Promise.all(orderItems.map(async (item) => {
      try {
        // item.dish is a reference (ObjectId), need to populate or find
        const dishId = item.dish?.toString ? item.dish.toString() : item.dish;
        const menuItem = dishId ? await MenuItem.findById(dishId).lean() : null;
        
        return {
          name: menuItem?.name || 'Món không xác định',
          quantity: item.quantity || 1,
          price: item.priceAtOrderTime || 0,
          total: (item.quantity || 1) * (item.priceAtOrderTime || 0),
          image: menuItem?.image || null,
          size: item.selectedSize || null,
          note: item.note || null
        };
      } catch (error) {
        console.error('[Order Details] Error processing item:', error);
        // Return item data even if menu item lookup fails
        return {
          name: 'Món không xác định',
          quantity: item.quantity || 1,
          price: item.priceAtOrderTime || 0,
          total: (item.quantity || 1) * (item.priceAtOrderTime || 0),
          image: null,
          size: item.selectedSize || null,
          note: item.note || null
        };
      }
    }));
    
    // Get payment info
    let payment = null;
    try {
      payment = await Payment.findOne({ order: order._id }).lean();
    } catch (error) {
      console.error('[Order Details] Error fetching payment:', error);
      // Continue without payment info
    }
    
    // Get delivery address if exists
    let deliveryAddress = null;
    try {
      deliveryAddress = await DeliveryAddress.findOne({ order: order._id }).lean();
    } catch (error) {
      console.error('[Order Details] Error fetching delivery address:', error);
      // Continue without delivery address
    }
    
    // Get dine-in info if exists
    let dineInOrder = null;
    try {
      dineInOrder = await DineInOrder.findOne({ order: order._id })
        .populate('table')
        .lean();
    } catch (error) {
      console.error('[Order Details] Error fetching dine-in order:', error);
      // Continue without dine-in info
    }
    
    // Map order type
    const orderTypeMap = {
      'MANG_VE': 'Mang về',
      'ONLINE': 'Giao hàng',
      'TAI_CHO': 'Tại chỗ'
    };
    
    // Map status
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
    
    // Map payment method
    const paymentMethodMap = {
      'TIEN_MAT': 'Tiền mặt',
      'ONLINE': 'Thanh toán online'
    };
    
    res.json({
      order: {
        id: order._id.toString(),
        orderType: orderTypeMap[order.orderType] || order.orderType,
        status: statusMap[order.status] || order.status,
        statusCode: order.status,
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee || 0,
        createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '',
        customer: order.customer ? {
          name: `${order.customer.firstname || ''} ${order.customer.lastname || ''}`.trim() || order.customer.phone || 'Khách vãng lai',
          phone: order.customer.phone || '',
          email: order.customer.email || ''
        } : null,
        promotion: order.promotion ? {
          name: order.promotion.name || '',
          discountType: order.promotion.discountType,
          value: order.promotion.value
        } : null
      },
      items: items,
      payment: payment ? {
        method: paymentMethodMap[payment.method] || payment.method,
        amount: payment.amount,
        paidAt: payment.paidAt ? new Date(payment.paidAt).toLocaleString('vi-VN') : '',
        transactionCode: payment.transactionCode || ''
      } : null,
      deliveryAddress: deliveryAddress ? {
        address: deliveryAddress.address || '',
        ward: deliveryAddress.ward || '',
        district: deliveryAddress.district || '',
        note: deliveryAddress.deliveryNote || ''
      } : null,
      dineIn: dineInOrder ? {
        tableName: dineInOrder.table?.name || '',
        checkInTime: dineInOrder.checkInTime ? new Date(dineInOrder.checkInTime).toLocaleString('vi-VN') : ''
      } : null
    });
    
    console.log('[Order Details] Successfully returned order details');
  } catch (error) {
    console.error('[Order Details] Error:', error);
    console.error('[Order Details] Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Không thể lấy chi tiết đơn hàng', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Validate promotion code
router.get('/api/promotions/validate/:code', async (req, res) => {
  try {
    const { Promotion } = require('../models/Promotion');
    const promotion = await Promotion.findOne({ 
      name: req.params.code.toUpperCase(),
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).lean();
    
    if (!promotion) {
      return res.json({ valid: false, message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn' });
    }
    
    // Get subtotal from query or default to 0
    const subtotal = parseFloat(req.query.subtotal) || 0;
    
    // Check minimum order amount
    if (promotion.minOrderAmount && subtotal < promotion.minOrderAmount) {
      return res.json({ 
        valid: false, 
        message: `Đơn hàng tối thiểu ${promotion.minOrderAmount.toLocaleString('vi-VN')} đ để áp dụng mã này` 
      });
    }
    
    // Calculate discount amount
    let discount = 0;
    if (promotion.discountType === 'PERCENT') {
      discount = Math.floor(subtotal * promotion.value / 100);
    } else {
      discount = promotion.value;
    }
    
    res.json({
      valid: true,
      name: promotion.name,
      discount: discount,
      discountType: promotion.discountType,
      value: promotion.value,
      minOrderAmount: promotion.minOrderAmount || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Không thể kiểm tra mã khuyến mãi', error: error.message });
  }
});

// Create order
router.post('/api/orders', async (req, res) => {
  try {
    const { Order } = require('../models/Order');
    const { OrderItem } = require('../models/OrderItem');
    const { Payment } = require('../models/Payment');
    const { DeliveryAddress } = require('../models/DeliveryAddress');
    const { DineInOrder } = require('../models/DineInOrder');
    const { PointTransaction } = require('../models/PointTransaction');
    const { Member } = require('../models/Member');
    const { Promotion } = require('../models/Promotion');
    const { MenuItem } = require('../models/MenuItem');
    
    const {
      orderType,
      items,
      subtotal,
      pointsUsed,
      promoCode,
      promoDiscount,
      deliveryFee,
      total,
      paymentMethod,
      onlineMethod,
      deliveryAddress,
      tableNumber
    } = req.body;
    
    // Map order type
    const orderTypeMap = {
      'TAKEAWAY': 'MANG_VE',
      'DELIVERY': 'ONLINE',
      'DINE_IN': 'TAI_CHO'
    };
    const mappedOrderType = orderTypeMap[orderType] || orderType;
    
    // Get customer ID from session
    const customerId = req.session?.userId || null;
    
    // Get promotion if promoCode exists
    let promotionId = null;
    if (promoCode) {
      const promotion = await Promotion.findOne({ name: promoCode.toUpperCase() });
      if (promotion) {
        promotionId = promotion._id;
      }
    }
    
    // Create order - default status is CHO_XAC_NHAN (Chờ xác nhận)
    const order = new Order({
      customer: customerId,
      orderType: mappedOrderType,
      totalAmount: total,
      deliveryFee: deliveryFee || 0,
      promotion: promotionId,
      status: 'CHO_XAC_NHAN' // Trạng thái mặc định khi tạo đơn
    });
    await order.save();
    
    // Create order items
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.id);
      if (menuItem) {
        const orderItem = new OrderItem({
          order: order._id,
          dish: menuItem._id, // Note: field name is 'dish' but we're using MenuItem ID
          quantity: item.quantity,
          priceAtOrderTime: item.price,
          selectedSize: item.size || null,
          note: item.note || ''
        });
        await orderItem.save();
      }
    }
    
    // Handle delivery address
    if (orderType === 'DELIVERY' && deliveryAddress) {
      const addressString = [
        deliveryAddress.street,
        deliveryAddress.ward,
        deliveryAddress.district,
        deliveryAddress.city
      ].filter(Boolean).join(', ');
      
      const address = new DeliveryAddress({
        order: order._id,
        address: addressString,
        ward: deliveryAddress.ward || '',
        district: deliveryAddress.district || '',
        deliveryNote: deliveryAddress.phone ? `SĐT: ${deliveryAddress.phone}` : ''
      });
      await address.save();
    }
    
    // Handle dine-in
    if (orderType === 'DINE_IN' && tableNumber) {
      const { Table } = require('../models/Table');
      // Try to find table by name/number, or create a reference
      let tableId = null;
      const table = await Table.findOne({ name: tableNumber });
      if (table) {
        tableId = table._id;
        // Update table status
        table.status = 'DANG_DUNG';
        await table.save();
      } else {
        // Create a temporary table reference if not found
        const newTable = new Table({
          name: tableNumber,
          seats: 4,
          status: 'DANG_DUNG'
        });
        await newTable.save();
        tableId = newTable._id;
      }
      
      const dineIn = new DineInOrder({
        order: order._id,
        table: tableId,
        checkInTime: new Date()
      });
      await dineIn.save();
    }
    
    // Handle points - only deduct for non-MoMo payments immediately
    // For MoMo, points will be deducted after successful payment
    if (pointsUsed > 0 && customerId && paymentMethod !== 'MOMO') {
      const member = await Member.findOne({ customer: customerId });
      if (member && member.points >= pointsUsed) {
        // Deduct points
        member.points -= pointsUsed;
        await member.save();
        
        // Record transaction (points is positive, type indicates direction)
        const pointTransaction = new PointTransaction({
          member: member._id,
          type: 'TIEU',
          points: pointsUsed,
          note: `Sử dụng ${pointsUsed} điểm cho đơn hàng #${order._id}`
        });
        await pointTransaction.save();
      }
    }
    
    // Calculate earned points (1% of total) - only for non-MoMo payments immediately
    // For MoMo, points will be awarded after successful payment
    if (paymentMethod !== 'MOMO') {
      const earnedPoints = Math.floor(total * 0.01);
      if (earnedPoints > 0 && customerId) {
        const member = await Member.findOne({ customer: customerId });
        if (member) {
          member.points += earnedPoints;
          await member.save();
          
          const pointTransaction = new PointTransaction({
            member: member._id,
            type: 'TICH',
            points: earnedPoints,
            note: `Tích điểm từ đơn hàng #${order._id}`
          });
          await pointTransaction.save();
        }
      }
    }
    
    // Handle payment based on method
    if (paymentMethod === 'MOMO') {
      // For MoMo, order status should be pending payment
      order.status = 'CHO_THANH_TOAN';
      await order.save();
      
      // Don't create payment record yet - will be created after successful payment
      // Return orderId so frontend can initiate MoMo payment
      res.status(201).json({
        message: 'Đơn hàng đã được tạo, vui lòng thanh toán',
        orderId: order._id,
        requiresPayment: true,
        paymentMethod: 'MOMO'
      });
      return;
    }
    
    // For COD and other payment methods, create payment record immediately
    const paymentMethodMap = {
      'COD': 'TIEN_MAT',
      'ONLINE': 'ONLINE'
    };
    const mappedPaymentMethod = paymentMethodMap[paymentMethod] || 'TIEN_MAT';
    
    const transactionCode = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const payment = new Payment({
      order: order._id,
      method: mappedPaymentMethod,
      paidAt: new Date(),
      amount: total,
      transactionCode: transactionCode
    });
    await payment.save();
    
    res.status(201).json({
      message: 'Đơn hàng đã được tạo thành công',
      orderId: order._id,
      transactionCode: transactionCode
    });
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    res.status(500).json({ message: 'Không thể tạo đơn hàng', error: error.message });
  }
});

// Create MoMo payment request
router.post('/api/payments/momo/create', async (req, res) => {
  try {
    const { Order } = require('../models/Order');
    const { orderId, pointsUsed } = req.body;
    
    console.log('[MoMo Create] Request received:', { orderId, pointsUsed });
    
    if (!orderId) {
      console.error('[MoMo Create] Missing orderId');
      return res.status(400).json({ message: 'Thiếu thông tin đơn hàng' });
    }
    
    const order = await Order.findById(orderId).lean();
    if (!order) {
      console.error('[MoMo Create] Order not found:', orderId);
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    console.log('[MoMo Create] Order found:', { orderId: order._id, totalAmount: order.totalAmount });
    
    // Generate request ID and order ID for MoMo
    const requestId = MOMO_CONFIG.partnerCode + new Date().getTime();
    const momoOrderId = requestId;
    const amount = Math.round(order.totalAmount).toString();
    
    // Validate amount
    if (!amount || amount === '0' || isNaN(amount)) {
      console.error('[MoMo Create] Invalid amount:', amount);
      return res.status(400).json({ message: 'Số tiền thanh toán không hợp lệ' });
    }
    
    console.log('[MoMo Create] Amount:', amount, 'RequestId:', requestId);
    
    // Build redirect and IPN URLs
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    // Ensure orderId is URL encoded and clean
    const cleanOrderId = orderId.toString();
    const redirectUrl = `${baseUrl}/api/payments/momo/return?orderId=${encodeURIComponent(cleanOrderId)}`;
    const ipnUrl = `${baseUrl}/api/payments/momo/callback`;
    
    // Store orderId and pointsUsed in extraData (base64 encoded)
    const extraDataObj = { 
      orderId: orderId.toString(),
      pointsUsed: pointsUsed || 0
    };
    const extraData = Buffer.from(JSON.stringify(extraDataObj)).toString('base64');
    
    // Create raw signature - order matters!
    // According to MoMo docs: accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType
    // URLs should NOT be encoded in the signature string
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=Thanh toan don hang ${orderId}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${MOMO_CONFIG.requestType}`;
    
    console.log('[MoMo Create] Raw signature string:', rawSignature);
    
    // Generate signature
    const signature = crypto
      .createHmac('sha256', MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest('hex');
    
    console.log('[MoMo Create] Generated signature:', signature);
    
    // Build request body
    const requestBody = JSON.stringify({
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId: requestId,
      amount: amount,
      orderId: momoOrderId,
      orderInfo: `Thanh toan don hang ${orderId}`,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      extraData: extraData,
      requestType: MOMO_CONFIG.requestType,
      signature: signature,
      lang: 'vi'
    });
    
    // Create request to MoMo
    const options = {
      hostname: MOMO_CONFIG.endpoint,
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };
    
    // Make request to MoMo
    const momoRequest = https.request(options, (momoResponse) => {
      let data = '';
      
      momoResponse.on('data', (chunk) => {
        data += chunk;
      });
      
      momoResponse.on('end', () => {
        try {
          console.log('[MoMo Create] Response status:', momoResponse.statusCode);
          console.log('[MoMo Create] Response data:', data);
          
          const responseData = JSON.parse(data);
          
          if (responseData.resultCode === 0 && responseData.payUrl) {
            console.log('[MoMo Create] Payment URL generated successfully');
            // Store MoMo orderId mapping for callback verification
            // You might want to store this in a database table
            // For now, we'll pass it via extraData
            res.json({
              success: true,
              payUrl: responseData.payUrl,
              orderId: orderId,
              momoOrderId: momoOrderId
            });
          } else {
            console.error('[MoMo Create] MoMo API Error:', responseData);
            const errorMessage = responseData.message || responseData.localMessage || `Result code: ${responseData.resultCode}` || 'Unknown error';
            res.status(400).json({
              success: false,
              message: 'Không thể tạo yêu cầu thanh toán MoMo',
              error: errorMessage,
              resultCode: responseData.resultCode
            });
          }
        } catch (error) {
          console.error('[MoMo Create] Error parsing MoMo response:', error);
          console.error('[MoMo Create] Raw response:', data);
          res.status(500).json({ 
            success: false,
            message: 'Lỗi xử lý phản hồi từ MoMo',
            error: error.message 
          });
        }
      });
    });
    
    momoRequest.on('error', (error) => {
      console.error('[MoMo Create] Request error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Lỗi kết nối đến MoMo',
        error: error.message 
      });
    });
    
    momoRequest.write(requestBody);
    momoRequest.end();
  } catch (error) {
    console.error('[MoMo Create] Unexpected error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Không thể tạo yêu cầu thanh toán', 
      error: error.message 
    });
  }
});

// MoMo callback handler (IPN)
router.post('/api/payments/momo/callback', async (req, res) => {
  try {
    const { Order } = require('../models/Order');
    const { Payment } = require('../models/Payment');
    const { Member } = require('../models/Member');
    const { PointTransaction } = require('../models/PointTransaction');
    
    const {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId: momoOrderId,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = req.body;
    
    // Verify signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${momoOrderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Invalid MoMo callback signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }
    
    // Extract orderId and pointsUsed from extraData or orderInfo
    let actualOrderId = null;
    let extraDataObj = {};
    try {
      if (extraData) {
        const decodedExtraData = Buffer.from(extraData, 'base64').toString('utf-8');
        extraDataObj = JSON.parse(decodedExtraData);
        actualOrderId = extraDataObj.orderId;
      }
    } catch (e) {
      // Try to extract from orderInfo as fallback
      const match = orderInfo.match(/don hang (.+)/);
      if (match) {
        actualOrderId = match[1];
      }
    }
    
    if (!actualOrderId) {
      console.error('Cannot extract orderId from MoMo callback');
      return res.status(400).json({ message: 'Cannot extract orderId' });
    }
    
    const order = await Order.findById(actualOrderId);
    if (!order) {
      console.error('Order not found:', actualOrderId);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Handle payment result
    if (resultCode === 0) {
      // Payment successful
      order.status = 'CHO_XAC_NHAN';
      await order.save();
      
      // Create payment record
      const payment = new Payment({
        order: order._id,
        method: 'ONLINE',
        paidAt: new Date(),
        amount: parseFloat(amount),
        transactionCode: transId || momoOrderId
      });
      await payment.save();
      
      const customerId = order.customer;
      if (customerId) {
        // Deduct points used (if any)
        const pointsUsed = extraDataObj.pointsUsed || 0;
        if (pointsUsed > 0) {
          const member = await Member.findOne({ customer: customerId });
          if (member && member.points >= pointsUsed) {
            member.points -= pointsUsed;
            await member.save();
            
            const pointTransaction = new PointTransaction({
              member: member._id,
              type: 'TIEU',
              points: pointsUsed,
              note: `Sử dụng ${pointsUsed} điểm cho đơn hàng #${order._id}`
            });
            await pointTransaction.save();
          }
        }
        
        // Award earned points (1% of total)
        const earnedPoints = Math.floor(parseFloat(amount) * 0.01);
        if (earnedPoints > 0) {
          const member = await Member.findOne({ customer: customerId });
          if (member) {
            member.points += earnedPoints;
            await member.save();
            
            const pointTransaction = new PointTransaction({
              member: member._id,
              type: 'TICH',
              points: earnedPoints,
              note: `Tích điểm từ đơn hàng #${order._id}`
            });
            await pointTransaction.save();
          }
        }
      }
    } else {
      // Payment failed
      order.status = 'THANH_TOAN_THAT_BAI';
      await order.save();
    }
    
    res.status(200).json({ message: 'Callback processed' });
  } catch (error) {
    console.error('Error processing MoMo callback:', error);
    res.status(500).json({ message: 'Error processing callback' });
  }
});

// Get all tables with status
router.get('/api/tables', async (req, res) => {
  try {
    const { Table } = require('../models/Table');
    const { ReservationTable } = require('../models/ReservationTable');
    const { Reservation } = require('../models/Reservation');
    
    // Fetch all tables from database, sorted by name
    const tables = await Table.find({})
      .sort({ name: 1 })
      .lean();
    
    console.log(`[Tables API] Found ${tables.length} tables in database`);
    
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
    
    // Map table data to response format with displayStatus
    const tablesData = tables.map(table => {
      const tableId = table._id.toString();
      const reservations = tableReservationMap[tableId] || [];
      
      // Determine display status (same logic as admin)
      let displayStatus = table.status; // TRONG, DANG_DUNG, DANG_DON
      
      if (table.status === 'TRONG' && reservations.length > 0) {
        // Check if there's a reservation that's not confirmed or not yet time
        const hasReservedPending = reservations.some(r => {
          const reservedTime = new Date(r.reservedAt);
          return r.status === 'DANG_CHO' || reservedTime > now;
        });
        
        if (hasReservedPending) {
          displayStatus = 'RESERVED';
        }
      }
      
      return {
        id: tableId,
        name: table.name || '',
        seats: table.seats || 0,
        location: table.location || '',
        status: table.status || 'TRONG',
        displayStatus: displayStatus, // TRONG, DANG_DUNG, DANG_DON, RESERVED
        createdAt: table.createdAt ? new Date(table.createdAt).toISOString() : null,
        updatedAt: table.updatedAt ? new Date(table.updatedAt).toISOString() : null
      };
    });
    
    res.json(tablesData);
  } catch (error) {
    console.error('[Tables API] Error fetching tables from database:', error);
    res.status(500).json({
      message: 'Không thể lấy danh sách bàn',
      error: error.message
    });
  }
});

// Create reservation
router.post('/api/reservations', async (req, res) => {
  try {
    const { Reservation } = require('../models/Reservation');
    const { ReservationTable } = require('../models/ReservationTable');
    const { Table } = require('../models/Table');
    
    const { guestName, guestPhone, guestCount, reservedAt, note, tableIds } = req.body;
    
    if (!guestName || !guestPhone || !guestCount || !reservedAt) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }
    
    // Get customer from session if logged in
    const customerId = req.session?.userId || null;
    
    // Create reservation
    const reservation = new Reservation({
      customer: customerId,
      guestName,
      guestPhone,
      reservedAt: new Date(reservedAt),
      guestCount: parseInt(guestCount, 10),
      status: 'DANG_CHO',
      note: note || undefined
    });
    await reservation.save();
    
    // Link tables if provided
    if (tableIds && Array.isArray(tableIds) && tableIds.length > 0) {
      for (const tableId of tableIds) {
        // Verify table exists and is available
        const table = await Table.findById(tableId);
        if (table && table.status === 'TRONG') {
          const reservationTable = new ReservationTable({
            reservation: reservation._id,
            table: tableId
          });
          await reservationTable.save();
          
          // Update table status to reserved (or keep TRONG if you want to update on confirmation)
          // table.status = 'DANG_DUNG';
          // await table.save();
        }
      }
    }
    
    res.status(201).json({
      message: 'Đặt bàn thành công',
      reservationId: reservation._id.toString()
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Không thể tạo đặt bàn', error: error.message });
  }
});

// MoMo return URL handler
router.get('/api/payments/momo/return', async (req, res) => {
  try {
    const { orderId, resultCode, message } = req.query;
    
    // Extract clean orderId if there's extra data
    let cleanOrderId = orderId;
    if (cleanOrderId && cleanOrderId.includes(',')) {
      cleanOrderId = cleanOrderId.split(',')[0];
    }
    
    // Redirect to order confirmation page or show result
    if (resultCode === '0' || resultCode === 0) {
      // Payment successful
      if (cleanOrderId) {
        return res.redirect(`/orders/${cleanOrderId}?payment=success`);
      }
      return res.send(`
        <!DOCTYPE html>
        <html lang="vi">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thanh toán thành công</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
              }
              .container {
                text-align: center;
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              h1 { color: #22c55e; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Thanh toán thành công!</h1>
              <p>Cảm ơn bạn đã thanh toán.</p>
              <p>Đang chuyển hướng...</p>
              <script>setTimeout(() => window.location.href = '/', 3000);</script>
            </div>
          </body>
        </html>
      `);
    } else {
      // Payment failed or cancelled
      return res.send(`
        <!DOCTYPE html>
        <html lang="vi">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thanh toán thất bại</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
              }
              .container {
                text-align: center;
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              h1 { color: #ef4444; }
              a {
                display: inline-block;
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: #3b82f6;
                color: white;
                text-decoration: none;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Thanh toán thất bại</h1>
              <p>${message || 'Đã xảy ra lỗi trong quá trình thanh toán.'}</p>
              <a href="/checkout">Quay lại trang thanh toán</a>
              <script>setTimeout(() => window.location.href = '/checkout', 5000);</script>
            </div>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error handling MoMo return:', error);
    res.status(500).send('Error processing return URL');
  }
});

module.exports = router;


