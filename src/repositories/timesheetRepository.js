class TimesheetRepository {
  async findById(id) {
    return await prisma.timesheet.findUnique({
      where: { id },
    });
  }

  async findByUser(userId, options = {}) {
    const { startDate, endDate } = options;

    return await prisma.timesheet.findMany({
      where: {
        userId,
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  async create(timesheetData) {
    return await prisma.timesheet.create({
      data: timesheetData,
    });
  }

  async update(id, timesheetData) {
    return await prisma.timesheet.update({
      where: { id },
      data: timesheetData,
    });
  }

  async delete(id) {
    return await prisma.timesheet.delete({
      where: { id },
    });
  }

  async getMonthlyReport(userId, year, month) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    return await prisma.timesheet.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        date: "asc",
      },
    });
  }
}

module.exports = new TimesheetRepository();
