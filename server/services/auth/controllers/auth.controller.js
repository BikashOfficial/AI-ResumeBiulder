import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import redis from "../../../shared/redis/redis.js";

const createSession = async (user, res) => {
  const sessionId = crypto.randomUUID();
  const userId = user._id.toString();

  // 1. Store reverse mapping for user -> active session
  await redis.set(
    `user-session-${userId}`,
    sessionId,
    "EX",
    14 * 24 * 60 * 60,
  );

  // 2. Store session data in Redis for sub-millisecond gateway edge lookup
  await redis.set(
    `session-${sessionId}`,
    JSON.stringify({
      userId: userId,
      name: user.name,
      email: user.email,
    }),
    "EX",
    14 * 24 * 60 * 60,
  );

  // 3. Set HttpOnly session cookie
  res.cookie("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 14 * 24 * 60 * 60 * 1000,
  });

  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;

  return { sessionId, user: userObj };
};

// POST: /register (or /api/users/register via gateway)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const accountExists = await User.findOne({ email });

    if (accountExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashed_pw = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed_pw,
    });

    const { sessionId, user } = await createSession(newUser, res);

    return res.status(201).json({
      message: "User created successfully",
      token: sessionId,
      user: user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST: /login (or /api/users/login via gateway)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "No user found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const { sessionId, user: userdata } = await createSession(user, res);

    return res.status(200).json({
      message: "Login successful",
      token: sessionId,
      user: userdata,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET: /data (or /api/users/data via gateway)
export const getUserData = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - missing user ID" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST or GET: /logout (or /api/users/logout via gateway)
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader?.trim();

    const sessionId =
      req.cookies?.session ||
      req.headers.cookie?.match(/session=([^;]+)/)?.[1] ||
      headerToken;

    if (sessionId) {
      await redis.del(`session-${sessionId}`);
    }

    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({ message: "logout sucessfully!" });
  } catch (error) {
    return res.status(500).json({ message: `logout err - ${error.message}` });
  }
};
