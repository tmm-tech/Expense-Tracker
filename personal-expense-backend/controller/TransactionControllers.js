const { prisma } = require("../src/lib/prism");
const { matchCategory } = require("../utils/categoryMatcher");
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
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }

      const { accountId, categoryId, amount, date, description, type } =
        req.body;

      if (!accountId || !categoryId || !amount || !date || !type) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const transaction = await prisma.transaction.create({
        data: {
          userId,
          accountId,
          categoryId, // ✅ use categoryId, not category
          amount: Number(amount),
          date: new Date(date),
          type, // should be "income" or "expense"
          description: description || null,
        },
      });
      // Update account balance
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: type === "income" ? Number(amount) : -Number(amount),
          },
        },
      });

      return res.json({
        success: true,
        message: "Transaction created successfully",
        data: transaction,
      });
    } catch (error) {
      console.error("Create transaction error:", error);
      return res.status(500).json({
        success: false,
        message: "Create Transaction Error: Something went wrong",
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
      const userId = req.user.sub;
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: missing user ID" });
      }
      const { page = 1, limit = 20, category, type, from, to } = req.query;

      const where = {
        userId: req.user.id,
      };

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
          totalPages: Math.ceil(transactionCount / limit),
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
  importTransactions: async (req, res) => {
    try {
      const { csvContent, accountId, defaultCategoryId } =
        req.body;

      const rows = csvContent.split("\n");
      const header = rows[0].split(",");

      const data = rows.slice(1);

      const categories = await prisma.category.findMany({
        where: { userId: req.user.sub },
      });

      let imported = 0;
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const cols = data[i].split(",");

          const description = cols[0];
          const date = new Date(cols[1]);
          const credit = parseFloat(cols[2]) || 0;
          const debit = parseFloat(cols[3]) || 0;

          const amount = credit > 0 ? credit : debit;
          const type = credit > 0 ? "income" : "expense";

          const categoryId =
            defaultCategoryId ||
            matchCategory(description, categories);

          await prisma.transaction.create({
            data: {
              userId: req.user.sub,
              accountId,
              categoryId,
              description,
              amount,
              type,
              date,
            },
          });

          imported++;
        } catch (err) {
          errors.push(`Row ${i + 1} failed`);
        }
      }

      res.json({
        imported,
        total: data.length,
        errors,
      });
    } catch (err) {
      res.status(500).json({
        error: "Import failed",
      });
    }
  },
};
