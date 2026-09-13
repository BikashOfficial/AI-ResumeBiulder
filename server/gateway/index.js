import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import protect from "./middleware/auth.middleware.js";
import { getCurrentUser } from "./controllers/user.controller.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";
import morgan from "morgan";

dotenv.config();

const port = process.env.PORT || 8000;
const authService = (process.env.AUTH_SERVICE || "http://localhost:8001").replace(/\/$/, "");
const resumeService = (process.env.RESUME_SERVICE || "http://localhost:8002").replace(/\/$/, "");
const aiService = (process.env.AI_SERVICE || "http://localhost:8003").replace(/\/$/, "");

const app = express();
app.set("trust proxy", 1);

// -------------------------------------------------------------
// CORS Configuration with Credentials & Dynamic Origin Reflection
// -------------------------------------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Reflect the requesting origin so it is never wildcard '*'
      callback(null, origin || true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "x-user-id",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200,
  }),
);

app.use(cookieParser());
app.use(morgan("dev"));

// -------------------------------------------------------------
// Proxy Helper with 60s Timeout (supports Render Cold Starts)
// -------------------------------------------------------------
const createProxy = (targetUrl, options = {}) => {
  return proxy(targetUrl, {
    timeout: 60000,
    ...options,
    proxyErrorHandler: (err, res, next) => {
      console.error(`❌ [Gateway Proxy Error] Target: ${targetUrl} - ${err.code || err.message}`);
      return res.status(502).json({
        message: `Bad Gateway: Could not reach downstream service at ${targetUrl}. It may be spinning up or sleeping on Render.`,
        target: targetUrl,
        code: err.code || "SERVICE_UNAVAILABLE",
        error: err.message,
      });
    },
  });
};

// -------------------------------------------------------------
// Public Routes (Auth Service)
// -------------------------------------------------------------
app.use("/api/auth", createProxy(authService));
app.use(
  "/api/users/register",
  createProxy(authService, {
    proxyReqPathResolver: () => "/register",
  }),
);
app.use(
  "/api/users/login",
  createProxy(authService, {
    proxyReqPathResolver: () => "/login",
  }),
);
app.use(
  "/api/users/logout",
  createProxy(authService, {
    proxyReqPathResolver: () => "/logout",
  }),
);

// -------------------------------------------------------------
// User Profile (Instant Zero-DB Redis Resolution)
// -------------------------------------------------------------
app.use("/api/me", protect, getCurrentUser);
app.use("/api/users/data", protect, getCurrentUser);

// -------------------------------------------------------------
// Public Resume Preview (No Auth required)
// -------------------------------------------------------------
app.use(
  "/api/resumes/public",
  createProxy(resumeService, {
    proxyReqPathResolver: (req) => `/public${req.url}`,
  }),
);
app.use(
  "/api/resume/public",
  createProxy(resumeService, {
    proxyReqPathResolver: (req) => `/public${req.url}`,
  }),
);

// -------------------------------------------------------------
// Protected Resume Routes
// -------------------------------------------------------------
// Maps /api/users/resumes -> /resumes on Resume service
app.use(
  "/api/users/resumes",
  protect,
  proxyWithHeader(resumeService, {
    proxyReqPathResolver: () => "/resumes",
  }),
);
app.use("/api/resume", protect, proxyWithHeader(resumeService));
app.use("/api/resumes", protect, proxyWithHeader(resumeService));

// -------------------------------------------------------------
// Protected AI Routes
// -------------------------------------------------------------
app.use("/api/ai", protect, proxyWithHeader(aiService));

// -------------------------------------------------------------
// Root Health Check
// -------------------------------------------------------------
app.get("/", (req, res) => {
  res.json({
    message: "hellow from gateway",
    services: {
      auth: authService,
      resume: resumeService,
      ai: aiService,
    },
  });
});

app.listen(port, () => {
  console.log(`Running gateway on server ${port}`);
  console.log(`🔗 Target Auth Service:   ${authService}`);
  console.log(`🔗 Target Resume Service: ${resumeService}`);
  console.log(`🔗 Target AI Service:     ${aiService}`);
});
