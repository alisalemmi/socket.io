const mongoose = require('mongoose');

/**
 * try to connect to mongodb.
 * @param {import('http').Server} server
 * @param {Object} options db name and url
 */
exports.connect = (server, { db, url = 'mongodb://localhost:27017' } = {}) => {
  mongoose.set('runValidators', true);
  mongoose.set('toJSON', {
    transform: (from, to) => {
      to.id = from._id;
      delete to._id;
      delete to.__v;
    }
  });

  mongoose
    .connect(`${url}/${db}`, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      autoIndex: true,
      useUnifiedTopology: true,
      keepAlive: true
    })
    .then(() => console.log('connect to mongoDB successfully :)'));

  mongoose.connection.on('error', err => {
    console.log(err);

    server.close(() => {
      process.exit();
    });
  });

  mongoose.connection.on('disconnected', () => {
    console.log('mongoDB disconnected :(');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('mongoDB reconnected :)');
  });
};
