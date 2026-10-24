const mongoose = require('mongoose');

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error: MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DATABASE || 'web-order',
      serverSelectionTimeoutMS: 5000
    });

    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message);
    console.warn('Server continuing to run without DB or waiting for DB whitelist...');
  }
};

module.exports = { connectDatabase };

