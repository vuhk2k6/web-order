const mongoose = require('mongoose');

const deliveryAddressSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true
    },
    address: {
      type: String,
      required: true
    },
    ward: {
      type: String,
      default: ''
    },
    district: {
      type: String,
      default: ''
    },
    deliveryNote: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const DeliveryAddress = mongoose.model('DeliveryAddress', deliveryAddressSchema);

module.exports = { DeliveryAddress };


