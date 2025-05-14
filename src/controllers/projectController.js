const projectService = require("../services/projectService");

class ProjectController {
  async getProjects(req, res, next) {
    try {
      const projects = await projectService.getProjects(req.user.id);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  async createProject(req, res, next) {
    try {
      const { name } = req.body;
      const project = await projectService.createProject(req.user.id, name);
      res.status(201).json(project);
    } catch (error) {
      if (error.code === "P2002") {
        res
          .status(400)
          .json({ error: "Project with this name already exists" });
      } else {
        next(error);
      }
    }
  }
}

module.exports = new ProjectController();
