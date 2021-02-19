const app = require('./app');

const server = app.listen(3000);

server.on('listening', () => {
  console.log('server is running on port 3000 ...');
});
