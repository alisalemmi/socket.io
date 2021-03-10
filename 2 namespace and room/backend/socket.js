const cookie = require('cookie');
const socketio = require('socket.io');
const messageController = require('./controller/messageController');
const roomController = require('./controller/roomController');
const { getUser, setLastSeen } = require('./controller/userController');

/**
 * @type {import('socket.io').Server}
 */
const io = socketio({ serveClient: false });

/**
 *  find user and store its id in `socket.userId`
 * @param {import('socket.io').Socket} socket
 */
const findUser = async socket => {
  const { token } = cookie.parse(socket.request.headers.cookie);
  const user = await getUser(token);

  if (!user) throw new Error();
  // return next(new Error('not auth'));

  socket.emit('me', user);
  socket.userId = user._id;
};

/**
 * find user's rooms and join it to them
 * @param {import('socket.io').Socket} socket
 */
const getRooms = async socket => {
  const rooms = await roomController.getRooms(socket.userId);
  socket.emit('rooms', rooms);

  // join rooms
  rooms.forEach(room => socket.join(`${room.id}`));
};

/**
 * get messages history of a room
 * @param {import('socket.io').Socket} socket
 */
const getHistory = async ({ room, offset }, callback) => {
  callback({
    room,
    messages: await messageController.getHistory(room, offset)
  });
};

/**
 * @return {(room: string) => void} room
 */
const sendTyping = socket => room => {
  socket
    .to(room)
    .emit('typing', { userId: socket.userId, room, expires: 3000 });
};

/**
 * @typedef {object} messageType
 * @property {string} room
 * @property {string} text
 */
/**
 * broadcast received message. also set `sender` and `time`
 * @return {(message: messageType) => void} message
 */
const sendMessage = userId => async message => {
  const msg = await messageController.create({
    text: message.text,
    quoteRef: message.quoteRef || undefined, // prevent empty string
    room: message.room,
    sender: userId
  });

  io.to(message.room).emit('message', msg);
};

/**
 * edit an message
 * @return {(message: messageType) => void} message
 */
const editMessage = userId => async (messageId, newText) => {
  const message = await messageController.edit(messageId, userId, newText);

  if (message) io.to(message.room.toString()).emit('edit', message);
};

/**
 * @param {import('socket.io').Socket} socket
 */
const onConnect = async socket => {
  await findUser(socket);
  await getRooms(socket);

  socket.on('getHistory', getHistory);
  socket.on('sendTyping', sendTyping(socket));
  socket.on('sendMessage', sendMessage(socket.userId));
  socket.on('sendEdit', editMessage(socket.userId));
  socket.on('disconnect', setLastSeen(socket.userId));
};

io.on('connect', onConnect);

module.exports = io;
