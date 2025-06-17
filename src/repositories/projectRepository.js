const prisma = require("../lib/prisma");
const logger = require("../observability/logger");

class ProjectRepository {
  async findById(id) {
    return await prisma.project.findUnique({
      where: { id },
    });
  }

  async findByUserAndName(userId, name) {
    logger.debug(
      `Repository: Finding project for user ${userId} with name "${name}"`
    );

    const nameToLower = name.toLowerCase();

    try {
      const project = await prisma.project.findFirst({
        where: {
          userId,
          name: {
            equals: nameToLower,
          },
        },
      });

      if (project) {
        logger.debug(
          `Repository: Found project ${project.id} with name "${project.name}"`
        );
      } else {
        logger.debug(
          `Repository: No project found with name "${name}" for user ${userId}`
        );
      }

      return project;
    } catch (error) {
      logger.error(`Repository: Error finding project: ${error.message}`);
      throw error;
    }
  }

  async findByUser(userId) {
    return await prisma.project.findMany({
      where: { userId },
      orderBy: {
        name: "asc",
      },
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
