const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    priceAtOrderTime: {
      type: Number,
      required: true,
      min: 0
    },
    note: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = { OrderItem };


