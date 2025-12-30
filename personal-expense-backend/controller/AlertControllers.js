const { prisma } = require("../src/lib/prism");

/**
 * Alerts are system-generated notifications per user
 * req.user.sub comes from Supabase JWT
 */
// POST /api/alerts/run-checks
let lastRunAt = 0;
const MIN_INTERVAL = 5 * 60 * 1000; // 5 minutes

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
  markAsRead: async (req, res) => {
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
  markAllAsRead: async (req, res) => {
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

  runChecks: async (req, res) => {
    try {
      const userId = req.user.sub;
      const now = Date.now();

      // 🛑 throttle to protect DB
      if (now - lastRunAt < MIN_INTERVAL) {
        return res.json({ success: true, skipped: true });
      }
      lastRunAt = now;

      const alertsToCreate = [];
      const todayDay = new Date().getDate();

      /* ---------------- Bills Due ---------------- */
      const bills = await prisma.bill.findMany({
        where: {
          userId,
          isPaid: false,
          dueDay: { lte: todayDay },
        },
        select: { id: true, name: true },
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
        select: {
          id: true,
          limit: true,
          startDate: true,
          categoryId: true,
        },
      });

      if (budgets.length) {
        const transactions = await prisma.transaction.findMany({
          where: {
            userId,
            type: "expense",
            date: {
              gte: new Date(Math.min(...budgets.map((b) => +b.startDate))),
            },
          },
          select: {
            amount: true,
            categoryId: true,
          },
        });

        for (const budget of budgets) {
          const spent = transactions
            .filter((t) => budget.categoryId.includes(t.categoryId))
            .reduce((sum, t) => sum + t.amount, 0);

          if (spent > budget.limit) {
            alertsToCreate.push({
              userId,
              type: "budget_exceeded",
              severity: "critical",
              title: "Budget Exceeded",
              message: `One of your budgets has been exceeded`,
            });
          }
        }
      }

      /* ---------------- Low Account Balance ---------------- */
      const accounts = await prisma.account.findMany({
        where: { userId, balance: { lt: 0 } },
        select: { name: true },
      });

      for (const acc of accounts) {
        alertsToCreate.push({
          userId,
          type: "low_balance",
          severity: "critical",
          title: "Negative Balance",
          message: `${acc.name} has a negative balance`,
        });
      }

      /* ---------------- Goals Completed ---------------- */
      const goals = await prisma.goal.findMany({
        where: { userId },
        select: {
          name: true,
          targetAmount: true,
          currentAmount: true,
        },
      });

      for (const goal of goals) {
        if (goal.currentAmount >= goal.targetAmount) {
          alertsToCreate.push({
            userId,
            type: "goal_completed",
            severity: "info",
            title: "Goal Completed 🎉",
            message: `You completed the goal: ${goal.name}`,
          });
        }
      }

      /* ---------------- Save Alerts ---------------- */
      if (alertsToCreate.length) {
        await prisma.alert.createMany({
          data: alertsToCreate,
        });
      }

      res.json({
        success: true,
        created: alertsToCreate.length,
      });
    } catch (err) {
      console.error("Alert checks failed:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Alert checks failed" });
      }
    }
  },

  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.sub;

      const count = await prisma.alert.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return res.json({
        success: true,
        count,
      });
    } catch (error) {
      console.error("Unread alerts error:", error);

      if (res.headersSent) return;

      return res.status(500).json({
        success: false,
        message: "Failed to fetch unread alerts",
      });
    }
  },
};
