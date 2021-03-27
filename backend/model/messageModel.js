const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'room',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  quoteRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'message'
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: Date,
    default: Date.now,
    index: true
  },
  edited: {
    type: Boolean,
    default: false
  }
});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;
