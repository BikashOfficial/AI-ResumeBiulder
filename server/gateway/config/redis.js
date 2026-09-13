import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const isTls = redisUrl.startsWith("rediss://");

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  connectTimeout: 15000,
  keepAlive: 10000,
  ...(isTls && {
    tls: {
      rejectUnauthorized: false,
    },
  }),
  retryStrategy(times) {
    if (times > 10) {
      console.warn("⚠️ Redis max connection retries reached");
      return null;
    }
    return Math.min(times * 150, 3000);
  },
});

redis.on("connect", () => {
  console.log("✅ [Gateway] Redis connected successfully");
});

redis.on("ready", () => {
  console.log("🚀 [Gateway] Redis client ready");
});

redis.on("error", (err) => {
  console.error("❌ [Gateway] Redis connection error:", err.message);
});

export default redis;
