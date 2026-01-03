const { prisma } = require("../src/lib/prism");

module.exports = {
  /**
   * GET /api/savings-challenges
   * Fetch all savings challenges for the logged-in user
   */
  getChallenges: async (req, res) => {
    try {
      const userId = req.user.id;

      const challenges = await prisma.Savings.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return res.json({
        success: true,
        data: challenges,
      });
    } catch (error) {
      console.error("Get savings challenges error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch savings challenges",
      });
    }
  },

  /**
   * GET /api/savings-challenges/summary
   * Returns aggregated summary for savings challenges
   */
  getSummary: async (req, res) => {
    try {
      const userId = req.user.id;

      const challenges = await prisma.Savings.findMany({
        where: { userId },
        select: {
          targetAmount: true,
          currentAmount: true,
          isCompleted: true,
        },
      });

      // ✅ Handle no data (important for your frontend)
      if (challenges.length === 0) {
        return res.json({
          success: true,
          summary: {
            totalChallenges: 0,
            completedChallenges: 0,
            totalTargetAmount: 0,
            totalSavedAmount: 0,
          },
        });
      }

      const summary = challenges.reduce(
        (acc, c) => {
          acc.totalChallenges += 1;
          acc.totalTargetAmount += Number(c.targetAmount || 0);
          acc.totalSavedAmount += Number(c.currentAmount || 0);
          if (c.isCompleted) acc.completedChallenges += 1;
          return acc;
        },
        {
          totalChallenges: 0,
          completedChallenges: 0,
          totalTargetAmount: 0,
          totalSavedAmount: 0,
        }
      );

      return res.json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error("Savings challenges summary error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch savings challenges summary",
      });
    }
  },
};
