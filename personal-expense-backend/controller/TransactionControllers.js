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
      UPDATE TRANSFER
   ============================ */

  updateTransfer: async (req, res) => {
    const userId = req.user?.id || req.user?.sub;

    try {
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { fromAccountId, toAccountId, amount, description, date } = req.body;
      const transferId = req.params.id;

      // ---------------- VALIDATION ----------------

      if (!fromAccountId || !toAccountId) {
        return res.status(400).json({
          success: false,
          message: "Source and destination accounts are required",
        });
      }

      if (fromAccountId === toAccountId) {
        return res.status(400).json({
          success: false,
          message: "Source and destination accounts must be different",
        });
      }

      const transferAmount = Number(amount);

      if (
        Number.isNaN(transferAmount) ||
        transferAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than zero",
        });
      }

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Date is required",
        });
      }

      // ---------------- ATOMIC UPDATE ----------------

      const result = await prisma.$transaction(async (tx) => {
        // Find the transfer belonging to this user
        const existingTransfer = await tx.transfer.findFirst({
          where: {
            id: transferId,
            userId,
          },
        });

        if (!existingTransfer) {
          throw new Error("Transfer not found");
        }

        // Verify both new accounts belong to the user
        const accounts = await tx.account.findMany({
          where: {
            id: {
              in: [fromAccountId, toAccountId],
            },
            userId,
          },
        });

        if (accounts.length !== 2) {
          throw new Error("One or both accounts were not found");
        }

        const fromAccount = accounts.find(
          (account) => account.id === fromAccountId
        );

        const toAccount = accounts.find(
          (account) => account.id === toAccountId
        );

        // Find the two transactions belonging to this transfer
        const transferTransactions = await tx.transaction.findMany({
          where: {
            transferId,
            userId,
          },
        });

        const outgoingTransaction = transferTransactions.find(
          (transaction) =>
            transaction.transferDirection === "outgoing"
        );

        const incomingTransaction = transferTransactions.find(
          (transaction) =>
            transaction.transferDirection === "incoming"
        );

        if (!outgoingTransaction || !incomingTransaction) {
          throw new Error(
            "Transfer transactions are incomplete"
          );
        }

        // ---------------- REVERSE OLD BALANCES ----------------

        // Old source account gets the old amount back
        await tx.account.update({
          where: {
            id: outgoingTransaction.accountId,
          },
          data: {
            balance: {
              increment: existingTransfer.amount,
            },
          },
        });

        // Old destination account loses the old amount
        await tx.account.update({
          where: {
            id: incomingTransaction.accountId,
          },
          data: {
            balance: {
              decrement: existingTransfer.amount,
            },
          },
        });

        // ---------------- APPLY NEW BALANCES ----------------

        await tx.account.update({
          where: {
            id: fromAccount.id,
          },
          data: {
            balance: {
              decrement: transferAmount,
            },
          },
        });

        await tx.account.update({
          where: {
            id: toAccount.id,
          },
          data: {
            balance: {
              increment: transferAmount,
            },
          },
        });

        // ---------------- UPDATE TRANSFER ----------------

        const updatedTransfer = await tx.transfer.update({
          where: {
            id: transferId,
          },
          data: {
            fromAccountId,
            toAccountId,
            amount: transferAmount,
            description: description?.trim() || null,
            date: new Date(date),
          },
        });

        // ---------------- UPDATE OUTGOING TRANSACTION ----------------

        const updatedOutgoingTransaction =
          await tx.transaction.update({
            where: {
              id: outgoingTransaction.id,
            },
            data: {
              accountId: fromAccountId,
              amount: transferAmount,
              description: description?.trim() || null,
              date: new Date(date),
              type: "transfer",
              categoryId: null,
              transferAccountId: toAccountId,
              transferDirection: "outgoing",
            },
          });

        // ---------------- UPDATE INCOMING TRANSACTION ----------------

        const updatedIncomingTransaction =
          await tx.transaction.update({
            where: {
              id: incomingTransaction.id,
            },
            data: {
              accountId: toAccountId,
              amount: transferAmount,
              description: description?.trim() || null,
              date: new Date(date),
              type: "transfer",
              categoryId: null,
              transferAccountId: fromAccountId,
              transferDirection: "incoming",
            },
          });

        return {
          transfer: updatedTransfer,
          outgoingTransaction: updatedOutgoingTransaction,
          incomingTransaction: updatedIncomingTransaction,
        };
      });

      return res.status(200).json({
        success: true,
        message: "Transfer updated successfully",
        data: result,
      });
    } catch (error) {
      console.error("Update transfer error:", error);

      if (error.message === "Transfer not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "One or both accounts were not found" ||
        error.message === "Transfer transactions are incomplete"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update transfer",
      });
    }
  },
  /* ===========================
     DELETE TRANSFER
  ============================ */
  
  deleteTransfer: async (req, res) => {
    const userId = req.user?.id || req.user?.sub;

    try {
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const transferId = req.params.id;

      const result = await prisma.$transaction(async (tx) => {
        // Find the transfer belonging to this user
        const existingTransfer = await tx.transfer.findFirst({
          where: {
            id: transferId,
            userId,
          },
        });

        if (!existingTransfer) {
          throw new Error("Transfer not found");
        }

        // Find both transactions belonging to the transfer
        const transferTransactions = await tx.transaction.findMany({
          where: {
            transferId,
            userId,
          },
        });

        const outgoingTransaction = transferTransactions.find(
          (transaction) =>
            transaction.transferDirection === "outgoing"
        );

        const incomingTransaction = transferTransactions.find(
          (transaction) =>
            transaction.transferDirection === "incoming"
        );

        if (!outgoingTransaction || !incomingTransaction) {
          throw new Error(
            "Transfer transactions are incomplete"
          );
        }

        // Reverse the original transfer balances
        await tx.account.update({
          where: {
            id: outgoingTransaction.accountId,
          },
          data: {
            balance: {
              increment: existingTransfer.amount,
            },
          },
        });

        await tx.account.update({
          where: {
            id: incomingTransaction.accountId,
          },
          data: {
            balance: {
              decrement: existingTransfer.amount,
            },
          },
        });

        // Delete the two transaction records
        await tx.transaction.deleteMany({
          where: {
            transferId,
            userId,
          },
        });

        // Delete the transfer record
        const deletedTransfer = await tx.transfer.delete({
          where: {
            id: transferId,
          },
        });

        return deletedTransfer;
      });

      return res.status(200).json({
        success: true,
        message: "Transfer deleted successfully",
        data: result,
      });
    } catch (error) {
      console.error("Delete transfer error:", error);

      if (error.message === "Transfer not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "Transfer transactions are incomplete"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete transfer",
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

      const transactionId = req.params.id;

      const {
        type,
        categoryId,
        amount,
        description,
        date,
        accountId,
      } = req.body;

      // Transfers must be handled by a dedicated transfer update endpoint
      if (type === "transfer") {
        return res.status(400).json({
          success: false,
          message: "Transfers must be edited using the transfer endpoint",
        });
      }

      // Validate transaction type
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Transaction type must be income or expense",
        });
      }

      // Validate amount
      const amountNum = Number(amount);

      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a positive number",
        });
      }

      // Validate description
      if (!description || !String(description).trim()) {
        return res.status(400).json({
          success: false,
          message: "Description is required",
        });
      }

      // Validate date
      const transactionDate = new Date(date);

      if (Number.isNaN(transactionDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction date",
        });
      }

      // Validate account
      if (!accountId) {
        return res.status(400).json({
          success: false,
          message: "Account is required",
        });
      }

      const updatedTransaction = await prisma.$transaction(async (tx) => {
        // Get the existing transaction
        const existing = await tx.transaction.findFirst({
          where: {
            id: transactionId,
            userId,
          },
        });

        if (!existing) {
          throw new Error("TRANSACTION_NOT_FOUND");
        }

        // Never allow a transfer to be modified through this endpoint
        if (existing.type === "transfer") {
          throw new Error("TRANSFER_UPDATE_NOT_ALLOWED");
        }

        // Verify new account belongs to the user
        const newAccount = await tx.account.findFirst({
          where: {
            id: accountId,
            userId,
          },
        });

        if (!newAccount) {
          throw new Error("ACCOUNT_NOT_FOUND");
        }

        // Validate category if provided
        if (categoryId) {
          const category = await tx.category.findFirst({
            where: {
              id: categoryId,
              userId,
            },
          });

          if (!category) {
            throw new Error("CATEGORY_NOT_FOUND");
          }

          if (category.type !== type) {
            throw new Error("CATEGORY_TYPE_MISMATCH");
          }
        }

        // Get old account
        const oldAccount = await tx.account.findFirst({
          where: {
            id: existing.accountId,
            userId,
          },
        });

        if (!oldAccount) {
          throw new Error("OLD_ACCOUNT_NOT_FOUND");
        }

        /*
         * Reverse the old transaction's effect.
         *
         * Income previously increased the account.
         * Expense previously decreased the account.
         */
        const oldBalanceAdjustment =
          existing.type === "income"
            ? -Number(existing.amount)
            : Number(existing.amount);

        await tx.account.update({
          where: {
            id: oldAccount.id,
          },
          data: {
            balance: {
              increment: oldBalanceAdjustment,
            },
          },
        });

        /*
         * Apply the new transaction's effect.
         *
         * Income increases the account.
         * Expense decreases the account.
         */
        const newBalanceAdjustment =
          type === "income"
            ? amountNum
            : -amountNum;

        await tx.account.update({
          where: {
            id: newAccount.id,
          },
          data: {
            balance: {
              increment: newBalanceAdjustment,
            },
          },
        });

        // Update the transaction
        return await tx.transaction.update({
          where: {
            id: transactionId,
          },
          data: {
            type,
            categoryId: categoryId || null,
            amount: amountNum,
            description: String(description).trim(),
            date: transactionDate,
            accountId,
          },
        });
      });

      return res.json({
        success: true,
        message: "Transaction updated successfully",
        data: updatedTransaction,
      });
    } catch (error) {
      console.error("Update transaction error:", error);

      if (error.message === "TRANSACTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      if (error.message === "TRANSFER_UPDATE_NOT_ALLOWED") {
        return res.status(400).json({
          success: false,
          message: "Transfers must be edited using the transfer endpoint",
        });
      }

      if (error.message === "ACCOUNT_NOT_FOUND") {
        return res.status(400).json({
          success: false,
          message: "Selected account not found",
        });
      }

      if (error.message === "OLD_ACCOUNT_NOT_FOUND") {
        return res.status(500).json({
          success: false,
          message: "Original transaction account not found",
        });
      }

      if (error.message === "CATEGORY_NOT_FOUND") {
        return res.status(400).json({
          success: false,
          message: "Selected category not found",
        });
      }

      if (error.message === "CATEGORY_TYPE_MISMATCH") {
        return res.status(400).json({
          success: false,
          message: "Category does not match transaction type",
        });
      }

      return res.status(500).json({
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

      const transactionId = req.params.id;

      const deletedTransaction = await prisma.$transaction(async (tx) => {
        // Find the transaction and verify ownership
        const existing = await tx.transaction.findFirst({
          where: {
            id: transactionId,
            userId,
          },
        });

        if (!existing) {
          throw new Error("TRANSACTION_NOT_FOUND");
        }

        // Transfers must be deleted through the dedicated transfer endpoint
        if (existing.type === "transfer" || existing.transferId) {
          throw new Error("TRANSFER_DELETE_NOT_ALLOWED");
        }

        // Find the associated account
        const account = await tx.account.findFirst({
          where: {
            id: existing.accountId,
            userId,
          },
        });

        if (!account) {
          throw new Error("ACCOUNT_NOT_FOUND");
        }

        /*
         * Reverse the transaction's effect on the account.
         *
         * Income originally increased the balance,
         * so deleting it decreases the balance.
         *
         * Expense originally decreased the balance,
         * so deleting it increases the balance.
         */
        const balanceAdjustment =
          existing.type === "income"
            ? -Number(existing.amount)
            : Number(existing.amount);

        await tx.account.update({
          where: {
            id: account.id,
          },
          data: {
            balance: {
              increment: balanceAdjustment,
            },
          },
        });

        // Delete the transaction
        return await tx.transaction.delete({
          where: {
            id: existing.id,
          },
        });
      });

      return res.json({
        success: true,
        message: "Transaction deleted successfully",
        data: deletedTransaction,
      });
    } catch (error) {
      console.error("Delete transaction error:", error);

      if (error.message === "TRANSACTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      if (error.message === "TRANSFER_DELETE_NOT_ALLOWED") {
        return res.status(400).json({
          success: false,
          message: "Transfers must be deleted using the transfer endpoint",
        });
      }

      if (error.message === "ACCOUNT_NOT_FOUND") {
        return res.status(500).json({
          success: false,
          message: "Transaction account not found",
        });
      }

      return res.status(500).json({
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
      "runningBalance": 0,
      "categoryId": "existing-category-id-or-null",
      "categoryConfidence": "high",
      "isTransfer": false,
      "transferAccountId": null,
      "transferConfidence": "none"
    }
  ]
}

IMPORTANT:

- The "type" field may ONLY be "income" or "expense".
- NEVER return "transfer" as the value of "type".
- Internal transfers are identified using "isTransfer": true.
- The backend will convert transactions marked as transfers into the final "transfer" transaction type.

TRANSACTION RULES:

1. Extract ONLY genuine financial transactions.
2. Do NOT extract opening balances.
3. Do NOT extract closing balances.
4. Do NOT extract statement totals.
5. Do NOT extract subtotals.
6. Do NOT extract running balances as transactions.
7. Do NOT invent transactions.
8. Preserve transaction descriptions accurately.
9. Use the actual transaction date.
10. Date MUST be in YYYY-MM-DD format.
11. Amount MUST be a positive number.
12. Withdrawals, debits, purchases and payments = expense.
13. Deposits, credits, salary and received money = income.
14. If a line cannot confidently be interpreted as a genuine transaction, exclude it.
15. Never ask the user questions.

RUNNING BALANCE:

Bank statements may contain a balance column showing the account balance
after each transaction.

If a running balance is clearly associated with a genuine transaction,
extract it as "runningBalance".

IMPORTANT:

- runningBalance is NOT a transaction amount.
- NEVER create a transaction from a running balance.
- NEVER treat a running balance as income or expense.
- runningBalance represents the account balance AFTER that transaction.
- If no running balance is available or it cannot be confidently identified,
  return null.
- Do not infer or invent a running balance.

Example:

Transaction:
Credit = 3000
Balance = 62847.62

Return:

{
  "amount": 3000,
  "type": "income",
  "runningBalance": 62847.62
}

CATEGORY MATCHING:

The following are the user's EXISTING AureX categories:

${JSON.stringify(categoryList)}

For every non-transfer transaction:

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

IMPORTANT TRANSFER RULE:

If a transaction is an internal transfer between the user's own AureX accounts, it MUST be identified as:

"isTransfer": true

The "type" field MUST still be either "income" or "expense".

For an outgoing transfer:

"type": "expense"
"isTransfer": true

For an incoming transfer:

"type": "income"
"isTransfer": true

The backend will convert transactions marked with "isTransfer": true into the final "transfer" transaction type.

Do NOT classify an internal transfer as an ordinary income or expense.

Transfers must NEVER receive a categoryId.

For transfers:

"categoryId": null
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

For every transaction, determine whether it appears to be an internal transfer.

If it is NOT a transfer:

"isTransfer": false
"transferAccountId": null
"transferConfidence": "none"

If it IS a transfer:

"isTransfer": true

The "type" field must remain:

- "expense" when money leaves the selected statement account.
- "income" when money enters the selected statement account.

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

TRANSFER EXAMPLES:

Outgoing transfer:

{
  "date": "YYYY-MM-DD",
  "description": "Transfer to Savings",
  "amount": 5000,
  "type": "expense",
  "categoryId": null,
  "categoryConfidence": "none",
  "isTransfer": true,
  "transferAccountId": "existing-account-id",
  "transferConfidence": "high"
}

Incoming transfer:

{
  "date": "YYYY-MM-DD",
  "description": "Transfer from Checking",
  "amount": 5000,
  "type": "income",
  "categoryId": null,
  "categoryConfidence": "none",
  "isTransfer": true,
  "transferAccountId": "existing-account-id",
  "transferConfidence": "high"
}

TRANSFER ACCOUNT SAFETY:

- Only select an account from the supplied AureX account list.
- Never invent or guess an account ID.
- Do not select the currently selected source account as the transfer destination.
- If the destination cannot be confidently identified, return null for transferAccountId.
- If transferAccountId is null, set transferConfidence to "none".

CATEGORY SAFETY:

- Only select categories from the supplied AureX category list.
- Never invent category IDs.
- Never assign a category to a transfer.
- If unsure about a category, return categoryId as null and categoryConfidence as "none".

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


            /*
   * Determine transaction type.
   *
   * AI may return income/expense + isTransfer=true.
   * In that case, AureX must normalize it to transfer.
   */
            const isTransfer = row.isTransfer === true;

            const transactionType = isTransfer
              ? "transfer"
              : row.type;

            /*
             * Only income, expense and transfer
             * are valid AureX transaction types.
             */
            if (
              !["income", "expense", "transfer"].includes(
                transactionType
              )
            ) {
              continue;
            }


            /* =========================
              VALIDATE TRANSFER
            ========================= */

            let transferAccountId = null;
            let transferConfidence = "none";

            if (isTransfer) {
              /*
               * Only allow another account belonging
               * to the authenticated user.
               */
              if (
                row.transferAccountId &&
                accounts.some(
                  (account) =>
                    account.id === row.transferAccountId &&
                    account.id !== accountId
                )
              ) {
                transferAccountId =
                  row.transferAccountId;
              }

              /*
               * Normalize transfer confidence.
               */
              if (
                ["high", "medium", "low"].includes(
                  row.transferConfidence
                )
              ) {
                transferConfidence =
                  row.transferConfidence;
              } else {
                transferConfidence =
                  transferAccountId
                    ? "medium"
                    : "none";
              }
            }

            /* =========================
               VALIDATE CATEGORY
            ========================= */

            let categoryId = null;
            let categoryConfidence = "none";

            /*
             * Transfers NEVER receive categories.
             */
            if (!isTransfer && row.categoryId) {
              const category =
                categories.find(
                  (category) =>
                    category.id === row.categoryId &&
                    category.type === transactionType
                );

              if (category) {
                categoryId = category.id;
              }
            }
            /* =========================
               CATEGORY CONFIDENCE
            ========================= */

            if (!isTransfer && categoryId) {
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

            const runningBalance =
              typeof row.runningBalance === "number" &&
                Number.isFinite(row.runningBalance)
                ? row.runningBalance
                : null;

            allRows.push({
              date: row.date,

              description:
                row.description.trim(),

              amount: Math.abs(row.amount),

              type: transactionType,

              runningBalance,

              categoryId,

              categoryConfidence,

              isTransfer,

              transferAccountId,

              transferConfidence,

              transferDirection:
                isTransfer
                  ? row.type === "expense"
                    ? "outgoing"
                    : "incoming"
                  : null,

              needsCategoryReview:
                !isTransfer &&
                (
                  !categoryId ||
                  categoryConfidence === "low" ||
                  categoryConfidence === "none"
                ),

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
   CALCULATE STATEMENT BALANCES
========================= */

      const rowsWithBalance = uniqueRows
        .filter(
          (row) =>
            typeof row.runningBalance === "number" &&
            Number.isFinite(row.runningBalance)
        )
        .sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        );

      let openingBalance = null;
      let closingBalance = null;

      if (rowsWithBalance.length > 0) {
        const firstRow = rowsWithBalance[0];
        const lastRow =
          rowsWithBalance[rowsWithBalance.length - 1];

        /*
         * Closing balance is simply the running balance
         * after the final transaction.
         */
        closingBalance = lastRow.runningBalance;

        /*
         * Opening balance is the balance immediately
         * before the first transaction.
         *
         * Income / incoming transfer:
         * opening = running balance - transaction amount
         *
         * Expense / outgoing transfer:
         * opening = running balance + transaction amount
         */
        if (
          firstRow.type === "income"
        ) {
          openingBalance =
            firstRow.runningBalance -
            firstRow.amount;
        } else if (
          firstRow.type === "expense"
        ) {
          openingBalance =
            firstRow.runningBalance +
            firstRow.amount;
        } else if (
          firstRow.type === "transfer"
        ) {
          /*
           * For transfers, use the direction to determine
           * whether money entered or left the account.
           */
          if (
            firstRow.transferDirection === "incoming"
          ) {
            openingBalance =
              firstRow.runningBalance -
              firstRow.amount;
          } else {
            openingBalance =
              firstRow.runningBalance +
              firstRow.amount;
          }
        }
      }

      /* =========================
         BALANCE RECONCILIATION
      ========================= */

      let calculatedClosingBalance = null;
      let balanceDifference = null;
      let balanceReconciled = null;

      if (
        openingBalance !== null &&
        closingBalance !== null
      ) {
        calculatedClosingBalance = openingBalance;

        for (const row of rowsWithBalance) {
          if (row.type === "income") {
            calculatedClosingBalance += row.amount;
          } else if (row.type === "expense") {
            calculatedClosingBalance -= row.amount;
          } else if (row.type === "transfer") {
            if (row.transferDirection === "incoming") {
              calculatedClosingBalance += row.amount;
            } else if (row.transferDirection === "outgoing") {
              calculatedClosingBalance -= row.amount;
            }
          }
        }

        balanceDifference =
          calculatedClosingBalance - closingBalance;

        balanceReconciled =
          Math.abs(balanceDifference) < 0.01;
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
                !row.isTransfer &&
                row.categoryId
            ).length,


          uncategorizedRows:
            uniqueRows.filter(
              (row) =>
                !row.isTransfer &&
                !row.categoryId
            ).length,

          failedChunks,
          statement: {
            openingBalance,
            closingBalance,
            calculatedClosingBalance,
            balanceDifference,
            balanceReconciled,
            currency: account.currency,
          },
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

      const { rows, accountId, statement } = req.body;

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

      const startingBalance = Number(account.balance);

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

      const categoryMap = new Map(
        categories.map((category) => [
          category.id,
          category,
        ])
      );

      /* =========================
         IMPORT STATISTICS
      ========================= */

      let imported = 0;
      let skipped = 0;
      let duplicates = 0;
      let uncategorized = 0;
      let transfers = 0;
      let income = 0;
      let expenses = 0;

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
          !["income", "expense", "transfer"].includes(row.type)
        ) {
          skipped++;
          continue;
        }

        const transactionAmount = Math.abs(row.amount);

        /* =========================
           HANDLE TRANSFER
        ========================= */

        if (row.type === "transfer") {
          if (!row.transferAccountId) {
            skipped++;
            continue;
          }

          if (row.transferAccountId === accountId) {
            skipped++;
            continue;
          }

          const destinationAccount =
            await prisma.account.findFirst({
              where: {
                id: row.transferAccountId,
                userId,
              },
            });

          if (!destinationAccount) {
            skipped++;
            continue;
          }

          const startOfDay = new Date(transactionDate);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(transactionDate);
          endOfDay.setHours(23, 59, 59, 999);

          const existingTransfer =
            await prisma.transaction.findFirst({
              where: {
                userId,
                accountId,
                amount: transactionAmount,
                type: "transfer",
                description: row.description.trim(),
                date: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
            });

          if (existingTransfer) {
            duplicates++;
            continue;
          }

          await prisma.$transaction(async (tx) => {
            const transfer =
              await tx.transfer.create({
                data: {
                  userId,
                  fromAccountId: accountId,
                  toAccountId: row.transferAccountId,
                  amount: transactionAmount,
                  date: transactionDate,
                  description: row.description.trim(),
                },
              });

            /*
             * OUTGOING
             */

            await tx.transaction.create({
              data: {
                userId,
                accountId,
                categoryId: null,
                description: row.description.trim(),
                amount: transactionAmount,
                type: "transfer",
                date: transactionDate,
                transferId: transfer.id,
                transferAccountId:
                  row.transferAccountId,
                transferDirection: "outgoing",
              },
            });

            /*
             * INCOMING
             */

            await tx.transaction.create({
              data: {
                userId,
                accountId: row.transferAccountId,
                categoryId: null,
                description: row.description.trim(),
                amount: transactionAmount,
                type: "transfer",
                date: transactionDate,
                transferId: transfer.id,
                transferAccountId: accountId,
                transferDirection: "incoming",
              },
            });

            /*
             * SOURCE ACCOUNT
             */

            await tx.account.update({
              where: {
                id: accountId,
              },
              data: {
                balance: {
                  decrement: transactionAmount,
                },
              },
            });

            /*
             * DESTINATION ACCOUNT
             */

            await tx.account.update({
              where: {
                id: row.transferAccountId,
              },
              data: {
                balance: {
                  increment: transactionAmount,
                },
              },
            });
          });

          imported++;
          transfers++;

          continue;
        }

        /* =========================
           CATEGORY
        ========================= */

        let categoryId = row.categoryId || null;

        if (categoryId) {
          const category = categoryMap.get(categoryId);

          if (
            !category ||
            category.type !== row.type
          ) {
            categoryId = null;
          }
        }

        /*
         * Fallback category matcher.
         */

        if (!categoryId) {
          categoryId = matchCategory(
            row.description,
            categories.filter(
              (category) =>
                category.type === row.type
            )
          );
        }

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

        const existing =
          await prisma.transaction.findFirst({
            where: {
              userId,
              accountId,
              amount: transactionAmount,
              type: row.type,
              description: row.description.trim(),
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

        await prisma.$transaction(async (tx) => {
          await tx.transaction.create({
            data: {
              userId,
              accountId,
              categoryId,
              description: row.description.trim(),
              amount: transactionAmount,
              type: row.type,
              date: transactionDate,
            },
          });

          await tx.account.update({
            where: {
              id: accountId,
            },
            data: {
              balance: {
                increment:
                  row.type === "income"
                    ? transactionAmount
                    : -transactionAmount,
              },
            },
          });
        });

        imported++;

        if (row.type === "income") {
          income += transactionAmount;
        }

        if (row.type === "expense") {
          expenses += transactionAmount;
        }
      }

      /* =========================
         RECONCILIATION
      ========================= */

      const statementClosing =
        statement?.closingBalance !== null &&
          statement?.closingBalance !== undefined
          ? Number(statement.closingBalance)
          : null;

      const calculatedClosing =
        startingBalance +
        income -
        expenses;

      let reconciliation = {
        performed: false,
        reconciled: null,
        startingBalance,
        calculatedClosing,
        statementClosing,
        difference: null,
      };
      /*
       * Only reconcile when the statement
       * actually supplied a closing balance.
       */

      if (statementClosing !== null) {
        const difference =
          statementClosing -
          calculatedClosing;

        reconciliation = {
          performed: true,
          reconciled:
            Math.abs(difference) < 0.01,
          startingBalance,
          calculatedClosing,
          statementClosing,
          difference,
        };

        /*
         * Set the account balance to the
         * authoritative statement closing
         * balance.
         */

        await prisma.account.update({
          where: {
            id: accountId,
          },
          data: {
            balance: statementClosing,
          },
        });
      }

      /* =========================
         GET FINAL ACCOUNT
      ========================= */

      const finalAccount =
        await prisma.account.findUnique({
          where: {
            id: accountId,
          },
          select: {
            balance: true,
          },
        });

      /* =========================
         CLEANUP
      ========================= */

      /*
       * At this stage there is no temporary
       * import record being persisted by this
       * controller, so cleanup is complete.
       *
       * Keep this explicit so the frontend can
       * report the completed workflow.
       */

      const cleanup = {
        completed: true,
      };

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
          transfers,
          total: rows.length,

          income,
          expenses,

          reconciliation,

          account: {
            balance:
              finalAccount?.balance ?? null,
          },

          cleanup,
        },
      });
    } catch (err) {
      console.error(
        "Confirm import error:",
        err
      );

      return res.status(500).json({
        success: false,
        error: "Import failed",
      });
    }
  },
};
