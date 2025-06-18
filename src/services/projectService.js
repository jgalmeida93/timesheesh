const projectRepository = require("../repositories/projectRepository");

class ProjectService {
  async getProjects(userId) {
    return await projectRepository.findByUser(userId);
  }

  async createProject(userId, name) {
    return await projectRepository.create({
      name: name.toLowerCase(),
      userId,
    });
  }
}

module.exports = new ProjectService();
