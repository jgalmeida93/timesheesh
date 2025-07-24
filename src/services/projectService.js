const projectRepository = require("../repositories/projectRepository");

class ProjectService {
  async getProjects(userId) {
    return await projectRepository.findByUser(userId);
  }

  async getProjectById(userId, projectId) {
    const project = await projectRepository.findById(projectId);

    if (!project || project.userId !== userId) {
      throw new Error("Project not found");
    }

    return project;
  }

  async createProject(userId, projectData) {
    return await projectRepository.create({
      name: projectData.name.toLowerCase(),
      hourlyRate: projectData.hourlyRate || 0,
      currency: projectData.currency || "USD",
      userId,
    });
  }

  async updateProject(userId, projectId, updateData) {
    const project = await projectRepository.findById(projectId);

    if (!project || project.userId !== userId) {
      throw new Error("Project not found");
    }

    if (updateData.name) {
      updateData.name = updateData.name.toLowerCase();
    }

    return await projectRepository.update(projectId, updateData);
  }

  async deleteProject(userId, projectId) {
    const project = await projectRepository.findById(projectId);

    if (!project || project.userId !== userId) {
      throw new Error("Project not found");
    }

    await projectRepository.delete(projectId);
    return { message: "Project deleted successfully" };
  }
}

module.exports = new ProjectService();
