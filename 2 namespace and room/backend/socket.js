const cookie = require('cookie');
const socketio = require('socket.io');
const roomController = require('./controller/roomController');
const { getUser } = require('./controller/userController');

/**
 * @type {import('socket.io').Server}
 */
const io = socketio({ serveClient: false });

// find user and inject it to `socket.user`
io.use(async (socket, next) => {
  const { token } = cookie.parse(socket.request.headers.cookie);
  const user = await getUser(token);

  if (!user) return next(new Error('not auth'));

  socket.user = user;
  next();
});

/**
 * @param {import('socket.io').Socket} socket
 */
const onConnect = async socket => {
  // send initial info
  socket.emit('me', socket.user);
  socket.emit('rooms', await roomController.getRooms(socket.user._id));

  socket.on('send', message =>
    io.emit('message', { text: message.text.trim(), time: Date.now() })
  );
};

io.on('connect', onConnect);

module.exports = io;
