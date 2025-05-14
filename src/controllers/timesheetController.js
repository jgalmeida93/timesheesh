const timesheetService = require("../services/timesheetService");
const { generateMonthlyReport } = require("../utils/reportGenerator");

class TimesheetController {
  async getTimesheet(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const timesheet = await timesheetService.getTimesheet(req.user.id, {
        startDate,
        endDate,
      });
      res.json(timesheet);
    } catch (error) {
      next(error);
    }
  }

  async createEntry(req, res, next) {
    try {
      const { projectId, date, hours, notes } = req.body;
      const entry = await timesheetService.createEntry(req.user.id, {
        projectId,
        date,
        hours,
        notes,
      });
      res.status(201).json(entry);
    } catch (error) {
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
      const report = await timesheetService.getMonthlyReport(
        req.user.id,
        year,
        month,
      );
      res.json(report);
    } catch (error) {
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
      const reportPath = await generateMonthlyReport(req.user.id, year, month);
      res.download(reportPath);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TimesheetController();
