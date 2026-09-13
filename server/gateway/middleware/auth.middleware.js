import redis from "../config/redis.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader?.trim();

    const sessionId =
      req.cookies?.session ||
      req.headers.cookie?.match(/session=([^;]+)/)?.[1] ||
      headerToken;

    if (!sessionId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - session not found" });
    }

    const session = await redis.get(`session-${sessionId}`);
    if (!session) {
      return res
        .status(401)
        .json({ message: "Unauthorized - session expired or invalid" });
    }

    req.user = JSON.parse(session);
    req.sessionId = sessionId;
    next();
  } catch (error) {
    return res.status(500).json({ message: `protect err - ${error.message}` });
  }
};

export default protect;
