const { prisma } = require("../src/lib/prism");

/**
 * All goal operations are scoped to the authenticated user
 * req.user.sub is provided by Supabase JWT middleware
 */

module.exports = {
  // GET /api/goals
  getGoals: async (req, res) => {
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

      // 2️⃣ Fetch goals + total count
      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });
      const goalCount = await prisma.goal.count({ where: { userId } });

      if (goalCount === 0) {
        return res.json({ success: true, message: "No goals to check" });
      }

      // 3️⃣ Standard ApiResponse
      res.json({
        success: true,
        data: goals,
        pagination: {
          page,
          limit,
          total: goalCount,
          totalPages: Math.ceil(goalCount / limit),
        },
      });
    } catch (err) {
      console.error("Get goals error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch goals",
      });
    }
  },

  // POST /api/goals
  createGoal: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { name, targetAmount, endDate } = req.body;

      if (!name || targetAmount == null) {
        return res
          .status(400)
          .json({ message: "Name and target amount are required" });
      }

      const goal = await prisma.goal.create({
        data: {
          userId,
          name,
          targetAmount,
          endDate: endDate ? new Date(endDate) : null,
        },
      });

      res.status(201).json(goal);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to create goal" });
    }
  },

  // PUT /api/goals/:id
  updateGoal: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const updated = await prisma.goal.updateMany({
        where: { id, userId },
        data: req.body,
      });

      if (!updated.count) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to update goal" });
    }
  },

  // DELETE /api/goals/:id
  deleteGoal: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const deleted = await prisma.goal.deleteMany({
        where: { id, userId },
      });

      if (!deleted.count) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to delete goal" });
    }
  },

  // POST /api/goals/:id/contribute
  contributeToGoal: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid contribution amount" });
      }

      const goal = await prisma.goal.findFirst({
        where: { id, userId },
      });

      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      const newAmount = goal.currentAmount + amount;
      const completed = newAmount >= goal.targetAmount;

      const updatedGoal = await prisma.goal.update({
        where: { id },
        data: {
          currentAmount: newAmount,
          status: completed ? "completed" : "active",
        },
      });

      res.json(updatedGoal);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to contribute to goal" });
    }
  },
};
