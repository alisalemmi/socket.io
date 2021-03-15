const cookie = require('cookie');
const socketio = require('socket.io');
const redis = require('./db/redis');
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

  const friends = [
    ...new Set(
      rooms
        .map(room => room.members.map(member => member._id.toString()))
        .flat()
    )
  ];

  const res = await redis.smismember('onlineUsers', friends);
  const onlineFriends = Object.fromEntries(
    friends.map((_, i) => [friends[i], res[i]])
  );

  rooms.forEach(room =>
    room.members.forEach(member => {
      if (onlineFriends[member._id]) member.lastSeen = 'online';
    })
  );

  socket.emit('rooms', rooms);

  // join rooms
  rooms.forEach(room => socket.join(`${room.id}`));
};

/**
 * @param {import('socket.io').Socket} socket
 * @param {boolean} status connect or disconnect
 */
const updateUserStatus = (socket, status) => {
  if (status) {
    redis.sadd('onlineUsers', socket.userId.toString());

    socket.rooms.forEach(room =>
      socket.to(room).emit('userConnect', { userId: socket.userId })
    );
  } else {
    redis.srem('onlineUsers', socket.userId.toString());

    socket.rooms.forEach(room =>
      socket
        .to(room)
        .emit('userDisconnect', { userId: socket.userId, time: new Date() })
    );
  }
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
 * edit a message
 * @return {(message: messageType) => void} message
 */
const editMessage = userId => async (messageId, newText) => {
  const message = await messageController.edit(messageId, userId, newText);

  if (message) io.to(message.room.toString()).emit('edit', message);
};

/**
 * delete a message
 * @return {(message: messageType) => void} message
 */
const deleteMessage = userId => async messageId => {
  const message = await messageController.delete(messageId, userId);

  if (message)
    io.to(message.room.toString()).emit('delete', {
      id: message._id,
      room: message.room
    });
};

/**
 * @param {import('socket.io').Socket} socket
 */
const onDisconnect = socket => () => {
  setLastSeen(socket.userId);
  updateUserStatus(socket, false);
};

/**
 * @param {import('socket.io').Socket} socket
 */
const onConnect = async socket => {
  await findUser(socket);
  await getRooms(socket);
  updateUserStatus(socket, true);

  socket.on('getHistory', getHistory);
  socket.on('sendTyping', sendTyping(socket));
  socket.on('sendMessage', sendMessage(socket.userId));
  socket.on('sendEdit', editMessage(socket.userId));
  socket.on('sendDelete', deleteMessage(socket.userId));
  socket.on('disconnecting', onDisconnect(socket));
};

io.on('connect', onConnect);

module.exports = io;
