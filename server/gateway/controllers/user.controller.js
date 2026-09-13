export const getCurrentUser = async (req, res) => {
  try {
    // req.user was populated by protect middleware from Redis session
    return res.status(200).json({
      user: req.user,
      ...req.user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get current user err - ${error.message}` });
  }
};