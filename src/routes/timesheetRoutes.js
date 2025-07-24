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
router.get(
  "/:id",
  authenticateToken,
  timesheetController.getEntryById.bind(timesheetController)
);
router.put(
  "/:id",
  authenticateToken,
  timesheetController.updateEntry.bind(timesheetController)
);
router.delete(
  "/:id",
  authenticateToken,
  timesheetController.deleteEntry.bind(timesheetController)
);

module.exports = router;
