const mongoose = require('mongoose');

const ReserveSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tour"
  },
  count: {
    type: Number,
    default: 1
  },
  date: {
    type: Date,
    required: true
  }
}, {timestamps: true})

module.exports = mongoose.model('reserve', ReserveSchema);
