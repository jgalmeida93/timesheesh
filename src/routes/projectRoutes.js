const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { authenticateToken } = require("../middleware/auth");

router.get(
  "/",
  authenticateToken,
  projectController.getProjects.bind(projectController),
);
router.post(
  "/",
  authenticateToken,
  projectController.createProject.bind(projectController),
);

module.exports = router;
