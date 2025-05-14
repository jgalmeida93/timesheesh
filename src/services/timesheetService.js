const timesheetRepository = require("../repositories/timesheetRepository");
const projectRepository = require("../repositories/projectRepository");

class TimesheetService {
  async getTimesheet(userId, options) {
    return await timesheetRepository.findByUser(userId, options);
  }

  async createEntry(userId, entryData) {
    const { projectId, date, hours, notes } = entryData;

    const project = await projectRepository.findById(projectId);

    if (!project || project.userId !== userId) {
      throw new Error("Project not found");
    }

    return await timesheetRepository.create({
      userId,
      projectId,
      date: new Date(date),
      hours,
      notes,
    });
  }

  async getMonthlyReport(userId, year, month) {
    if (!year || !month) {
      throw new Error("Year and month are required");
    }

    const entries = await timesheetRepository.getMonthlyReport(
      userId,
      year,
      month
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
    const entry = await timesheetRepository.findById(entryId, userId);

    if (!entry) {
      throw new Error(
        "Timesheet entry not found or you don't have permission to delete it"
      );
    }

    await timesheetRepository.deleteEntry(entryId);
    return { message: "Timesheet entry deleted successfully" };
  }
}

module.exports = new TimesheetService();
