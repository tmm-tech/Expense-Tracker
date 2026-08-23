const { prisma } = require("../src/lib/prism");
const { matchCategory } = require("../utils/categoryMatcher");
const pdf = require("pdf-parse");
const { parseCSV } = require("../utils/csvParser");
const { parseEquityPDF } = require("../utils/pdfParser");

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
        return res.json([]);
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
  importStatement: async (req, res) => {
    try {
      const { accountId, fileType, defaultCategoryId } = req.body;

      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let rows = [];

      /* CSV */
      if (fileType === "csv") {
        const text = file.buffer.toString();
        rows = parseCSV(text);
      }

      /* PDF */
      if (fileType === "pdf") {
        const data = await pdf(file.buffer);
        rows = parseEquityPDF(data.text);
      }

      /* categories */
      const categories = await prisma.category.findMany({
        where: { userId: req.user.sub },
      });

      let imported = 0;
      const errors = [];

      for (const row of rows) {
        try {
          const categoryId =
            defaultCategoryId ||
            matchCategory(row.description, categories);

          /* duplicate detection */
          const exists = await prisma.transaction.findFirst({
            where: {
              userId: req.user.sub,
              accountId,
              amount: row.amount,
              date: new Date(row.date),
              description: row.description,
            },
          });

          if (exists) continue;

          await prisma.transaction.create({
            data: {
              userId: req.user.sub,
              accountId,
              categoryId,
              description: row.description,
              amount: row.amount,
              type: row.type,
              date: new Date(row.date),
            },
          });

          imported++;
        } catch (err) {
          errors.push(row.description);
        }
      }

      res.json({
        imported,
        total: rows.length,
        errors,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Import failed",
      });
    }
  },
  previewImport: async (req, res) => {
    try {
      const { accountId, fileType } = req.body;

      const file = req.file;

      let rows = [];

      /* CSV */
      if (fileType === "csv") {
        const text = file.buffer.toString();
        rows = parseCSV(text);
      }

      /* PDF */
      if (fileType === "pdf") {
        const data = await pdf(file.buffer);
        rows = parseEquityPDF(data.text);
      }

      res.json({
        rows,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Preview failed",
      });
    }
  },

  /* ============================
     CONFIRM IMPORT
  ============================ */

  confirmImport: async (req, res) => {
    try {
      const { rows, accountId, defaultCategoryId } = req.body;

      const categories = await prisma.category.findMany({
        where: { userId: req.user.sub },
      });

      let imported = 0;

      for (const row of rows) {
        const categoryId =
          defaultCategoryId ||
          matchCategory(row.description, categories);

        /* duplicate detection */
        const exists = await prisma.transaction.findFirst({
          where: {
            userId: req.user.sub,
            accountId,
            amount: row.amount,
            description: row.description,
            date: new Date(row.date),
          },
        });

        if (exists) continue;

        await prisma.transaction.create({
          data: {
            userId: req.user.sub,
            accountId,
            categoryId,
            description: row.description,
            amount: row.amount,
            type: row.type,
            date: new Date(row.date),
          },
        });

        imported++;
      }

      res.json({
        imported,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Import failed",
      });
    }
  },
};
