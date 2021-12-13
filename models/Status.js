const mongoose = require('mongoose');

const StatusSchema = mongoose.Schema({
  status: {
    type: Number,
    default: 1
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('status', StatusSchema);
