const { prisma } = require("../src/lib/prism");

/* ================================
   TRANSACTIONS
================================ */
module.exports = {

  getTransactionsByUser: async (userId) => {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
  },

  /* ================================
   BILLS
================================ */

  getBillsByUser: async (userId) => {
    return prisma.bill.findMany({
      where: { userId },
      orderBy: { dueDay: "asc" },
    });
  },

  /* ================================
   DEBTS
================================ */

  getDebtsByUser: async (userId) => {
    return prisma.debt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  /* ================================
   GOALS
================================ */

  getGoalsByUser: async (userId) => {
    return prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: "asc" },
    });
  },

  /* ================================
   BUDGETS
================================ */

  getBudgetsByUser: async (userId) => {
    return prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  /* ================================
   RECURRING TRANSACTIONS
================================ */

  getRecurringTransactionsByUser: async (userId) => {
    return prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
  },

  /* ================================
   CATEGORIES
================================ */

  getCategoriesByUser: async (userId) => {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  },

  /* ================================
   INVESTMENTS
================================ */

  getInvestmentsByUser: async (userId) => {
    return prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },
};