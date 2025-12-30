const { prisma } = require("../src/lib/prism");

/**
 * All controllers assume:
 * req.user.sub = Supabase user id
 */

module.exports = {
  // GET /api/budgets
  getBudgets: async (req, res) => {
    try {
      if (!req.user?.sub) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const userId = req.user.sub;

      // 1️⃣ Pagination params
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const skip = (page - 1) * limit;

      // 2️⃣ Fetch budgets + total count
      const [budgets, total] = await Promise.all([
        prisma.budget.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.budget.count({
          where: { userId },
        }),
      ]);
      const budgetsCount = await prisma.budget.count({ where: { userId } });

      if (budgetsCount === 0) {
        return res.json({ success: true, message: "No budget to check" });
      }

      // 3️⃣ Standard ApiResponse
      res.json({
        success: true,
        data: budgets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error("Get budgets error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch budgets",
      });
    }
  },

  // POST /api/budgets
  createBudget: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { categoryIds, limit, period, startDate, endDate } = req.body;

      if (!categoryIds?.length || !limit || !period || !startDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const budget = await prisma.budget.create({
        data: {
          userId,
          categoryIds,
          limit,
          period,
          startDate,
          endDate,
        },
      });

      res.status(201).json(budget);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to create budget" });
    }
  },

  // PUT /api/budgets/:id
  updateBudget: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const updated = await prisma.budget.updateMany({
        where: { id, userId },
        data: req.body,
      });

      if (!updated.count) {
        return res.status(404).json({ message: "Budget not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to update budget" });
    }
  },

  // DELETE /api/budgets/:id
  deleteBudget: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const deleted = await prisma.budget.deleteMany({
        where: { id, userId },
      });

      if (!deleted.count) {
        return res.status(404).json({ message: "Budget not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to delete budget" });
    }
  },
};
