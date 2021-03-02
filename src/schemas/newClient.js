const mongoose = require('mongoose')

var client = new mongoose.Schema(
  {
    number: { type: String },
    billPrice: { type: String, default: '0' },
  },
  {
    versionKey: false,
  }
)

module.exports = mongoose.model('Client', client)
