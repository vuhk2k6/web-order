const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    seats: {
      type: Number,
      required: true
    },
    location: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['TRONG', 'DANG_DUNG', 'DANG_DON'],
      default: 'TRONG'
    }
  },
  {
    timestamps: true
  }
);

const Table = mongoose.model('Table', tableSchema);

module.exports = { Table };


