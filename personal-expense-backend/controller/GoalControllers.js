const { prisma } = require("../lib/prism");

/**
 * All goal operations are scoped to the authenticated user
 * req.user.sub is provided by Supabase JWT middleware
 */

module.exports = {
  // GET /api/goals
  async getGoals(req, res) {
    try {
      const userId = req.user.sub;

      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      res.json(goals);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  },

  // POST /api/goals
  async createGoal(req, res) {
    try {
      const userId = req.user.sub;
      const { name, targetAmount, deadline } = req.body;

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
          deadline: deadline ? new Date(deadline) : null,
        },
      });

      res.status(201).json(goal);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to create goal" });
    }
  },

  // PUT /api/goals/:id
  async updateGoal(req, res) {
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
  async deleteGoal(req, res) {
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
  async contributeToGoal(req, res) {
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