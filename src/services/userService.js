const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");
const projectRepository = require("../repositories/projectRepository");
const timesheetRepository = require("../repositories/timesheetRepository");

class UserService {
  async getAllUsers() {
    return await userRepository.findAll();
  }

  async getUserById(id) {
    const user = await userRepository.findById(parseInt(id));

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async getDashboardStats(userId) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Get total projects count
    const projects = await projectRepository.findByUser(userId);
    const totalProjects = projects.length;

    // Get all timesheet entries for total hours
    const allEntries = await timesheetRepository.findByUser(userId, {});
    const totalHours = allEntries.reduce((sum, entry) => sum + entry.hours, 0);

    // Get current month entries
    const monthlyEntries = await timesheetRepository.getMonthlyReport(
      userId,
      currentYear,
      currentMonth
    );
    const monthlyHours = monthlyEntries.reduce(
      (sum, entry) => sum + entry.hours,
      0
    );

    // Calculate monthly earnings
    const monthlyEarnings = monthlyEntries.reduce((sum, entry) => {
      return sum + entry.hours * (entry.project.hourlyRate || 0);
    }, 0);

    // Get recent projects (last 5)
    const recentProjects = projects
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Get recent time entries (last 10)
    const recentEntries = allEntries
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return {
      totalProjects,
      activeProjects: totalProjects, // For now, all projects are considered active
      totalHours,
      monthlyHours,
      monthlyEarnings,
      recentProjects,
      recentEntries,
      currentMonth: currentMonth,
      currentYear: currentYear,
    };
  }

  async updateUser(id, userData) {
    const user = await userRepository.findById(parseInt(id));

    if (!user) {
      throw new Error("User not found");
    }

    const updateData = {};
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.password !== undefined) {
      updateData.password = await bcrypt.hash(userData.password, 10);
    }

    return await userRepository.update(parseInt(id), updateData);
  }

  async updateProfile(id, userData) {
    const { name, email, phone, currentPassword, newPassword } = userData;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    if (newPassword) {
      const user = await userRepository.findById(id);

      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!validPassword) {
        throw new Error("Current password is incorrect");
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    return await userRepository.update(id, updateData);
  }

  async deleteUser(id) {
    const user = await userRepository.findById(parseInt(id));

    if (!user) {
      throw new Error("User not found");
    }

    await userRepository.delete(parseInt(id));
    return { message: "User deleted successfully" };
  }
}

module.exports = new UserService();
