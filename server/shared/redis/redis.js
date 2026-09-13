import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Fallback to gateway or auth .env if not yet loaded in process.env
if (!process.env.REDIS_URL) {
  dotenv.config({ path: path.resolve(__dirname, "../../gateway/.env") });
}
if (!process.env.REDIS_URL) {
  dotenv.config({ path: path.resolve(__dirname, "../../services/auth/.env") });
}

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  connectTimeout: 10000,
  retryStrategy(times) {
    if (times > 5) {
      console.warn("⚠️ Redis max connection retries reached");
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("reconnecting", (delay) => {
  console.warn(`⚠️ Redis reconnecting in ${delay}ms`);
});

redis.on("close", () => {
  console.warn("⚠️ Redis connection closed");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

export default redis;
