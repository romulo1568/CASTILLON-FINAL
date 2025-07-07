import { createClient } from 'redis';

const redis = createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD || 'cLY0wQ6473vm5eZ39jCH893goYNHwIuO',
  socket: {
    host: process.env.REDIS_HOST || 'redis-10233.c80.us-east-1-2.ec2.redns.redis-cloud.com',
    port: Number(process.env.REDIS_PORT) || 10233,
  },
});

redis.on('error', (err) => console.error('Redis Client Error', err));

export async function getRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
} 