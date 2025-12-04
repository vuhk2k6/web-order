const mongoose = require('mongoose');

const dineInOrderSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true
    },
    checkInTime: {
      type: Date,
      required: true
    },
    checkOutTime: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const DineInOrder = mongoose.model('DineInOrder', dineInOrderSchema);

module.exports = { DineInOrder };


