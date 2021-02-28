const cookie = require('cookie');
const socketio = require('socket.io');
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
 * @typedef {object} messageType
 * @property {string} room
 * @property {string} text
 */
/**
 * broadcast received message. also set `sender` and `time`
 * @param {messageType} message
 */
const sendMessage = userId => message => {
  console.log(userId, message);
  io.to(message.room).emit('message', {
    text: message.text.trim(),
    room: message.room,
    sender: userId,
    time: Date.now()
  });
};

/**
 * @param {import('socket.io').Socket} socket
 */
const onConnect = async socket => {
  await findUser(socket);
  await getRooms(socket);

  socket.on('send', sendMessage(socket.userId));
  socket.on('disconnect', setLastSeen(socket.userId));
};

io.on('connect', onConnect);

module.exports = io;
