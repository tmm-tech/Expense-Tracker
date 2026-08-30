const { prisma } = require("../src/lib/prism");
const { matchCategory } = require("../utils/categoryMatcher");
const pdf = require("pdf-parse");
const { parseCSV } = require("../utils/csvParser");
const parsePdf = require("../utils/pdfParser");
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

      const {
        accountId,
        categoryId,
        amount,
        date,
        description,
        type,
        source = "manual",
        importBatchId,
        transferId,
        transferAccountId,
        transferDirection,
      } = req.body;

      /* ===========================
         VALIDATION
      ============================ */

      if (!accountId || !amount || !date || !type) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      if (!["income", "expense", "transfer"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction type",
        });
      }

      const numericAmount = Number(amount);

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than zero",
        });
      }

      const transactionDate = new Date(date);

      if (Number.isNaN(transactionDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction date",
        });
      }

      /* ===========================
         ACCOUNT VALIDATION
      ============================ */

      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          userId,
        },
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: "Account not found",
        });
      }

      /* ===========================
         CATEGORY VALIDATION
         Category is optional.
      ============================ */

      if (categoryId) {
        const category = await prisma.category.findFirst({
          where: {
            id: categoryId,
            userId,
            type,
          },
        });

        if (!category) {
          return res.status(400).json({
            success: false,
            message: "Invalid category for this transaction type",
          });
        }
      }

      /* ===========================
         TRANSFER VALIDATION
      ============================ */

      if (type === "transfer") {
        if (!transferAccountId) {
          return res.status(400).json({
            success: false,
            message: "Transfer account is required",
          });
        }

        if (!["outgoing", "incoming"].includes(transferDirection)) {
          return res.status(400).json({
            success: false,
            message: "Invalid transfer direction",
          });
        }

        if (transferAccountId === accountId) {
          return res.status(400).json({
            success: false,
            message: "Transfer accounts must be different",
          });
        }

        const transferAccount = await prisma.account.findFirst({
          where: {
            id: transferAccountId,
            userId,
          },
        });

        if (!transferAccount) {
          return res.status(404).json({
            success: false,
            message: "Transfer account not found",
          });
        }
      }

      /* ===========================
         CREATE TRANSACTION
         + UPDATE BALANCE ATOMICALLY
      ============================ */

      const result = await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            userId,
            accountId,
            categoryId: categoryId || null,

            amount: numericAmount,
            date: transactionDate,
            type,

            description: description || null,

            source,
            importBatchId: importBatchId || null,

            transferId: transferId || null,
            transferAccountId: transferAccountId || null,
            transferDirection: transferDirection || null,
          },
        });

        /* ===========================
           NORMAL TRANSACTION
        ============================ */

        if (type === "income") {
          await tx.account.update({
            where: {
              id: accountId,
            },
            data: {
              balance: {
                increment: numericAmount,
              },
            },
          });
        }

        if (type === "expense") {
          await tx.account.update({
            where: {
              id: accountId,
            },
            data: {
              balance: {
                decrement: numericAmount,
              },
            },
          });
        }

        /* ===========================
           TRANSFER
        ============================ */

        if (type === "transfer") {
          if (transferDirection === "outgoing") {
            await tx.account.update({
              where: {
                id: accountId,
              },
              data: {
                balance: {
                  decrement: numericAmount,
                },
              },
            });
          }

          if (transferDirection === "incoming") {
            await tx.account.update({
              where: {
                id: accountId,
              },
              data: {
                balance: {
                  increment: numericAmount,
                },
              },
            });
          }
        }

        return transaction;
      });

      return res.status(201).json({
        success: true,
        message: "Transaction created successfully",
        data: result,
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
   CREATE TRANSFER
============================ */
  createTransfer: async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }

      const {
        fromAccountId,
        toAccountId,
        amount,
        date,
        description,
      } = req.body;

      // Validate required fields
      if (
        !fromAccountId ||
        !toAccountId ||
        !amount ||
        !date
      ) {
        return res.status(400).json({
          success: false,
          message: "From account, to account, amount and date are required",
        });
      }

      // Prevent transfer to the same account
      if (fromAccountId === toAccountId) {
        return res.status(400).json({
          success: false,
          message: "Cannot transfer money to the same account",
        });
      }

      const numericAmount = Number(amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Transfer amount must be greater than zero",
        });
      }

      const transferDate = new Date(date);

      if (Number.isNaN(transferDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid transfer date",
        });
      }

      /*
       * Make sure BOTH accounts belong to
       * the authenticated user.
       */
      const accounts = await prisma.account.findMany({
        where: {
          id: {
            in: [fromAccountId, toAccountId],
          },
          userId,
        },
      });

      if (accounts.length !== 2) {
        return res.status(404).json({
          success: false,
          message: "One or both accounts were not found",
        });
      }

      /*
       * Create the transfer and update both
       * account balances atomically.
       */
      const result = await prisma.$transaction(async (tx) => {
        const transfer = await tx.transfer.create({
          data: {
            userId,
            fromAccountId,
            toAccountId,
            amount: numericAmount,
            date: transferDate,
            description: description || null,
          },
        });

        /*
         * Transaction representing money leaving
         * the source account.
         */
        const outgoingTransaction =
          await tx.transaction.create({
            data: {
              userId,
              accountId: fromAccountId,
              categoryId: null,
              amount: numericAmount,
              date: transferDate,
              type: "transfer",
              description:
                description || "Transfer to another account",
              source: "manual",
              transferId: transfer.id,
              transferAccountId: toAccountId,
              transferDirection: "outgoing",
            },
          });

        /*
         * Transaction representing money entering
         * the destination account.
         */
        const incomingTransaction =
          await tx.transaction.create({
            data: {
              userId,
              accountId: toAccountId,
              categoryId: null,
              amount: numericAmount,
              date: transferDate,
              type: "transfer",
              description:
                description || "Transfer from another account",
              source: "manual",
              transferId: transfer.id,
              transferAccountId: fromAccountId,
              transferDirection: "incoming",
            },
          });

        /*
         * Decrease source account.
         */
        await tx.account.update({
          where: {
            id: fromAccountId,
          },
          data: {
            balance: {
              decrement: numericAmount,
            },
          },
        });

        /*
         * Increase destination account.
         */
        await tx.account.update({
          where: {
            id: toAccountId,
          },
          data: {
            balance: {
              increment: numericAmount,
            },
          },
        });

        return {
          transfer,
          outgoingTransaction,
          incomingTransaction,
        };
      });

      return res.status(201).json({
        success: true,
        message: "Transfer created successfully",
        data: result,
      });
    } catch (error) {
      console.error("Create transfer error:", error);

      return res.status(500).json({
        success: false,
        message: "Create Transfer Error: Something went wrong",
      });
    }
  },

  /* ===========================
     GET TRANSACTIONS
  ============================ */
  getTransactions: async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }

      const {
        page = 1,
        limit = 20,
        category,
        type,
        from,
        to,
      } = req.query;

      const pageNumber = Math.max(Number(page), 1);
      const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

      const where = {
        userId,
      };

      /* Category filter */

      if (category) {
        where.categoryId = category;
      }

      /* Type filter */

      if (
        type &&
        ["income", "expense", "transfer"].includes(type)
      ) {
        where.type = type;
      }

      /* Date filter */

      if (from || to) {
        where.date = {};

        if (from) {
          where.date.gte = new Date(from);
        }

        if (to) {
          where.date.lte = new Date(to);
        }
      }

      const [transactions, transactionCount] =
        await prisma.$transaction([
          prisma.transaction.findMany({
            where,
            include: {
              account: true,
              category: true,
            },
            orderBy: {
              date: "desc",
            },
            skip: (pageNumber - 1) * limitNumber,
            take: limitNumber,
          }),

          prisma.transaction.count({
            where,
          }),
        ]);

      return res.json({
        success: true,
        data: transactions,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: transactionCount,
          totalPages: Math.ceil(
            transactionCount / limitNumber
          ),
        },
      });
    } catch (error) {
      console.error("Get transactions error:", error);

      return res.status(500).json({
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
     TRANSACTION SUMMARY
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
        by: ["categoryId", "type"],
        where: {
          userId,
        },
        _sum: {
          amount: true,
        },
      });

      return res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error(
        "Transaction summary error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: `Transaction Summary Error: ${error.message}`,
      });
    }
  },

  /* ===========================
   PREVIEW IMPORT
============================ */
  previewImport: async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized: missing user ID",
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
         VERIFY ACCOUNT
      ========================= */


      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          userId,
        },
      });

      if (!account) {
        return res.status(403).json({
          success: false,
          error: "Invalid account",
        });
      }

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
        orderBy: {
          name: "asc",
        },
      });

      /* =========================
         GET USER ACCOUNTS
      ========================= */
      const accounts = await prisma.account.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          name: true,
          institution: true,
          accountNumber: true,
          type: true,
          currency: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      /* =========================
         EXTRACT FILE CONTENT
      ========================= */

      let text = "";

      /* CSV */

      if (fileType === "csv") {
        text = file.buffer.toString("utf-8");
      }

      /* PDF */

      if (fileType === "pdf") {
        try {
          const result = await parsePdf(
            file.buffer,
            pdfPassword
          );

          text = result.text;

          console.log("PDF extraction completed:", {
            pages: result.numpages,
            characters: text.length,
          });

        } catch (error) {
          console.error("PDF extraction error:", {
            message: error?.message,
            code: error?.code,
            name: error?.name,
          });

          const message =
            error?.message?.toLowerCase() || "";

          // Password required
          if (
            error?.code === 1 &&
            (
              message.includes("no password") ||
              message.includes("password")
            )
          ) {
            return res.status(400).json({
              success: false,
              error:
                "This PDF is password protected. Please enter the PDF password.",
              requiresPassword: true,
            });
          }

          // Incorrect password
          if (
            message.includes("incorrect password") ||
            message.includes("invalid password") ||
            message.includes("password is incorrect")
          ) {
            return res.status(400).json({
              success: false,
              error: "Incorrect PDF password.",
              requiresPassword: true,
            });
          }

          return res.status(400).json({
            success: false,
            error: "Unable to read the PDF statement.",
          });
        }
      }

      /* =========================
         TEXT VALIDATION
      ========================= */

      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          error:
            "Could not extract any text from the file.",
        });
      }

      /* =========================
         CHUNK DOCUMENT
      ========================= */

      const chunkText = (text, maxCharacters = 12000) => {
        const lines = text.split(/\r?\n/);
        const chunks = [];

        let current = "";

        for (const line of lines) {
          if (
            current.length + line.length + 1 >
            maxCharacters
          ) {
            if (current.trim()) {
              chunks.push(current);
            }

            current = line;
          } else {
            current += `${line}\n`;
          }
        }

        if (current.trim()) {
          chunks.push(current);
        }

        return chunks;
      };

      const chunks = chunkText(text, 12000);

      console.log(
        `AI import: processing ${chunks.length} chunks`
      );

      const allRows = [];
      const failedChunks = [];

      /* =========================
         CATEGORY LIST FOR AI
      ========================= */

      const categoryList = categories.map(
        (category) => ({
          id: category.id,
          name: category.name,
          type: category.type,
        })
      );
      /* =========================
         ACCOUNT LIST FOR AI
      ========================= */

      const accountList = accounts.map((account) => ({
        id: account.id,
        name: account.name,
        institution: account.institution,
        accountNumber: account.accountNumber,
        type: account.type,
        currency: account.currency,
      }));

      /* =========================
         AI EXTRACTION
      ========================= */

      for (let i = 0; i < chunks.length; i++) {
        console.log(
          `AI processing import chunk ${i + 1
          }/${chunks.length}`
        );

        try {
          const response =
            await openai.responses.create({
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
      "categoryId": "existing-category-id-or-null",
      "categoryConfidence": "high",
      "isTransfer": false,
      "transferAccountId": null,
      "transferConfidence": "none"
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
7. Preserve transaction descriptions accurately.
8. Use the actual transaction date.
9. Date MUST be YYYY-MM-DD.
10. Amount MUST be a positive number.
11. Withdrawals, debits, purchases and payments = expense.
12. Deposits, credits, salary and received money = income.
13. If a line cannot confidently be interpreted as a transaction, exclude it.
14. Never ask the user questions.

CATEGORY MATCHING:

The following are the user's EXISTING AureX categories:

${JSON.stringify(categoryList)}

For every transaction:

- Try to match the transaction to ONE existing category.
- categoryId MUST be an ID from the supplied category list.
- NEVER invent a category ID.
- The category type MUST match the transaction type.
- Only assign a category when reasonably confident.
- If no reasonable match exists, use null.

Allowed category confidence values:

"high"
"medium"
"low"
"none"

If categoryId is null:

"categoryConfidence": "none"

TRANSFER DETECTION:

Some transactions may represent transfers between the user's own AureX accounts.

Examples:
- Transfer to Savings
- Transfer from Checking
- M-PESA to Bank
- Bank to M-PESA
- Funds transferred to another account
- Internal account transfer

For every transaction, determine whether it appears to be a transfer.

If it is NOT a transfer:

"isTransfer": false
"transferAccountId": null
"transferConfidence": "none"

If it IS a transfer:

"isTransfer": true

Try to identify the other AureX account involved.

Only use an account ID from the supplied AureX account list.

If the other account cannot be confidently identified:

"transferAccountId": null

Allowed transfer confidence values:

"high"
"medium"
"low"
"none"

Never invent an account ID.

EXISTING AUREX ACCOUNTS:

${JSON.stringify(accountList)}

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

          const result = JSON.parse(
            response.output_text
          );

          if (
            !result ||
            !Array.isArray(result.rows)
          ) {
            console.error(
              `AI returned invalid rows for chunk ${i + 1
              }`
            );

            failedChunks.push(i + 1);

            continue;
          }

          /* =========================
             VALIDATE TRANSACTIONS
          ========================= */

          for (const row of result.rows) {
            if (!row.date) continue;

            if (!row.description) continue;

            if (
              typeof row.amount !== "number" ||
              !Number.isFinite(row.amount)
            ) {
              continue;
            }

            if (
              row.type !== "income" &&
              row.type !== "expense"
            ) {
              continue;
            }

            /* =========================
              VALIDATE TRANSFER
            ========================= */

            let isTransfer = false;
            let transferAccountId = null;
            let transferConfidence = "none";

            if (row.isTransfer === true) {
              isTransfer = true;

              if (
                row.transferAccountId &&
                accounts.some(
                  (account) =>
                    account.id === row.transferAccountId &&
                    account.id !== accountId
                )
              ) {
                transferAccountId = row.transferAccountId;
              }

              if (
                ["high", "medium", "low"].includes(
                  row.transferConfidence
                )
              ) {
                transferConfidence =
                  row.transferConfidence;
              } else {
                transferConfidence = "medium";
              }
            }


            /* =========================
               VALIDATE CATEGORY
            ========================= */

            let categoryId = null;

            if (row.categoryId) {
              const category =
                categories.find(
                  (category) =>
                    category.id ===
                    row.categoryId &&
                    category.type === row.type
                );

              if (category) {
                categoryId = category.id;
              }
            }

            /* =========================
               CATEGORY CONFIDENCE
            ========================= */

            let categoryConfidence =
              "none";

            if (categoryId) {
              if (
                ["high", "medium", "low"].includes(
                  row.categoryConfidence
                )
              ) {
                categoryConfidence =
                  row.categoryConfidence;
              } else {
                categoryConfidence =
                  "medium";
              }
            }

            /* =========================
               ADD ROW
            ========================= */

            allRows.push({
              date: row.date,

              description:
                row.description.trim(),

              amount: Math.abs(
                row.amount
              ),

              type: row.type,

              categoryId,

              categoryConfidence,

              isTransfer,

              transferAccountId,

              transferConfidence,

              needsCategoryReview:
                !categoryId ||
                categoryConfidence === "low" ||
                categoryConfidence === "none",

              needsTransferReview:
                isTransfer &&
                (
                  !transferAccountId ||
                  transferConfidence === "low" ||
                  transferConfidence === "none"
                ),
            });
          }
        } catch (error) {
          console.error(
            `Failed to process AI chunk ${i + 1
            }:`,
            error
          );

          failedChunks.push(i + 1);
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
          row.description
            .trim()
            .toLowerCase(),
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

          totalRows:
            uniqueRows.length,

          categorizedRows:
            uniqueRows.filter(
              (row) =>
                row.categoryId
            ).length,

          uncategorizedRows:
            uniqueRows.filter(
              (row) =>
                !row.categoryId
            ).length,

          failedChunks,
        },
      });
    } catch (err) {
      console.error(
        "AI import preview error:",
        err
      );

      return res.status(500).json({
        success: false,
        error:
          "AI import preview failed",
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
      const { rows, accountId } = req.body;


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

      /* =========================
         VERIFY ACCOUNT
      ========================= */

      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          userId,
        },
      });

      if (!account) {
        return res.status(403).json({
          success: false,
          error: "Invalid account",
        });
      }


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
        const transactionDate = new Date(row.date);

        if (
          !row.date ||
          !row.description ||
          typeof row.amount !== "number" ||
          !Number.isFinite(row.amount) ||
          row.amount <= 0 ||
          Number.isNaN(transactionDate.getTime()) ||
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
