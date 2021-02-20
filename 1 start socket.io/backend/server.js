const app = require('./app');

const server = app.listen(3001);

server.on('listening', () => {
  console.log('server is running on port 3001 ...');
});

