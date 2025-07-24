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

  async getProjectById(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(
        req.user.id,
        parseInt(id)
      );
      res.json(project);
    } catch (error) {
      if (error.message === "Project not found") {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  async createProject(req, res, next) {
    try {
      const { name, hourlyRate = 0, currency = "USD" } = req.body;
      const project = await projectService.createProject(req.user.id, {
        name,
        hourlyRate: parseFloat(hourlyRate),
        currency,
      });
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

  async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const { name, hourlyRate, currency } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (hourlyRate !== undefined)
        updateData.hourlyRate = parseFloat(hourlyRate);
      if (currency !== undefined) updateData.currency = currency;

      const project = await projectService.updateProject(
        req.user.id,
        parseInt(id),
        updateData
      );
      res.json(project);
    } catch (error) {
      if (error.message === "Project not found") {
        res.status(404).json({ error: error.message });
      } else if (error.code === "P2002") {
        res
          .status(400)
          .json({ error: "Project with this name already exists" });
      } else {
        next(error);
      }
    }
  }

  async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      const result = await projectService.deleteProject(
        req.user.id,
        parseInt(id)
      );
      res.json(result);
    } catch (error) {
      if (error.message === "Project not found") {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }
}

module.exports = new ProjectController();
