const mongoose = require('mongoose');

const onlinePaymentMethodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const OnlinePaymentMethod = mongoose.model(
  'OnlinePaymentMethod',
  onlinePaymentMethodSchema
);

module.exports = { OnlinePaymentMethod };


