const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    method: {
      type: String,
      enum: ['TIEN_MAT', 'CHUYEN_KHOAN', 'ONLINE'],
      required: true
    },
    paidAt: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    transactionCode: {
      type: String,
      unique: true,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { Payment };


