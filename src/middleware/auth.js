const jwt = require("jsonwebtoken");
const logger = require("../observability/logger");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn(
      `Authentication failed: No token provided - ${req.method} ${req.originalUrl}`
    );
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(
        `Authentication failed: Invalid token - ${req.method} ${req.originalUrl} - Error: ${err.message}`
      );
      return res.status(403).json({ error: "Forbidden" });
    }

    logger.info(
      `User ${user.id} authenticated for ${req.method} ${req.originalUrl}`
    );
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
