const mongoose = require('mongoose');

const UrlCheckSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  url: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  interval: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['UP', 'DOWN'],
    default: 'UP'
  },
  lastChecked: {
    type: Date
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = UrlCheck = mongoose.model('urlCheck', UrlCheckSchema);
