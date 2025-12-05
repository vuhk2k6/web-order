const express = require('express');
const path = require('path');
const { MenuItem } = require('../models/MenuItem');

const router = express.Router();

router.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'views', 'index.html');
  res.sendFile(indexPath);
});

router.get('/menu', (req, res) => {
  const menuPath = path.join(__dirname, '..', 'views', 'menu.html');
  res.sendFile(menuPath);
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

router.get('/api/menu', async (req, res) => {
  try {
    console.log('[API /api/menu] Đang lấy dữ liệu từ collection menuitems...');
    const items = await MenuItem.find().sort({ createdAt: -1 }).lean();
    console.log(`[API /api/menu] Tìm thấy ${items.length} món ăn trong database`);
    
    // Map _id to string for frontend compatibility
    const mappedItems = items.map(item => ({
      ...item,
      _id: item._id.toString()
    }));
    
    if (mappedItems.length > 0) {
      console.log(`[API /api/menu] Mẫu món ăn đầu tiên:`, {
        _id: mappedItems[0]._id,
        name: mappedItems[0].name,
        price: mappedItems[0].price,
        image: mappedItems[0].image
      });
    }
    
    res.json(mappedItems);
  } catch (error) {
    console.error('[API /api/menu] Lỗi:', error);
    res.status(500).json({ message: 'Không thể tải thực đơn', error: error.message });
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
    
    // Create order
    const order = new Order({
      customer: customerId,
      orderType: mappedOrderType,
      totalAmount: total,
      deliveryFee: deliveryFee || 0,
      promotion: promotionId,
      status: 'CHO_XAC_NHAN'
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
          priceAtOrderTime: item.price
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
    
    // Handle points
    if (pointsUsed > 0 && customerId) {
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
    
    // Calculate earned points (1% of total)
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
    
    // Create payment record
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

module.exports = router;


