const mongoose = require('mongoose');

const reservationTableSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true
    }
  },
  {
    timestamps: true
  }
);

reservationTableSchema.index({ reservation: 1, table: 1 }, { unique: true });

const ReservationTable = mongoose.model('ReservationTable', reservationTableSchema);

module.exports = { ReservationTable };


