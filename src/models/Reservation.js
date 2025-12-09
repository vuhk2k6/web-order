const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    guestName: {
      type: String,
      required: true,
      trim: true
    },
    guestPhone: {
      type: String,
      required: true,
      trim: true
    },
    reservedAt: {
      type: Date,
      required: true
    },
    guestCount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['DANG_CHO', 'XAC_NHAN', 'DA_HUY', 'HOAN_THANH'],
      default: 'DANG_CHO'
    },
    note: {
      type: String,
      default: ''
    },
    cancelReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = { Reservation };


