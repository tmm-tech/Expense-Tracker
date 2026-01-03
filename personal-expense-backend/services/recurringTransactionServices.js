const { prisma } = require("../src/lib/prism");

module.exports = {
  /* ---------------- CREATE ---------------- */
  createRecurring: async (data) => {
    return prisma.recurringTransaction.create({
      data,
    });
  },

  /* ---------------- READ ---------------- */
  getRecurringByUser: async (userId) => {
    return prisma.recurringTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },
  getRecurringById: async (id, userId) => {
    return prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });
  },

  /* ---------------- UPDATE ---------------- */
  updateRecurring: async (id, userId, data) => {
    return prisma.recurringTransaction.updateMany({
      where: { id, userId },
      data,
    });
  },

  /* ---------------- DELETE ---------------- */
  deleteRecurring: async (id, userId) => {
    return prisma.recurringTransaction.deleteMany({
      where: { id, userId },
    });
  },
};
