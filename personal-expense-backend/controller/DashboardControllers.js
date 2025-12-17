const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const explainChanges = require("../services/ExplainChangesService");
/**
 * Assumes auth middleware sets req.user.id
 */

module.exports = {
  /* ===========================
     GET DASHBOARD LAYOUT
  ============================ */
  getLayout: async (req, res) => {
    try {
      const layout = await prisma.dashboardLayout.findUnique({
        where: { userId: req.user.id },
      });

      res.json({
        success: true,
        data: layout ? layout.layout : [],
      });
    } catch (error) {
      console.error("Get dashboard layout error:", error);
      res.status(500).json({
        success: false,
        message: `Get Layout Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     SAVE DASHBOARD LAYOUT
  ============================ */
  saveLayout: async (req, res) => {
    try {
      const { layout } = req.body;

      const saved = await prisma.dashboardLayout.upsert({
        where: { userId: req.user.id },
        update: { layout },
        create: {
          userId: req.user.id,
          layout,
        },
      });

      res.json({
        success: true,
        message: "Dashboard layout saved",
        data: saved.layout,
      });
    } catch (error) {
      console.error("Save dashboard layout error:", error);
      res.status(500).json({
        success: false,
        message: `Save Layout Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     DASHBOARD SUMMARY (KPIs)
     Used by widgets
  ============================ */
  getSummary: async (req, res) => {
    try {
      const userId = req.user.id;

      const [transactions, investments, budgets] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
        }),
        prisma.investment.findMany({
          where: { userId },
        }),
        prisma.budget.findMany({
          where: { userId },
        }),
      ]);

      // KPIs
      const totalSpend = transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const totalIncome = transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const netWorth =
        investments.reduce((sum, i) => sum + i.quantity * i.buyPrice, 0) +
        totalIncome -
        totalSpend;

      const budgetUsage = budgets.map((b) => {
        const spent = transactions
          .filter(
            (t) =>
              t.category === b.category &&
              t.amount < 0 &&
              t.date.toISOString().startsWith(b.month)
          )
          .reduce((s, t) => s + Math.abs(t.amount), 0);

        return {
          category: b.category,
          limit: b.limit,
          spent,
          remaining: Math.max(0, b.limit - spent),
        };
      });

      res.json({
        success: true,
        data: {
          kpis: {
            totalSpend,
            totalIncome,
            netWorth,
          },
          budgetUsage,
        },
      });
    } catch (error) {
      console.error("Dashboard summary error:", error);
      res.status(500).json({
        success: false,
        message: `Dashboard Summary Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     DASHBOARD INSIGHTS
     (AI-ready placeholder)
  ============================ */
  getInsights: async (req, res) => {
    try {
        
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request body',
        });
      }

      const explanation = await explainChanges(req.body);
      res.json({ explanation });

    } catch (error) {
      console.error("Dashboard insights error:", error);
      res.status(500).json({
        success: false,
        message: `Insights Error: ${error.message}`,
      });
    }
  },
};
