const express = require("express");
const router = express.Router();
const timesheetController = require("../controllers/timesheetController");
const { authenticateToken } = require("../middleware/auth");

router.get(
  "/monthly",
  authenticateToken,
  timesheetController.getMonthlyReport.bind(timesheetController),
);
router.get(
  "/monthly/download",
  authenticateToken,
  timesheetController.downloadMonthlyReport.bind(timesheetController),
);

module.exports = router;
