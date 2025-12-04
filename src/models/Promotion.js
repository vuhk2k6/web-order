const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['PERCENT', 'AMOUNT'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    minOrderAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = { Promotion };


