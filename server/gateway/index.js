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
// const frontendOrigin = process.env.FRONTEND_URL.replace(/\/$/, "");

const app = express();
app.set("trust proxy", 1);

app.use(
  cors(),
);
app.use(cookieParser());
app.use(morgan("dev"));

// -------------------------------------------------------------
// Public Routes (Auth Service)
// -------------------------------------------------------------
app.use("/api/auth", proxy(process.env.AUTH_SERVICE));
app.use(
  "/api/users/register",
  proxy(process.env.AUTH_SERVICE, {
    proxyReqPathResolver: () => "/register",
  }),
);
app.use(
  "/api/users/login",
  proxy(process.env.AUTH_SERVICE, {
    proxyReqPathResolver: () => "/login",
  }),
);
app.use(
  "/api/users/logout",
  proxy(process.env.AUTH_SERVICE, {
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
  proxy(process.env.RESUME_SERVICE, {
    proxyReqPathResolver: (req) => `/public${req.url}`,
  }),
);
app.use(
  "/api/resume/public",
  proxy(process.env.RESUME_SERVICE, {
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
  proxyWithHeader(process.env.RESUME_SERVICE, {
    proxyReqPathResolver: () => "/resumes",
  }),
);
app.use("/api/resume", protect, proxyWithHeader(process.env.RESUME_SERVICE));
app.use("/api/resumes", protect, proxyWithHeader(process.env.RESUME_SERVICE));

// -------------------------------------------------------------
// Protected AI Routes
// -------------------------------------------------------------
app.use("/api/ai", protect, proxyWithHeader(process.env.AI_SERVICE));

// -------------------------------------------------------------
// Root Health Check
// -------------------------------------------------------------
app.get("/", (req, res) => {
  res.json({ message: "hellow from gateway" });
});

app.listen(port, () => {
  console.log(`Running gateway on server ${port}`);
});
