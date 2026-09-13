export const protect = (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized - Access denied. Missing user identification.",
      });
    }

    req.userId = userId;
    req.user = { userId };
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Service auth error: ${error.message}` });
  }
};

export default protect;
