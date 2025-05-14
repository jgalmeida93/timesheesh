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
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);

    if (isNaN(parsedYear) || isNaN(parsedMonth)) {
      throw new Error(`Invalid year or month: year=${year}, month=${month}`);
    }

    const startDate = new Date(parsedYear, parsedMonth - 1, 1);
    const endDate = new Date(parsedYear, parsedMonth, 0);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error(
        `Invalid date range: startDate=${startDate}, endDate=${endDate}`
      );
    }

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

  async deleteEntry(id) {
    return await prisma.timesheet.delete({
      where: { id: parseInt(id) },
    });
  }

  async findById(id, userId) {
    return await prisma.timesheet.findFirst({
      where: {
        id: parseInt(id),
        userId: userId ? parseInt(userId) : undefined,
      },
    });
  }
}

module.exports = new TimesheetRepository();
