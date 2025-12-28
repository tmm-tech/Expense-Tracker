const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Alerts are system-generated notifications per user
 * req.user.sub comes from Supabase JWT
 */

module.exports = {
  // GET /api/alerts
  getAlerts: async (req, res) => {
    try {
      const userId = req.user.sub;

      const alerts = await prisma.alert.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      res.json(alerts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  },

  // POST /api/alerts/:id/read
  markAsRead: async(req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const updated = await prisma.alert.updateMany({
        where: { id, userId },
        data: { isRead: true },
      });

      if (!updated.count) {
        return res.status(404).json({ message: "Alert not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to update alert" });
    }
  },

  // POST /api/alerts/read-all
  markAllAsRead: async(req, res) => {
    try {
      const userId = req.user.sub;

      await prisma.alert.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to mark alerts as read" });
    }
  },

  // POST /api/alerts/run-checks
  runChecks: async(req, res) => {
    try {
      const userId = req.user.sub;
      const now = new Date();

      const alertsToCreate = [];

      /* ---------------- Bills Due ---------------- */
      const bills = await prisma.bill.findMany({
        where: {
          userId,
          isPaid: false,
          dueDate: {
            lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          },
        },
      });

      for (const bill of bills) {
        alertsToCreate.push({
          userId,
          type: "bill_due",
          severity: "warning",
          title: "Upcoming Bill Due",
          message: `${bill.name} is due soon`,
        });
      }

      /* ---------------- Budgets Exceeded ---------------- */
      const budgets = await prisma.budget.findMany({
        where: { userId },
      });

      for (const budget of budgets) {
        const spent = await prisma.transaction.aggregate({
          where: {
            userId,
            type: "expense",
            categoryId: { in: budget.categoryIds },
            date: { gte: new Date(budget.startDate) },
          },
          _sum: { amount: true },
        });

        if ((spent._sum.amount || 0) > budget.limit) {
          alertsToCreate.push({
            userId,
            type: "budget_exceeded",
            severity: "critical",
            title: "Budget Exceeded",
            message: `You exceeded your ${budget.name} budget`,
          });
        }
      }

      /* ---------------- Low Account Balance ---------------- */
      const accounts = await prisma.account.findMany({
        where: { userId },
      });

      for (const acc of accounts) {
        if (acc.balance < 0) {
          alertsToCreate.push({
            userId,
            type: "low_balance",
            severity: "critical",
            title: "Negative Balance",
            message: `${acc.name} has a negative balance`,
          });
        }
      }

      /* ---------------- Goal Completed ---------------- */
      const completedGoals = await prisma.goal.findMany({
        where: {
          userId,
          status: "completed",
        },
      });

      for (const goal of completedGoals) {
        alertsToCreate.push({
          userId,
          type: "goal_completed",
          severity: "info",
          title: "Goal Completed 🎉",
          message: `You completed the goal: ${goal.name}`,
        });
      }

      /* ---------------- Save Alerts ---------------- */
      if (alertsToCreate.length) {
        await prisma.alert.createMany({
          data: alertsToCreate,
          skipDuplicates: true,
        });
      }

      res.json({ success: true, created: alertsToCreate.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Alert checks failed" });
    }
  },
};