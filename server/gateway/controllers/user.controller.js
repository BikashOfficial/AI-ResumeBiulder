export const getCurrentUser = async (req, res) => {
  try {
    // req.user was populated by protect middleware from Redis session
    const userData = {
      _id: req.user.userId || req.user._id,
      userId: req.user.userId || req.user._id,
      name: req.user.name,
      email: req.user.email,
    };
    return res.status(200).json({
      user: userData,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get current user err - ${error.message}` });
  }
};