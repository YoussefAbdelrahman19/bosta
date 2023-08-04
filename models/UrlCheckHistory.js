const mongoose = require('mongoose');

const UrlCheckHistorySchema = new mongoose.Schema({
  urlCheck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'urlCheck'
  },
  status: {
    type: String,
    enum: ['UP', 'DOWN'],
    required: true
  },
  responseTime: {
    type: Number,
    required: true
  },
  checkedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('urlCheckHistory', UrlCheckHistorySchema);
