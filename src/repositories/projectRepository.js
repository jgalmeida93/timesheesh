class ProjectRepository {
  async findById(id) {
    return await prisma.project.findUnique({
      where: { id },
    });
  }

  async findByUserAndName(userId, name) {
    return await prisma.project.findFirst({
      where: {
        userId,
        name,
      },
    });
  }

  async findByUser(userId) {
    return await prisma.project.findMany({
      where: { userId },
    });
  }

  async create(projectData) {
    return await prisma.project.create({
      data: projectData,
    });
  }

  async update(id, projectData) {
    return await prisma.project.update({
      where: { id },
      data: projectData,
    });
  }

  async delete(id) {
    await prisma.timesheet.deleteMany({
      where: { projectId: id },
    });

    return await prisma.project.delete({
      where: { id },
    });
  }
}

module.exports = new ProjectRepository();
