const mongoose = require('mongoose');
const app = require('./app');
const io = require('./socket');

const server = app.listen(3002);

io.attach(server);

server.on('listening', () => console.log('server is running on port 3002'));

// ----------------------------
// connect DB

mongoose.set('runValidators', true);
mongoose.set('toJSON', {
  transform: (from, to) => {
    to.id = from._id;
    delete to._id;
    delete to.__v;
  }
});

mongoose
  .connect('mongodb://localhost:27017/socketio', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    autoIndex: true,
    useUnifiedTopology: true,
    keepAlive: true
  })
  .then(() => console.log('connect to DB successfully :)'));

mongoose.connection.on('error', err => {
  console.log(err);

  server.close(() => {
    process.exit();
  });
});

mongoose.connection.on('disconnected', () => {
  console.log('DB disconnected :(');
});

mongoose.connection.on('reconnected', () => {
  console.log('DB reconnected :)');
});
