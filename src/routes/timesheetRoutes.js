const express = require("express");
const router = express.Router();
const timesheetController = require("../controllers/timesheetController");
const { authenticateToken } = require("../middleware/auth");

router.get(
  "/",
  authenticateToken,
  timesheetController.getTimesheet.bind(timesheetController)
);
router.post(
  "/",
  authenticateToken,
  timesheetController.createEntry.bind(timesheetController)
);
router.delete(
  "/:id",
  authenticateToken,
  timesheetController.deleteEntry.bind(timesheetController)
);

module.exports = router;
