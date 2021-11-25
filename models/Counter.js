const mongoose = require('mongoose');
const CounterSchema = mongoose.Schema({
  num: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('counter', CounterSchema);
