const { Prisma } = require("@prisma/client");
const { prisma } = require("../src/lib/prism");

/**
 * NOTE:
 * req.user.id is assumed to be set by auth middleware
 */

module.exports = {
  /* ===========================
         CREATE ACCOUNT
    ============================ */
  createAccount: async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.sub; // or req.user.id depending on your auth
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: missing user ID" });
      }
      const { name, type, balance, institution, currency, accountNumber } =
        req.body;


      const numericBalance = Number(balance);
      if (
        !name ||
        !type ||
        !institution ||
        !currency ||
        balance === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, type, balance, institution and currency are required",
        });
      }
      if (!Number.isFinite(numericBalance)) {
        return res.status(400).json({
          success: false,
          message: "Balance must be a valid number",
        });
      }


      const decimalBalance = new Prisma.Decimal(balance);

      const account = await prisma.account.create({
        data: {
          userId,
          name,
          type,
          balance: decimalBalance,
          institution,
          currency,
          accountNumber,
        },
      });
      res.json({
        success: true,
        message: "Account created successfully",
        data: account,
      });
    } catch (error) {
      console.error("Create account error:", error);
      res.status(500).json({
        success: false,
        message: `Create Account Error: ${error.message}`,
      });
    }
  },
  /* ===========================
         GET ACCOUNTS
    ============================ */
  getAccounts: async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: missing user ID" });
      }
      // 1️⃣ Parse pagination params safely
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const skip = (page - 1) * limit;

      const accounts = await prisma.account.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      const accountCount = await prisma.account.count({ where: { userId } });

      // 3️⃣ Send ApiResponse-compliant payload
      res.json({
        success: true,
        data: accounts,
        pagination: {
          page,
          limit,
          total: accountCount,
          totalPages: Math.ceil(accountCount / limit),
        },
      });
    } catch (error) {
      console.error("Get accounts error:", error);

      res.status(500).json({
        success: false,
        message: `Get Accounts Error: ${error.message}`,
      });
    }
  },

  /* ===========================
            GET ACCOUNT BY ID
    ============================ */
  getAccountById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }

      const includeTransactions = req.query.includeTransactions === "true";

      const account = await prisma.account.findFirst({
        where: {
          id,       // UUID (string)
          userId,
        },
        include: includeTransactions
          ? {
            transactions: {
              orderBy: { date: "desc" },
            },
          }
          : undefined,
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: "Account not found",
        });
      }

      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      console.error("Get account error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch account",
      });
    }
  },

  /* ===========================
        UPDATE ACCOUNT
  ============================ */
  updateAccount: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }

      const { name, type, balance } = req.body;

      /* =========================
         FIND ACCOUNT
      ========================= */

      const existingAccount = await prisma.account.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingAccount) {
        return res.status(404).json({
          success: false,
          message: "Account not found",
        });
      }

      /* =========================
         VALIDATE BALANCE
      ========================= */

      let decimalBalance;

      if (balance !== undefined) {
        const numericBalance = Number(balance);

        if (!Number.isFinite(numericBalance)) {
          return res.status(400).json({
            success: false,
            message: "Balance must be a valid number",
          });
        }

        decimalBalance = new Prisma.Decimal(balance);
      }

      /* =========================
         UPDATE ACCOUNT
      ========================= */

      const updated = await prisma.account.update({
        where: {
          id,
        },
        data: {
          name: name !== undefined ? String(name).trim() : undefined,
          type: type !== undefined ? type : undefined,
          balance: decimalBalance,
        },
      });

      return res.json({
        success: true,
        message: "Account updated successfully",
        data: updated,
      });
    } catch (error) {
      console.error("Update account error:", error);

      return res.status(500).json({
        success: false,
        message: `Update Account Error: ${error.message}`,
      });
    }
  },

  /* ===========================
        DELETE ACCOUNT
  ============================ */
  deleteAccount: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }

      const account = await prisma.account.findFirst({
        where: {
          id,
          userId,
        },
        select: {
          id: true,
        },
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: "Account not found",
        });
      }

      await prisma.account.delete({
        where: {
          id: account.id,
        },
      });

      return res.json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Delete account error:", error);

      return res.status(500).json({
        success: false,
        message: `Delete Account Error: ${error.message}`,
      });
    }
  },
  /* ===========================
        GET ACCOUNT SUMMARY
    ============================ */
  getAccountSummary: async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: missing user ID",
        });
      }

      const accounts = await prisma.account.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
        },
      });

      let totalBalance = new Prisma.Decimal(0);

      for (const account of accounts) {
        totalBalance = totalBalance.add(account.balance);
      }

      return res.json({
        success: true,
        data: {
          totalBalance,
          accounts,
        },
      });
    } catch (error) {
      console.error("Get account summary error:", error);

      return res.status(500).json({
        success: false,
        message: `Get Account Summary Error: ${error.message}`,
      });
    }
  },
};
