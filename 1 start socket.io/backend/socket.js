const socketio = require('socket.io');

/**
 * @type {import('socket.io').Server}
 */
const io = socketio();

/**
 * @param {import('socket.io').Socket} socket
 */
const handler = socket => {
  socket.on('send', msg => io.emit('message', msg));
};

io.on('connection', handler);

module.exports = io;
