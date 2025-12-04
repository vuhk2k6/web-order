const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
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
    status: {
      type: String,
      enum: ['CON', 'HET'],
      default: 'CON'
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Dish = mongoose.model('Dish', dishSchema);

module.exports = { Dish };


