const mongoose = require('mongoose')

const TourSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    min: 0,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  locations: {
    start: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      }
    },
    end: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      }
    }
  }
}, {timestamps: true})

module.exports = mongoose.model('tour', TourSchema);
