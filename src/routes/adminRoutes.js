const express = require('express');
const path = require('path');
const multer = require('multer');
const { Dish } = require('../models/Dish');
const { Category } = require('../models/Category');
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
    const items = await Dish.find().populate('category').sort({ createdAt: -1 }).lean();
    // Map imageUrl to image for frontend compatibility
    const mappedItems = items.map(item => ({
      ...item,
      image: item.imageUrl || '',
      _id: item._id.toString()
    }));
    res.json(mappedItems);
  } catch (error) {
    res.status(500).json({ message: 'Không thể tải thực đơn', error: error.message });
  }
});

router.post('/api/menu', async (req, res) => {
  const { name, price, description, image, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Tên và giá món là bắt buộc' });
  }

  try {
    // If category is provided as name, find the category ID
    let categoryId = category;
    if (category && typeof category === 'string' && !category.match(/^[0-9a-fA-F]{24}$/)) {
      const foundCategory = await Category.findOne({ name: category });
      if (foundCategory) {
        categoryId = foundCategory._id;
      } else {
        // Create a default category if not found
        const defaultCategory = await Category.findOne({ name: 'Món chính' });
        categoryId = defaultCategory ? defaultCategory._id : null;
      }
    }

    // If no category provided, use first available category
    if (!categoryId) {
      const firstCategory = await Category.findOne();
      if (!firstCategory) {
        return res.status(400).json({ message: 'Vui lòng tạo danh mục trước khi thêm món ăn' });
      }
      categoryId = firstCategory._id;
    }

    const parsedPrice = Number(price);
    const dish = await Dish.create({
      category: categoryId,
      name,
      price: Number.isNaN(parsedPrice) ? 0 : parsedPrice,
      description: description || '',
      imageUrl: image || '',
      status: 'CON'
    });

    const populatedDish = await Dish.findById(dish._id).populate('category').lean();
    return res.status(201).json({
      ...populatedDish,
      image: populatedDish.imageUrl || '',
      _id: populatedDish._id.toString()
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Không thể tạo món ăn mới', error: error.message });
  }
});

router.put('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, description, image, category } = req.body;

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
      updateData.imageUrl = image;
    }

    if (category) {
      let categoryId = category;
      if (typeof category === 'string' && !category.match(/^[0-9a-fA-F]{24}$/)) {
        const foundCategory = await Category.findOne({ name: category });
        if (foundCategory) {
          categoryId = foundCategory._id;
        }
      }
      if (categoryId) {
        updateData.category = categoryId;
      }
    }

    const updatedItem = await Dish.findByIdAndUpdate(id, updateData, {
      new: true
    }).populate('category').lean();

    if (!updatedItem) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }

    return res.json({
      ...updatedItem,
      image: updatedItem.imageUrl || '',
      _id: updatedItem._id.toString()
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
    const deletedItem = await Dish.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }

    return res.json({
      ...deletedItem.toObject(),
      image: deletedItem.imageUrl || '',
      _id: deletedItem._id.toString()
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Không thể xóa món ăn', error: error.message });
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


