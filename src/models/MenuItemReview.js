const mongoose = require('mongoose');

const menuItemReviewSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
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
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
menuItemReviewSchema.index({ menuItem: 1, createdAt: -1 });
menuItemReviewSchema.index({ customer: 1, menuItem: 1 }, { unique: true }); // One review per customer per menu item

const MenuItemReview = mongoose.model('MenuItemReview', menuItemReviewSchema);

module.exports = { MenuItemReview };

