const app = require('./app');
const io = require('./socket');

const server = app.listen(3001);

server.on('listening', () => {
  console.log('server is running on port 3001 ...');
});

io.attach(server);
