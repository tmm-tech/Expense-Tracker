const { prisma } = require("../src/lib/prism");

module.exports = {
  // controller/NetWorthController.js
  getTrend: async (req, res) => {
    try {
      const { period } = req.query;
      const userId = req.user?.sub;

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: missing user ID" });
      }

      // Build date filter based on period (e.g., 6M, 1Y)
      let dateFilter = {};
      if (period) {
        const now = new Date();
        switch (period) {
          case "6M":
            dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 6)) };
            break;
          case "1Y":
            dateFilter = {
              gte: new Date(now.setFullYear(now.getFullYear() - 1)),
            };
            break;
          default:
            // If unsupported period, ignore filter
            dateFilter = {};
        }
      }

      const trend = await prisma.netWorth.findMany({
        where: {
          userId,
          ...(dateFilter.gte ? { date: dateFilter } : {}),
        },
        orderBy: { date: "asc" },
      });

      // Always return an array, even if empty
      return res.json(trend || []);
    } catch (error) {
      console.error("Error fetching net worth trend:", error);
      return res.status(500).json({
        message: "Failed to fetch net worth trend",
        error: error.message,
      });
    }
  },

  getSnapshots: async (req, res) => {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: missing user ID" });
      }
      const snapshots = await prisma.netWorthSnapshot.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      });
      // Always return an array, even if empty
      return res.json(snapshots || []);
    } catch (error) {
      console.error("Error fetching net worth snapshots:", error);
      return res.status(500).json({
        message: "Failed to fetch net worth snapshots",
        error: error.message,
      });
    }
  },
  getCurrent: async (req, res) => {
    try {
      const userId = req.user?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const snapshot = await prisma.netWorthSnapshot.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
      });
      if (!snapshot) {
        return res.json({
          netWorth: 0,
          totalAssets: 0,
          totalLiabilities: 0,
          breakdown: { cash: 0, investments: 0, debts: 0 },
        });
      }
      res.json({
        id: snapshot.id,
        timestamp: snapshot.date.getTime(),
        netWorth: snapshot.assets - snapshot.liabilities,
        totalAssets: snapshot.assets,
        totalLiabilities: snapshot.liabilities,
        notes: snapshot.notes ?? null,
        breakdown: {
          cash: snapshot.cash ?? 0,
          investments: snapshot.investments ?? 0,
          debts: snapshot.liabilities ?? 0,
        },
      });
    } catch (error) {
      console.error("Error fetching current net worth:", error);
      res.status(500).json({ message: "Failed to fetch current net worth" });
    }
  },
};
