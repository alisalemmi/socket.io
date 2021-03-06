const { ObjectId } = require('mongoose').Types;
const Message = require('../model/messageModel');

exports.create = message => {
  return Message.create({
    text: message.text,
    room: message.room,
    sender: message.sender
  });
};

/**
 * get latest messages of a room
 * @param {string} roomId
 * @param {number} offset
 */
exports.getHistory = async (roomId, offset) => {
  const messages = await Message.aggregate()
    .match({
      room: ObjectId(roomId)
    })
    .sort({ time: -1 })
    .skip(offset)
    .limit(20)
    .project({
      _id: false,
      id: '$_id',
      sender: true,
      text: true,
      time: true,
      seen: true,
      edited: true
    })
    .sort({ time: 1 });

  return messages;
};
