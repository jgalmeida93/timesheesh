const timesheetService = require("../services/timesheetService");
const { generateMonthlyReport } = require("../reports");
const logger = require("../observability/logger");

class TimesheetController {
  async getTimesheet(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      logger.info(
        `User ${req.user.id} requested timesheet from ${startDate || "all"} to ${endDate || "all"}`
      );

      const timesheet = await timesheetService.getTimesheet(req.user.id, {
        startDate,
        endDate,
      });

      logger.debug(
        `Retrieved ${timesheet.length} timesheet entries for user ${req.user.id}`
      );
      res.json(timesheet);
    } catch (error) {
      logger.error(
        `Error retrieving timesheet for user ${req.user.id}: ${error.message}`
      );
      next(error);
    }
  }

  async createEntry(req, res, next) {
    try {
      const { projectId, date, hours, notes } = req.body;
      logger.info(
        `User ${req.user.id} creating timesheet entry: ${hours}hrs for project ${projectId} on ${date}`
      );

      const entry = await timesheetService.createEntry(req.user.id, {
        projectId,
        date,
        hours,
        notes,
      });

      logger.info(
        `Created timesheet entry ${entry.id} for user ${req.user.id}`
      );
      res.status(201).json(entry);
    } catch (error) {
      logger.error(
        `Error creating timesheet entry for user ${req.user.id}: ${error.message}`
      );
      if (error.message === "Project not found") {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async getMonthlyReport(req, res, next) {
    try {
      const { year, month } = req.query;
      logger.info(
        `User ${req.user.id} requested monthly report for ${year}/${month}`
      );

      const report = await timesheetService.getMonthlyReport(
        req.user.id,
        year,
        month
      );

      logger.debug(
        `Generated monthly report for user ${req.user.id}, ${year}/${month} with ${report.entries?.length || 0} entries`
      );
      res.json(report);
    } catch (error) {
      logger.error(
        `Error generating monthly report for user ${req.user.id}: ${error.message}`
      );
      if (error.message === "Year and month are required") {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async downloadMonthlyReport(req, res, next) {
    try {
      const { year, month } = req.query;
      logger.info(
        `User ${req.user.id} downloading monthly report for ${year}/${month}`
      );

      if (!year || !month) {
        logger.warn(
          `User ${req.user.id} attempted to download report without year/month`
        );
        return res.status(400).json({ error: "Year and month are required" });
      }

      const parsedYear = parseInt(year);
      const parsedMonth = parseInt(month);

      if (isNaN(parsedYear) || isNaN(parsedMonth)) {
        logger.warn(
          `User ${req.user.id} provided invalid year/month format: ${year}/${month}`
        );
        return res
          .status(400)
          .json({ error: "Year and month must be valid numbers" });
      }

      const reportPath = await generateMonthlyReport(
        req.user.id,
        parsedYear,
        parsedMonth
      );

      logger.info(`Generated report at ${reportPath} for user ${req.user.id}`);
      res.download(reportPath);
    } catch (error) {
      logger.error(
        `Error downloading monthly report for user ${req.user.id}: ${error.message}`
      );
      next(error);
    }
  }

  async deleteEntry(req, res, next) {
    try {
      const { id } = req.params;
      logger.info(`User ${req.user.id} deleting timesheet entry ${id}`);

      const result = await timesheetService.deleteEntry(req.user.id, id);

      logger.info(`Deleted timesheet entry ${id} for user ${req.user.id}`);
      res.json(result);
    } catch (error) {
      logger.error(
        `Error deleting timesheet entry ${req.params.id} for user ${req.user.id}: ${error.message}`
      );
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }
}

module.exports = new TimesheetController();
