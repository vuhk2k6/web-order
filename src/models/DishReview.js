const mongoose = require('mongoose');

const dishReviewSchema = new mongoose.Schema(
  {
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    content: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const DishReview = mongoose.model('DishReview', dishReviewSchema);

module.exports = { DishReview };


