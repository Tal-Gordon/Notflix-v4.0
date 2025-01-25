const userService = require("../services/user");

const authMiddleware = async (req, res, next) => {
  if (!(await userService.authenticateUserById(req.headers["id"]))) {
    return res
      .status(400)
      .json({ error: "User not registered or incorrect id" });
  }
  next();
};

const adminAuthMiddleware = async (req, res, next) => {
  if (!(await userService.adminAuthMiddleware(req.headers["id"]))) {
    return res
      .status(400)
      .json({ error: "No admin is signed in" });
  }
  next();
};

module.exports = authMiddleware;
