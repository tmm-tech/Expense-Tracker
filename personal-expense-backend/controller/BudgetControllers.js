const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Assumes auth middleware sets req.user.id
 */

module.exports = {
  /* ===========================
     CREATE BUDGET
  ============================ */
  createBudget: async (req, res) => {
    try {
      const { category, limit, month } = req.body;

      const existing = await prisma.budget.findFirst({
        where: {
          userId: req.user.id,
          category,
          month,
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Budget already exists for this category and month",
        });
      }

      const budget = await prisma.budget.create({
        data: {
          userId: req.user.id,
          category,
          limit: Number(limit),
          rollover: 0,
          month, // YYYY-MM
        },
      });

      res.json({
        success: true,
        message: "Budget created successfully",
        data: budget,
      });
    } catch (error) {
      console.error("Create budget error:", error);
      res.status(500).json({
        success: false,
        message: `Create Budget Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     GET BUDGETS (BY MONTH)
  ============================ */
  getBudgets: async (req, res) => {
    try {
      const { month } = req.query;

      if (!month) {
        return res.status(400).json({
          success: false,
          message: "Month (YYYY-MM) is required",
        });
      }

      const budgets = await prisma.budget.findMany({
        where: {
          userId: req.user.id,
          month,
        },
        orderBy: { category: "asc" },
      });

      res.json({
        success: true,
        data: budgets,
      });
    } catch (error) {
      console.error("Get budgets error:", error);
      res.status(500).json({
        success: false,
        message: `Get Budgets Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     UPDATE BUDGET LIMIT
     (Drag-to-adjust UX)
  ============================ */
  updateBudget: async (req, res) => {
    try {
      const { limit } = req.body;

      const updated = await prisma.budget.updateMany({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        data: {
          limit: Number(limit),
        },
      });

      if (!updated.count) {
        return res.status(404).json({
          success: false,
          message: "Budget not found",
        });
      }

      res.json({
        success: true,
        message: "Budget updated successfully",
      });
    } catch (error) {
      console.error("Update budget error:", error);
      res.status(500).json({
        success: false,
        message: `Update Budget Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     DELETE BUDGET
  ============================ */
  deleteBudget: async (req, res) => {
    try {
      const deleted = await prisma.budget.deleteMany({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!deleted.count) {
        return res.status(404).json({
          success: false,
          message: "Budget not found",
        });
      }

      res.json({
        success: true,
        message: "Budget deleted successfully",
      });
    } catch (error) {
      console.error("Delete budget error:", error);
      res.status(500).json({
        success: false,
        message: `Delete Budget Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     APPLY ROLLOVER
     From previous month → next
  ============================ */
  applyRollover: async (req, res) => {
    try {
      const { fromMonth, toMonth } = req.body;

      if (!fromMonth || !toMonth) {
        return res.status(400).json({
          success: false,
          message: "fromMonth and toMonth are required",
        });
      }

      const previousBudgets = await prisma.budget.findMany({
        where: {
          userId: req.user.id,
          month: fromMonth,
        },
      });

      if (!previousBudgets.length) {
        return res.json({
          success: true,
          message: "No budgets to rollover",
          rolledOver: 0,
        });
      }

      const newBudgets = previousBudgets.map((b) => ({
        userId: req.user.id,
        category: b.category,
        limit: b.limit + (b.rollover || 0),
        rollover: 0,
        month: toMonth,
      }));

      const result = await prisma.budget.createMany({
        data: newBudgets,
        skipDuplicates: true,
      });

      res.json({
        success: true,
        message: "Budget rollover applied",
        rolledOver: result.count,
      });
    } catch (error) {
      console.error("Apply rollover error:", error);
      res.status(500).json({
        success: false,
        message: `Rollover Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     BUDGET VS ACTUAL
     (Charts / Alerts)
  ============================ */
  getBudgetUsage: async (req, res) => {
    try {
      const { month } = req.query;

      const budgets = await prisma.budget.findMany({
        where: {
          userId: req.user.id,
          month,
        },
      });

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.user.id,
          date: {
            gte: new Date(`${month}-01`),
            lt: new Date(`${month}-31`),
          },
          amount: { lt: 0 },
        },
      });

      const usage = budgets.map((b) => {
        const spent = transactions
          .filter((t) => t.category === b.category)
          .reduce((s, t) => s + Math.abs(t.amount), 0);

        return {
          category: b.category,
          limit: b.limit,
          spent,
          remaining: Math.max(0, b.limit - spent),
          percentUsed: Math.min(100, (spent / b.limit) * 100),
        };
      });

      res.json({
        success: true,
        data: usage,
      });
    } catch (error) {
      console.error("Budget usage error:", error);
      res.status(500).json({
        success: false,
        message: `Budget Usage Error: ${error.message}`,
      });
    }
  },
};