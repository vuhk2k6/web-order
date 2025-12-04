const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true
    },
    type: {
      type: String,
      enum: ['TICH', 'TIEU'],
      required: true
    },
    points: {
      type: Number,
      required: true
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

const PointTransaction = mongoose.model('PointTransaction', pointTransactionSchema);

module.exports = { PointTransaction };


