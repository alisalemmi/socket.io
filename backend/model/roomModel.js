const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
  members: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        trim: true
      },
      lastSeenMessage: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

const Room = mongoose.model('room', roomSchema);

module.exports = Room;
