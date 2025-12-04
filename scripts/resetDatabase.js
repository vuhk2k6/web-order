/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/db');

const resetDatabase = async () => {
  try {
    await connectDatabase();
    const connection = mongoose.connection;

    const collections = await connection.db.listCollections().toArray();

    // Drop all existing collections
    // This will remove ALL data in the current database
    // Be careful when running this script in production.
    // eslint-disable-next-line no-restricted-syntax
    for (const { name } of collections) {
      console.log(`Dropping collection: ${name}`);
      // eslint-disable-next-line no-await-in-loop
      await connection.dropCollection(name);
    }

    console.log('Database reset completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error while resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();


