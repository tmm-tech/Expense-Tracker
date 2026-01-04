const { prisma } = require("../src/lib/prism");

/**
 * NOTE:
 * req.user.id is assumed to be set by auth middleware
 */

module.exports = {
  /* ===========================
     CREATE TRANSACTION
  ============================ */
  createTransaction: async (req, res) => {
    try {
      const { name, category, amount, date } = req.body;

      const transaction = await prisma.transaction.create({
        data: {
          userId: req.user.id,
          name,
          category,
          amount: Number(amount),
          date: new Date(date),
        },
      });

      res.json({
        success: true,
        message: "Transaction created successfully",
        data: transaction,
      });
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({
        success: false,
        message: `Create Transaction Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     GET TRANSACTIONS (FILTERED)
     Query params:
     - page
     - limit
     - category
     - type (income | expense)
     - from / to (date range)
  ============================ */
  getTransactions: async (req, res) => {
    try {
      const { page = 1, limit = 20, category, type, from, to } = req.query;

      const where = {
        userId: req.user.id,
      };
      const userId = req.user.sub;
      if (category) where.category = category;

      if (type === "income") where.amount = { gt: 0 };
      if (type === "expense") where.amount = { lt: 0 };

      if (from || to) {
        where.date = {};
        if (from) where.date.gte = new Date(from);
        if (to) where.date.lte = new Date(to);
      }

      const transactions = await prisma.transaction.findMany({
          where,
          orderBy: { date: "desc" },
          skip: (page - 1) * limit,
          take: Number(limit),
        });
      const transactionCount = await prisma.transaction.count({
        where: { userId },
      });

      if (transactionCount === 0) {
        return res.json({ success: true, message: "No transactions to check" });
      }

      res.json({
        success: true,
        data: transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: transactionCount,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({
        success: false,
        message: `Get Transactions Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     GET SINGLE TRANSACTION
  ============================ */
  getTransactionById: async (req, res) => {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!transaction) {
        return res.json({ success: false, message: "Transaction not found" });
      }

      res.json({ success: true, data: transaction });
    } catch (error) {
      console.error("Get transaction error:", error);
      res.status(500).json({
        success: false,
        message: `Get Transaction Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     UPDATE TRANSACTION
  ============================ */
  updateTransaction: async (req, res) => {
    try {
      const { name, category, amount, date } = req.body;

      const updated = await prisma.transaction.updateMany({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        data: {
          name,
          category,
          amount: amount !== undefined ? Number(amount) : undefined,
          date: date ? new Date(date) : undefined,
        },
      });

      if (!updated.count) {
        return res
          .status(404)
          .json({ success: false, message: "Transaction not found" });
      }

      res.json({
        success: true,
        message: "Transaction updated successfully",
      });
    } catch (error) {
      console.error("Update transaction error:", error);
      res.status(500).json({
        success: false,
        message: `Update Transaction Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     DELETE TRANSACTION
  ============================ */
  deleteTransaction: async (req, res) => {
    try {
      const deleted = await prisma.transaction.deleteMany({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!deleted.count) {
        return res
          .status(404)
          .json({ success: false, message: "Transaction not found" });
      }

      res.json({
        success: true,
        message: "Transaction deleted successfully",
      });
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({
        success: false,
        message: `Delete Transaction Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     TRANSACTION SUMMARY (REPORTS)
  ============================ */
  getTransactionSummary: async (req, res) => {
    try {
      const summary = await prisma.transaction.groupBy({
        by: ["category"],
        where: { userId: req.user.id },
        _sum: { amount: true },
      });

      res.json({ success: true, data: summary });
    } catch (error) {
      console.error("Transaction summary error:", error);
      res.status(500).json({
        success: false,
        message: `Transaction Summary Error: ${error.message}`,
      });
    }
  },
};