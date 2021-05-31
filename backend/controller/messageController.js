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
 * @param {string[]} messages
 */
exports.getMessages = (room, messages) => {
  return Message.find(
    {
      _id: { $in: messages.map(id => ObjectId(id)) },
      room
    },
    '-room'
  );
};

/**
 * get latest messages of a room
 * @param {string} roomId
 * @param {Boolean} direction `true`: forward
 * @param {Date} date
 */
exports.getHistory = async (roomId, direction, date) => {
  const messages = await Message.aggregate()
    .match({
      room: ObjectId(roomId),
      time: {
        [direction ? '$lte' : '$gte']: new Date(date)
      }
    })
    .sort({ time: direction ? -1 : 1 })
    .limit(20)
    .project({
      _id: false,
      id: '$_id',
      sender: true,
      text: true,
      time: true,
      edited: true,
      quoteRef: true
    });

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
