const userService = require("../services/userService");

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (error) {
      if (error.message === "User not found") {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = req.body;
      const updatedUser = await userService.updateUser(id, userData);
      res.json(updatedUser);
    } catch (error) {
      if (error.message === "User not found") {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userData = req.body;
      const updatedUser = await userService.updateProfile(
        req.user.id,
        userData,
      );
      res.json(updatedUser);
    } catch (error) {
      if (error.message === "Current password is incorrect") {
        res.status(401).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);
      res.json(result);
    } catch (error) {
      if (error.message === "User not found") {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }
}

module.exports = new UserController();
