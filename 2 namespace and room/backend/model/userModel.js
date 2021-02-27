const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    trim: true
  },
  image: {
    type: String,
    trim: true,
    default: 'default.svg'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('user', userSchema);

module.exports = User;
