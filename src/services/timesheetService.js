const timesheetRepository = require("../repositories/timesheetRepository");
const projectRepository = require("../repositories/projectRepository");
const logger = require("../observability/logger");

class TimesheetService {
  async getTimesheet(userId, options) {
    logger.debug(
      `Fetching timesheet for user ${userId} with options: ${JSON.stringify(options)}`
    );
    const entries = await timesheetRepository.findByUser(userId, options);
    logger.debug(
      `Retrieved ${entries.length} timesheet entries for user ${userId}`
    );
    return entries;
  }

  async createEntry(userId, entryData) {
    const { projectId, date, hours, notes } = entryData;
    logger.debug(
      `Creating timesheet entry for user ${userId}: ${JSON.stringify(entryData)}`
    );

    const project = await projectRepository.findById(projectId);

    if (!project) {
      logger.warn(
        `Project ${projectId} not found when creating timesheet entry for user ${userId}`
      );
      throw new Error("Project not found");
    }

    if (project.userId !== userId) {
      logger.warn(
        `User ${userId} attempted to log time for project ${projectId} they don't own`
      );
      throw new Error("Project not found");
    }

    const entry = await timesheetRepository.create({
      userId,
      projectId,
      date: new Date(date),
      hours,
      notes,
    });

    logger.info(
      `Created timesheet entry ${entry.id} for user ${userId}, project ${projectId}, ${hours} hours on ${date}`
    );
    return entry;
  }

  async getMonthlyReport(userId, year, month) {
    logger.debug(
      `Generating monthly report for user ${userId}, year ${year}, month ${month}`
    );

    if (!year || !month) {
      logger.warn(
        `Missing year or month for monthly report: user ${userId}, year ${year}, month ${month}`
      );
      throw new Error("Year and month are required");
    }

    const entries = await timesheetRepository.getMonthlyReport(
      userId,
      year,
      month
    );

    logger.debug(
      `Retrieved ${entries.length} entries for monthly report: user ${userId}, ${year}/${month}`
    );

    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

    const projectSummary = entries.reduce((acc, entry) => {
      const projectName = entry.project.name;
      if (!acc[projectName]) {
        acc[projectName] = 0;
      }
      acc[projectName] += entry.hours;
      return acc;
    }, {});

    const dailySummary = entries.reduce((acc, entry) => {
      const dateStr = entry.date.toISOString().split("T")[0];
      if (!acc[dateStr]) {
        acc[dateStr] = 0;
      }
      acc[dateStr] += entry.hours;
      return acc;
    }, {});

    logger.info(
      `Generated monthly report for user ${userId}, ${year}/${month}: ${totalHours} total hours across ${Object.keys(projectSummary).length} projects`
    );

    return {
      year,
      month,
      totalHours,
      projectSummary,
      dailySummary,
      entries,
    };
  }

  async deleteEntry(userId, entryId) {
    logger.debug(
      `Attempting to delete timesheet entry ${entryId} for user ${userId}`
    );

    const entry = await timesheetRepository.findById(entryId, userId);

    if (!entry) {
      logger.warn(
        `Timesheet entry ${entryId} not found or doesn't belong to user ${userId}`
      );
      throw new Error(
        "Timesheet entry not found or you don't have permission to delete it"
      );
    }

    await timesheetRepository.deleteEntry(entryId);
    logger.info(
      `Deleted timesheet entry ${entryId} for user ${userId}, project ${entry.projectId}`
    );
    return { message: "Timesheet entry deleted successfully" };
  }
}

module.exports = new TimesheetService();
