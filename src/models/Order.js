const mongoose = require('mongoose');
require('./Promotion'); // đảm bảo model Promotion được đăng ký trước khi populate

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    orderType: {
      type: String,
      enum: ['TAI_CHO', 'ONLINE', 'MANG_VE'],
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    promotion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
      default: null
    },
    status: {
      type: String,
      default: 'CHO_XAC_NHAN'
    },
    cancelReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };


