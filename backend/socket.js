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

  socket.emit('me', user.id);
  socket.userId = user._id;
};

/**
 * find user's rooms and join it to them and also get members info
 * @param {import('socket.io').Socket} socket
 */
const getRoomsAndMembers = async socket => {
  const { rooms, members } = await roomController.getRooms(socket.userId);

  // get rooms
  socket.emit('rooms', rooms);

  // get members
  const friends = members.map(member => member.id.toString());
  const membersStatus = await redis.smismember('onlineUsers', friends);
  const onlineFriends = Object.fromEntries(
    friends.map((_, i) => [friends[i], membersStatus[i] === 1])
  );

  members.forEach(member => {
    if (onlineFriends[member.id]) member.lastSeen = 'online';
  });

  socket.emit('members', members);

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
const getHistory = async ({ room, direction, date }, callback) => {
  callback({
    room,
    messages: await messageController.getHistory(room, direction, date)
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

const syncLastSeenMessage = userId => async ({ room, lastSeenMessage }) => {
  console.log(userId, room, lastSeenMessage);
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
  await getRoomsAndMembers(socket);
  updateUserStatus(socket, true);

  socket.on('getHistory', getHistory);
  socket.on('sendTyping', sendTyping(socket));
  socket.on('sendMessage', sendMessage(socket.userId));
  socket.on('sendEdit', editMessage(socket.userId));
  socket.on('sendDelete', deleteMessage(socket.userId));
  socket.on('syncLastSeenMessage', syncLastSeenMessage(socket.userId));
  socket.on('disconnecting', onDisconnect(socket));
};

io.on('connect', onConnect);

module.exports = io;
