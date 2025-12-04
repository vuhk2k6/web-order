require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');

const publicRoutes = require('./src/routes/publicRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const authRoutes = require('./src/routes/authRoutes');
const { connectDatabase } = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: 'session',
    keys: ['restaurant-secret-key'],
    maxAge: 24 * 60 * 60 * 1000
  })
);

app.use('/', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use(express.static(path.join(__dirname, 'src/public')));

app.use((req, res) => {
  res.status(404).send('Page not found');
});

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();


