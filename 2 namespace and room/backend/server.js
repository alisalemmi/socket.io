const app = require('./app');
const io = require('./socket');

const server = app.listen(3002);

io.attach(server);

server.on('listening', () => console.log('server is running on port 3002'));
