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
      const userId = req.user?.sub; // or req.user.id depending on your auth
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: missing user ID" });
      }
      const { name, type, balance, institution, currency, accountNumber } =
        req.body;
      const account = await prisma.account.create({
        data: {
          userId,
          name,
          type,
          balance: Number(balance),
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
      const userId = req.user.sub;
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
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      const accountCount = await prisma.account.count({ where: { userId } });

      if (accountCount === 0) {
        return res.json({ success: true, message: "No accounts to check" });
      }

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
    const userId = req.user.sub;
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
      const { name, type, balance } = req.body;

      const updated = await prisma.account.update({
        where: { id, userId: req.user.sub }, // ✅ use id as string if schema is String
        data: {
          name,
          type,
          balance: balance !== undefined ? Number(balance) : undefined,
        },
      });

      res.json({
        success: true,
        message: "Account updated successfully",
        account: updated, // ✅ return updated record
      });
    } catch (error) {
      if (error.code === "P2025") {
        // Prisma "Record not found" error
        return res.status(404).json({
          success: false,
          message: "Account not found",
        });
      }
      console.error("Update account error:", error);
      res.status(500).json({
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
      const deleted = await prisma.account.deleteMany({
        where: { id: Number(id), userId: req.user.id },
      });
      if (!deleted.count) {
        return res.status(404).json({
          success: false,
          message: "Account not found",
        });
      }
      res.json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({
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
      const accounts = await prisma.account.findMany({
        where: { userId: req.user.id },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
        },
      });
      const totalBalance = accounts.reduce(
        (sum, account) => sum + account.balance,
        0
      );
      res.json({
        success: true,
        data: {
          totalBalance,
          accounts,
        },
      });
    } catch (error) {
      console.error("Get account summary error:", error);
      res.status(500).json({
        success: false,
        message: `Get Account Summary Error: ${error.message}`,
      });
    }
  },
};
