const authService = require("../services/authService");
const logger = require("../observability/logger");

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, phone } = req.body;
      logger.info(`Registration attempt for user: ${email}, phone: ${phone}`);

      const user = await authService.register(req.body);

      logger.info(`User registered successfully: ${user.id}, ${email}`);
      res.status(201).json(user);
    } catch (error) {
      logger.error(
        `Registration failed for ${req.body.email}: ${error.message}`
      );
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email } = req.body;
      logger.info(`Login attempt for user: ${email}`);

      const result = await authService.login(email, req.body.password);

      logger.info(`User logged in successfully: ${email}`);
      res.json(result);
    } catch (error) {
      logger.warn(
        `Failed login attempt for ${req.body.email}: ${error.message}`
      );
      res.status(401).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
