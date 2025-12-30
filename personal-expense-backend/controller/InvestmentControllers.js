const { prisma } = require("../src/lib/prism");

/**
 * Assumes auth middleware sets req.user.id
 */

module.exports = {
  /* ===========================
     ADD INVESTMENT
  ============================ */
  createInvestment: async (req, res) => {
    try {
      const { symbol, name, quantity, buyPrice, type } = req.body;

      const investment = await prisma.investment.create({
        data: {
          userId: req.user.id,
          symbol,
          name,
          quantity: Number(quantity),
          buyPrice: Number(buyPrice),
          type, // stock | crypto | fund
        },
      });

      res.json({
        success: true,
        message: "Investment added successfully",
        data: investment,
      });
    } catch (error) {
      console.error("Create investment error:", error);
      res.status(500).json({
        success: false,
        message: `Create Investment Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     GET ALL INVESTMENTS
  ============================ */
  // GET /api/investments
  getInvestments: async (req, res) => {
    try {
      if (!req.user?.sub) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const userId = req.user.sub;

      // 1️⃣ Pagination
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const skip = (page - 1) * limit;

      // 2️⃣ Optional filter
      const { type } = req.query;

      const where = { userId };
      if (type) {
        where.type = type;
      }

      // 3️⃣ Fetch investments + total count
      const investments = await prisma.investment.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        });
      const investmentCount = await prisma.investment.count({
        where: { userId },
      });

      if (investmentCount === 0) {
        return res.json({ success: true, message: "No investments to check" });
      }

      // 4️⃣ Standard ApiResponse
      res.json({
        success: true,
        data: investments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get investments error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch investments",
      });
    }
  },

  /* ===========================
     GET SINGLE INVESTMENT
  ============================ */
  getInvestmentById: async (req, res) => {
    try {
      const investment = await prisma.investment.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!investment) {
        return res
          .status(404)
          .json({ success: false, message: "Investment not found" });
      }

      res.json({ success: true, data: investment });
    } catch (error) {
      console.error("Get investment error:", error);
      res.status(500).json({
        success: false,
        message: `Get Investment Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     UPDATE INVESTMENT
  ============================ */
  updateInvestment: async (req, res) => {
    try {
      const { quantity, buyPrice } = req.body;

      const updated = await prisma.investment.updateMany({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        data: {
          quantity: quantity !== undefined ? Number(quantity) : undefined,
          buyPrice: buyPrice !== undefined ? Number(buyPrice) : undefined,
        },
      });

      if (!updated.count) {
        return res
          .status(404)
          .json({ success: false, message: "Investment not found" });
      }

      res.json({
        success: true,
        message: "Investment updated successfully",
      });
    } catch (error) {
      console.error("Update investment error:", error);
      res.status(500).json({
        success: false,
        message: `Update Investment Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     DELETE INVESTMENT
  ============================ */
  deleteInvestment: async (req, res) => {
    try {
      const deleted = await prisma.investment.deleteMany({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!deleted.count) {
        return res
          .status(404)
          .json({ success: false, message: "Investment not found" });
      }

      res.json({
        success: true,
        message: "Investment removed successfully",
      });
    } catch (error) {
      console.error("Delete investment error:", error);
      res.status(500).json({
        success: false,
        message: `Delete Investment Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     PORTFOLIO SUMMARY
     (Dashboard + Reports)
  ============================ */
  getPortfolioSummary: async (req, res) => {
    try {
      const investments = await prisma.investment.findMany({
        where: { userId: req.user.id },
      });

      const totalInvested = investments.reduce(
        (sum, i) => sum + i.quantity * i.buyPrice,
        0
      );

      const byType = investments.reduce((acc, i) => {
        const value = i.quantity * i.buyPrice;
        acc[i.type] = (acc[i.type] || 0) + value;
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          totalInvested,
          allocation: byType,
          count: investments.length,
        },
      });
    } catch (error) {
      console.error("Portfolio summary error:", error);
      res.status(500).json({
        success: false,
        message: `Portfolio Summary Error: ${error.message}`,
      });
    }
  },
};
