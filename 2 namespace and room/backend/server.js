require('dotenv').config({ path: `${__dirname}/.env` });

const app = require('./app');
const io = require('./socket');
const mongo = require('./db/mongo');
require('./db/redis');

const server = app.listen(3002);

mongo.connect(server, { url: process.env.DB_URL, db: process.env.DB_NAME });
io.attach(server);

server.on('listening', () => console.log('server is running on port 3002'));
