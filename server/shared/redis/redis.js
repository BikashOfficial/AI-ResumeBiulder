import { createRequire } from "module";
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

// Multi-path resolver for ioredis so it resolves correctly in Render when Root Directory is set to a subfolder
let Redis;
const candidatePaths = [
  path.resolve(process.cwd(), "package.json"),
  path.resolve(__dirname, "../../../gateway/package.json"),
  path.resolve(__dirname, "../../gateway/package.json"),
  path.resolve(__dirname, "../../../services/auth/package.json"),
  path.resolve(__dirname, "../../services/auth/package.json"),
  path.resolve(__dirname, "../../../package.json"),
  path.resolve(__dirname, "../../package.json"),
];

for (const pkgPath of candidatePaths) {
  try {
    const req = createRequire(pkgPath);
    Redis = req("ioredis");
    if (Redis) break;
  } catch {}
}

if (!Redis) {
  try {
    const req = createRequire(import.meta.url);
    Redis = req("ioredis");
  } catch (err) {
    console.error("❌ Failed to resolve ioredis from candidate paths:", err.message);
  }
}

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
  console.log("✅ Redis connected successfully");
});

redis.on("ready", () => {
  console.log("🚀 Redis client ready to accept commands");
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
