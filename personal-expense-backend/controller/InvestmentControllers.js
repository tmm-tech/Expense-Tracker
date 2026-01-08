const { prisma } = require("../src/lib/prism");

/**
 * Assumes auth middleware sets req.user.sub
 */

module.exports = {
  /* ===========================
     CREATE INVESTMENT
     (Stocks, Crypto, Insurance)
  ============================ */
  createInvestment: async (req, res) => {
    try {
      const {
        type,
        name,
        symbol,
        quantity,
        purchasePrice,
        currentPrice,
        purchaseDate,

        // Insurance-only
        premium,
        sumAssured,
        maturityDate,
      } = req.body;

      if (!type || !name || purchasePrice == null || currentPrice == null) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const isInsurance = type === "Life Insurance";

      const investment = await prisma.investment.create({
        data: {
          userId: req.user.sub,
          type,
          name,

          // Tradable vs Insurance
          symbol: isInsurance ? null : symbol || null,
          quantity: isInsurance ? 1 : Number(quantity || 0),

          purchasePrice: Number(purchasePrice),
          currentPrice: Number(currentPrice),
          purchaseDate: purchaseDate
            ? new Date(purchaseDate)
            : new Date(),

          // Insurance-specific
          premium: isInsurance ? Number(premium || 0) : null,
          sumAssured: isInsurance ? Number(sumAssured || 0) : null,
          maturityDate:
            isInsurance && maturityDate
              ? new Date(maturityDate)
              : null,
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
        message: "Failed to create investment",
      });
    }
  },

  /* ===========================
     GET ALL INVESTMENTS
  ============================ */
  getInvestments: async (req, res) => {
    try {
      const userId = req.user.sub;

      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const skip = (page - 1) * limit;

      const { type } = req.query;

      const where = { userId };
      if (type) where.type = type;

      const [investments, total] = await Promise.all([
        prisma.investment.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.investment.count({ where }),
      ]);

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
          userId: req.user.sub,
        },
      });

      if (!investment) {
        return res.status(404).json({
          success: false,
          message: "Investment not found",
        });
      }

      res.json({ success: true, data: investment });
    } catch (error) {
      console.error("Get investment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch investment",
      });
    }
  },

  /* ===========================
     UPDATE INVESTMENT
  ============================ */
  updateInvestment: async (req, res) => {
    try {
      const {
        name,
        symbol,
        quantity,
        purchasePrice,
        currentPrice,
        purchaseDate,

        // Insurance
        premium,
        sumAssured,
        maturityDate,
      } = req.body;

      const existing = await prisma.investment.findFirst({
        where: { id: req.params.id, userId: req.user.sub },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Investment not found",
        });
      }

      const isInsurance = existing.type === "Life Insurance";

      const updated = await prisma.investment.update({
        where: { id: existing.id },
        data: {
          name: name ?? existing.name,
          symbol: isInsurance ? null : symbol ?? existing.symbol,
          quantity: isInsurance ? 1 : Number(quantity ?? existing.quantity),

          purchasePrice:
            purchasePrice != null
              ? Number(purchasePrice)
              : existing.purchasePrice,

          currentPrice:
            currentPrice != null
              ? Number(currentPrice)
              : existing.currentPrice,

          purchaseDate: purchaseDate
            ? new Date(purchaseDate)
            : existing.purchaseDate,

          premium: isInsurance
            ? Number(premium ?? existing.premium ?? 0)
            : null,

          sumAssured: isInsurance
            ? Number(sumAssured ?? existing.sumAssured ?? 0)
            : null,

          maturityDate:
            isInsurance && maturityDate
              ? new Date(maturityDate)
              : existing.maturityDate,
        },
      });

      res.json({
        success: true,
        message: "Investment updated successfully",
        data: updated,
      });
    } catch (error) {
      console.error("Update investment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update investment",
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
          userId: req.user.sub,
        },
      });

      if (!deleted.count) {
        return res.status(404).json({
          success: false,
          message: "Investment not found",
        });
      }

      res.json({
        success: true,
        message: "Investment deleted successfully",
      });
    } catch (error) {
      console.error("Delete investment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete investment",
      });
    }
  },

  /* ===========================
     PORTFOLIO SUMMARY
  ============================ */
  getPortfolioSummary: async (req, res) => {
    try {
      const investments = await prisma.investment.findMany({
        where: { userId: req.user.sub },
      });

      const summary = investments.reduce(
        (acc, inv) => {
          const value =
            inv.type === "Life Insurance"
              ? inv.currentPrice
              : inv.quantity * inv.currentPrice;

          acc.totalValue += value;
          acc.byType[inv.type] =
            (acc.byType[inv.type] || 0) + value;

          return acc;
        },
        { totalValue: 0, byType: {} }
      );

      res.json({
        success: true,
        data: {
          totalValue: summary.totalValue,
          allocation: summary.byType,
          count: investments.length,
        },
      });
    } catch (error) {
      console.error("Portfolio summary error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch portfolio summary",
      });
    }
  },
};