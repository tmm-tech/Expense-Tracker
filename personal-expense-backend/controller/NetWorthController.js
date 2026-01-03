const { prisma } = require("../src/lib/prism");

module.exports = {
  // controller/NetWorthController.js
  getTrend: async (req, res) => {
    try {
      const { period } = req.query;
      // Example: fetch trend data from DB
      const trend = await prisma.netWorth.findMany({
        where: { userId: req.user.id },
        orderBy: { date: "asc" },
      });
      res.json(trend);
    } catch (error) {
      console.error("Error fetching net worth trend:", error);
      res.status(500).json({ message: "Failed to fetch net worth trend" });
    }
  },

  getSnapshots: async (req, res) => {
    try {
      const snapshots = await prisma.netWorthSnapshot.findMany({
        where: { userId: req.user.id },
        orderBy: { date: "desc" },
      });
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching net worth snapshots:", error);
      res.status(500).json({ message: "Failed to fetch net worth snapshots" });
    }
  },
};
