const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      unique: true
    },
    points: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      trim: true
    },
    totalSpent: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Member = mongoose.model('Member', memberSchema);

module.exports = { Member };


