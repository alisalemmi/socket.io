const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

redis.on('connect', () => {
  console.log('connect to redis successfully :)');
});

redis.on('reconnecting', () => {
  console.log('reconnecting to redis...');
});

redis.on('close', () => {
  console.log('redis connection closed');
});

redis.on('error', err => {
  console.error(
    '=====================\n    redis error\n====================='
  );
  console.error(err);
});

module.exports = redis;
