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

router.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Không thể tải thực đơn', error: error.message });
  }
});

module.exports = router;


