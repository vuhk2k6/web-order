const express = require('express');
const bcrypt = require('bcrypt');
const { Customer } = require('../models/Customer');
const { Member } = require('../models/Member');

const router = express.Router();

const SALT_ROUNDS = 10;

const sanitizeCustomer = (customer) => {
  if (!customer) {
    return null;
  }

  return {
    id: customer._id.toString(),
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone || '',
    accountType: customer.accountType || 'KHACH',
    createdAt: customer.createdAt
  };
};

router.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({ user: null });
    }

    const customer = await Customer.findById(req.session.userId).lean();

    if (!customer) {
      req.session = null;
      return res.json({ user: null });
    }

    return res.json({ user: sanitizeCustomer(customer) });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể lấy thông tin người dùng', error: error.message });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res
      .status(400)
      .json({ message: 'Họ tên, số điện thoại và mật khẩu là bắt buộc.' });
  }

  try {
    const existingByPhone = await Customer.findOne({ phone }).lean();

    if (existingByPhone) {
      return res
        .status(409)
        .json({ message: 'Số điện thoại đã được sử dụng. Vui lòng đăng nhập.' });
    }

    if (email) {
      const existingByEmail = await Customer.findOne({ email }).lean();

      if (existingByEmail) {
        return res
          .status(409)
          .json({ message: 'Email đã được sử dụng. Vui lòng dùng email khác.' });
      }
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const customer = await Customer.create({
      name,
      email: email || '',
      phone,
      passwordHash,
      accountType: 'THANH_VIEN'
    });

    await Member.create({
      customer: customer._id,
      points: 0,
      tier: 'BRONZE',
      totalSpent: 0
    });

    if (req.session) {
      req.session.userId = customer._id.toString();
    }

    return res.status(201).json({ user: sanitizeCustomer(customer) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Không thể tạo tài khoản. Vui lòng thử lại sau.', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res
      .status(400)
      .json({ message: 'Vui lòng nhập đầy đủ số điện thoại và mật khẩu.' });
  }

  try {
    const customer = await Customer.findOne({ phone });

    if (!customer) {
      return res
        .status(401)
        .json({ message: 'Số điện thoại hoặc mật khẩu không đúng.' });
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: 'Số điện thoại hoặc mật khẩu không đúng.' });
    }

    if (req.session) {
      req.session.userId = customer._id.toString();
    }

    return res.json({ user: sanitizeCustomer(customer) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Không thể đăng nhập. Vui lòng thử lại sau.', error: error.message });
  }
});

router.post('/logout', (req, res) => {
  if (req.session) {
    req.session = null;
  }

  return res.json({ success: true });
});

module.exports = router;


