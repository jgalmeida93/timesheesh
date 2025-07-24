const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

router.get(
  "/",
  authenticateToken,
  userController.getAllUsers.bind(userController)
);
router.get(
  "/me",
  authenticateToken,
  userController.getCurrentUser.bind(userController)
);
router.get(
  "/me/dashboard",
  authenticateToken,
  userController.getDashboardStats.bind(userController)
);
router.get(
  "/:id",
  authenticateToken,
  userController.getUserById.bind(userController)
);
router.put(
  "/me/profile",
  authenticateToken,
  userController.updateProfile.bind(userController)
);
router.put(
  "/:id",
  authenticateToken,
  userController.updateUser.bind(userController)
);
router.delete(
  "/:id",
  authenticateToken,
  userController.deleteUser.bind(userController)
);

module.exports = router;
