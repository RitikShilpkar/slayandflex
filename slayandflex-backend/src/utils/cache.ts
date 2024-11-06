// import redis from 'redis';
// import util from 'util';

// const redisClient = redis.createClient({
//   host: process.env.REDIS_HOST || '127.0.0.1',
//   port: Number(process.env.REDIS_PORT) || 6379,
// });

// redisClient.on('error', (err) => {
//   console.error('Redis error:', err);
// });

// const getAsync = util.promisify(redisClient.get).bind(redisClient);
// const setexAsync = util.promisify(redisClient.setex).bind(redisClient);

// export { redisClient, getAsync, setexAsync };
