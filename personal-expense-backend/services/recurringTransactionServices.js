const { prisma } = require("../src/lib/prism");

module.exports = {
  /* ---------------- CREATE ---------------- */
  createRecurring: async (data) => {
    return prisma.Recurring.create({
      data,
    });
  },

  /* ---------------- READ ---------------- */
  getRecurringByUser: async (userId) => {
    return prisma.Recurring.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },
  getRecurringById: async (id, userId) => {
    return prisma.Recurring.findFirst({
      where: { id, userId },
    });
  },

  /* ---------------- UPDATE ---------------- */
  updateRecurring: async (id, userId, data) => {
    return prisma.Recurring.updateMany({
      where: { id, userId },
      data,
    });
  },

  /* ---------------- DELETE ---------------- */
  deleteRecurring: async (id, userId) => {
    return prisma.Recurring.deleteMany({
      where: { id, userId },
    });
  },
};
