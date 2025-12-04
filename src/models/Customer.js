const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    accountType: {
      type: String,
      enum: ['THANH_VIEN', 'KHACH'],
      default: 'KHACH'
    }
  },
  {
    timestamps: true
  }
);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = { Customer };


