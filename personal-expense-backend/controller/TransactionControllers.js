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

const chunkText = (text, maxCharacters = 12000) => {
  const chunks = [];

  for (let i = 0; i < text.length; i += maxCharacters) {
    chunks.push(text.slice(i, i + maxCharacters));
  }

  return chunks;
};

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
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }

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
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }

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
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }
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
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }
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
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }
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
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }
      const { accountId, fileType, pdfPassword } = req.body;
      const file = req.file;

      /* =========================
         VALIDATION
      ========================= */

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

      if (!["csv", "pdf"].includes(fileType)) {
        return res.status(400).json({
          success: false,
          error: "Unsupported file type",
        });
      }

      /* =========================
         GET USER CATEGORIES
      ========================= */

      const categories = await prisma.category.findMany({
        where: {
          userId: req.user.sub,
        },
        select: {
          id: true,
          name: true,
          type: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      /* =========================
         EXTRACT FILE CONTENT
      ========================= */

      let text = "";

      if (fileType === "csv") {
        text = file.buffer.toString("utf-8");
      }

      if (fileType === "pdf") {
        try {
          const options = {};

          if (pdfPassword) {
            options.password = pdfPassword;
          }

          const data = await pdf(file.buffer, options);

          text = data.text;
        } catch (error) {
          console.error("PDF extraction error:", error);

          /*
           * Password protected PDF
           */
          if (
            error?.code === 1 ||
            error?.message?.includes("No password given")
          ) {
            return res.status(400).json({
              success: false,
              error: "PDF_PASSWORD_REQUIRED",
              message: "This PDF is password protected. Please enter the correct password.",
            });
          }

          /*
           * Wrong password
           */
          if (
            error?.message?.toLowerCase()?.includes("incorrect password") ||
            error?.message?.toLowerCase()?.includes("password")
          ) {
            return res.status(400).json({
              success: false,
              error: "INVALID_PDF_PASSWORD",
              message: "The PDF password is incorrect.",
            });
          }

          return res.status(400).json({
            success: false,
            error: "Unable to read the PDF statement.",
          });
        }
      }

      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          error: "Could not extract any text from the file.",
        });
      }

      /* =========================
         CHUNK DOCUMENT
      ========================= */

      const chunks = chunkText(text, 12000);

      const allRows = [];

      /*
       * Only send the category information
       * needed by the AI.
       */
      const categoryList = categories.map((category) => ({
        id: category.id,
        name: category.name,
        type: category.type,
      }));

      /* =========================
         AI EXTRACTION
      ========================= */

      for (let i = 0; i < chunks.length; i++) {
        console.log(
          `AI processing import chunk ${i + 1}/${chunks.length}`
        );

        const response = await openai.responses.create({
          model: "gpt-5-mini",

          input: [
            {
              role: "system",
              content: `
You are AureX Finance's financial statement transaction extraction engine.

Your job is to extract genuine financial transactions from the supplied bank statement section.

Return ONLY valid JSON.

EXPECTED FORMAT:

{
  "rows": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": 0,
      "type": "income",
      "categoryId": "category-id-or-null",
      "categoryConfidence": "high"
    }
  ]
}

TRANSACTION RULES:

1. Extract ONLY genuine financial transactions.
2. Do NOT extract opening balances.
3. Do NOT extract closing balances.
4. Do NOT extract statement totals.
5. Do NOT extract subtotals.
6. Do NOT invent transactions.
7. Preserve descriptions as accurately as possible.
8. Use the actual transaction date.
9. Date MUST be YYYY-MM-DD.
10. Amount MUST be a positive number.
11. Withdrawals, debits, purchases and payments are "expense".
12. Deposits, credits, salary and received money are "income".
13. If a line is not clearly a transaction, exclude it.
14. Do not ask the user questions.

CATEGORY MATCHING:

The user's existing AureX categories are provided below.

${JSON.stringify(categoryList)}

For each transaction:

- Try to match it to ONE existing category.
- categoryId MUST be the ID of an existing category.
- Never invent a category ID.
- Only assign a category when the match is reasonably confident.
- If there is no reasonable match, use:
  "categoryId": null
  "categoryConfidence": "none"

The category type must correspond to the transaction type.

For example:

Income transaction:
- Salary
- Freelance Income
- Business Income

Expense transaction:
- Food
- Transport
- Rent
- Utilities

If uncertain, leave categoryId as null.

IMPORTANT:

Return JSON only.

Do not use markdown.
Do not use code fences.
Do not explain your answer.
Do not ask questions.
            `,
            },
            {
              role: "user",
              content: chunks[i],
            },
          ],
        });

        /* =========================
           PARSE AI RESPONSE
        ========================= */

        try {
          const result = JSON.parse(response.output_text);

          if (!result || !Array.isArray(result.rows)) {
            console.error(
              `AI returned invalid rows for chunk ${i + 1}`
            );

            continue;
          }

          for (const row of result.rows) {
            /*
             * Basic server-side validation.
             */

            if (!row.date) continue;
            if (!row.description) continue;
            if (typeof row.amount !== "number") continue;

            if (
              row.type !== "income" &&
              row.type !== "expense"
            ) {
              continue;
            }

            /*
             * Validate category ID against user's
             * actual categories.
             */

            let categoryId = null;

            if (row.categoryId) {
              const category = categories.find(
                (c) =>
                  c.id === row.categoryId &&
                  c.type === row.type
              );

              if (category) {
                categoryId = category.id;
              }
            }

            allRows.push({
              date: row.date,
              description: row.description,
              amount: Math.abs(row.amount),
              type: row.type,
              categoryId,
              categoryConfidence:
                categoryId
                  ? row.categoryConfidence || "high"
                  : "none",
            });
          }
        } catch (parseError) {
          console.error(
            `Failed to parse AI response for chunk ${i + 1}:`,
            response.output_text
          );
        }
      }

      /* =========================
         REMOVE DUPLICATES
         ========================= */

      const uniqueRows = [];
      const seen = new Set();

      for (const row of allRows) {
        const key = [
          row.date,
          row.description.trim().toLowerCase(),
          row.amount,
          row.type,
        ].join("|");

        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        uniqueRows.push(row);
      }

      /* =========================
         RESPONSE
      ========================= */

      return res.json({
        success: true,
        data: {
          rows: uniqueRows,
          accountId,
          totalRows: uniqueRows.length,
          categorizedRows: uniqueRows.filter(
            (row) => row.categoryId
          ).length,
          uncategorizedRows: uniqueRows.filter(
            (row) => !row.categoryId
          ).length,
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
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }
      const {
        rows,
        accountId,
      } = req.body;

      /* =========================
         VALIDATION
      ========================= */

      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: "Account is required",
        });
      }

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No transactions to import",
        });
      }

      const userId = req.user.sub;

      /* =========================
         GET USER CATEGORIES
      ========================= */

      const categories = await prisma.category.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          name: true,
          type: true,
        },
      });

      /* =========================
         VALIDATE CATEGORIES
      ========================= */

      const categoryMap = new Map(
        categories.map((category) => [
          category.id,
          category,
        ])
      );

      let imported = 0;
      let skipped = 0;
      let duplicates = 0;
      let uncategorized = 0;

      /* =========================
         IMPORT TRANSACTIONS
      ========================= */

      for (const row of rows) {
        if (
          !row.date ||
          !row.description ||
          typeof row.amount !== "number" ||
          !["income", "expense"].includes(row.type)
        ) {
          skipped++;
          continue;
        }

        /*
         * Category selected by the user
         * during preview.
         */

        let categoryId = row.categoryId || null;

        /*
         * Make sure the category actually
         * belongs to this user.
         */

        if (categoryId) {
          const category = categoryMap.get(categoryId);

          if (!category || category.type !== row.type) {
            categoryId = null;
          }
        }

        /*
         * If no category was selected,
         * try the existing category matcher.
         */

        if (!categoryId) {
          categoryId = matchCategory(
            row.description,
            categories.filter(
              (category) => category.type === row.type
            )
          );
        }

        /*
         * If still no category exists,
         * do not create a fake category.
         */

        if (!categoryId) {
          uncategorized++;
        }

        /* =========================
           DUPLICATE DETECTION
        ========================= */

        const transactionDate = new Date(row.date);

        const startOfDay = new Date(transactionDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(transactionDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existing = await prisma.transaction.findFirst({
          where: {
            userId,
            accountId,
            amount: row.amount,
            type: row.type,
            description: row.description,
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

        if (existing) {
          duplicates++;
          continue;
        }

        /* =========================
           CREATE TRANSACTION
        ========================= */

        await prisma.transaction.create({
          data: {
            userId,
            accountId,
            categoryId,
            description: row.description.trim(),
            amount: Math.abs(row.amount),
            type: row.type,
            date: transactionDate,
          },
        });

        imported++;
      }

      /* =========================
         RESPONSE
      ========================= */

      return res.json({
        success: true,
        data: {
          imported,
          skipped,
          duplicates,
          uncategorized,
          total: rows.length,
        },
      });
    } catch (err) {
      console.error("Confirm import error:", err);

      return res.status(500).json({
        success: false,
        error: "Import failed",
      });
    }
  },
};
