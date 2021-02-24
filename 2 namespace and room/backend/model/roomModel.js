const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      trim: true
    }
  ]
});

const Room = mongoose.model('room', roomSchema);

module.exports = Room;
