const authService = require("../services/authService");

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, phone, password } = req.body;
      const user = await authService.register({ name, email, phone, password });
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
