const socketio = require('socket.io');

/**
 * @type {import('socket.io').Server}
 */
const io = socketio({ serveClient: false });

/**
 * @param {import('socket.io').Socket} socket
 */
const onConnect = socket => {
  socket.on('send', message =>
    io.emit('message', { text: message.text.trim(), time: Date.now() })
  );
};

io.on('connect', onConnect);

module.exports = io;
