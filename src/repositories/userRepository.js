const prisma = require("../lib/prisma");

class UserRepository {
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findByPhone(phone) {
    return await prisma.user.findUnique({
      where: { phone },
    });
  }

  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(userData) {
    return await prisma.user.create({
      data: userData,
    });
  }

  async update(id, userData) {
    return await prisma.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id) {
    await prisma.timesheet.deleteMany({
      where: { userId: id },
    });

    await prisma.project.deleteMany({
      where: { userId: id },
    });

    return await prisma.user.delete({
      where: { id },
    });
  }
}

module.exports = new UserRepository();
