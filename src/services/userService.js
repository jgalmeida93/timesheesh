const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");

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
        user.password,
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
