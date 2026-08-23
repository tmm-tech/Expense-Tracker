const { prisma } = require("../src/lib/prism");
const { matchCategory } = require("../utils/categoryMatcher");
const pdf = require("pdf-parse");
const { parseCSV } = require("../utils/csvParser");
const { parseEquityPDF } = require("../utils/pdfParser");
const { openai } = require("../src/lib/openai.js");

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

      if (!file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: "Account is required",
        });
      }

      let text = "";

      /* =========================
         EXTRACT FILE CONTENT
      ========================= */

      if (fileType === "csv") {
        text = file.buffer.toString("utf-8");
      } else if (fileType === "pdf") {
        const data = await pdf(file.buffer);
        text = data.text;
      } else {
        return res.status(400).json({
          success: false,
          error: "Unsupported file type",
        });
      }

      if (!text.trim()) {
        return res.status(400).json({
          success: false,
          error: "Could not extract any text from the file",
        });
      }

      /* =========================
         AI TRANSACTION EXTRACTION
      ========================= */

      const response = await openai.responses.create({
        model: "gpt-5-mini",
        input: [
          {
            role: "system",
            content: `
You are AureX Finance's financial statement transaction extraction engine.

Extract ONLY genuine financial transactions from the supplied statement.

For every transaction return:

- date
- description
- amount
- type

Rules:

1. type MUST be either "income" or "expense".
2. amount MUST always be a positive number.
3. Withdrawals, debits, purchases and payments are "expense".
4. Deposits, credits, salary and received money are "income".
5. Use the actual transaction date.
6. Do not include opening balance.
7. Do not include closing balance.
8. Do not include statement totals.
9. Do not include subtotals.
10. Do not invent transactions.
11. Preserve the transaction description as accurately as possible.
12. If a row cannot confidently be interpreted as a transaction, exclude it.
13. Return dates in YYYY-MM-DD format.

Return ONLY valid JSON in exactly this structure:

{
  "rows": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": 0,
      "type": "income"
    }
  ]
}
          `,
          },
          {
            role: "user",
            content: text,
          },
        ],
      });

      /* =========================
         VALIDATE AI RESPONSE
      ========================= */

      let result;

      try {
        result = JSON.parse(response.output_text);
      } catch (parseError) {
        console.error("Failed to parse AI response:", response.output_text);

        return res.status(500).json({
          success: false,
          error: "AI returned an invalid response",
        });
      }

      if (!result || !Array.isArray(result.rows)) {
        return res.status(500).json({
          success: false,
          error: "AI did not return transaction rows",
        });
      }

      /* =========================
         RESPONSE
      ========================= */

      return res.json({
        success: true,
        data: {
          rows: result.rows,
          accountId,
        },
      });
    } catch (err) {
      console.error("AI import preview error:", err);

      return res.status(500).json({
        success: false,
        error: "AI import preview failed",
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
