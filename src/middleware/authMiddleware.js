const authMiddleware = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }

  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.redirect('/admin/login');
};

module.exports = { authMiddleware };


