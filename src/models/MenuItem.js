const mongoose = require('mongoose');

const sizeOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    additionalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },
  {
    _id: false
  }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false
    },
    sizeOptions: {
      type: [sizeOptionSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = { MenuItem };


