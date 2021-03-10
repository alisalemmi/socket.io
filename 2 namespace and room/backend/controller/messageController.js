const { ObjectId } = require('mongoose').Types;
const Message = require('../model/messageModel');

/**
 * create a new message
 * @param {{text: string, room: string, sender: string, quoteRef: string}} message
 */
exports.create = message => {
  return Message.create({
    text: message.text,
    room: message.room,
    sender: message.sender,
    quoteRef: message.quoteRef
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
      edited: true,
      quoteRef: true
    })
    .sort({ time: 1 });

  return messages;
};

/**
 * edit a message if it was sended by this sender
 * @param {string} messageId
 * @param {string} sender sender id
 * @param {string} newText
 */
exports.edit = async (messageId, sender, newText) => {
  const message = await Message.findOneAndUpdate(
    { _id: messageId, sender },
    {
      edited: true,
      text: newText
    },
    { new: true }
  );

  return message
    ? { id: message._id, room: message.room, text: message.text }
    : false;
};

/**
 * delete a message if it was sended by this sender
 * @param {string} messageId
 * @param {string} sender sender id
 */
exports.delete = (messageId, sender) => {
  const message = Message.findOneAndDelete({ _id: messageId, sender });
  Message.updateMany({ quoteRef: messageId }, { $unset: { quoteRef: '' } });

  return message;
};
