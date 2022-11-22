import apiCache from "apicache";
import * as redis from "redis";

const cacheWithRedis = apiCache.options({
  redisClient: redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
    },
    password: process.env.REDIS_PASSWROD,
  }),
}).middleware;

export default cacheWithRedis;
