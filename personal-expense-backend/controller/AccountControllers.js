import { prisma } from "../src/lib/prism";


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
            const { name, type, balance } = req.body;
            const account = await prisma.account.create({
                data: {
                    userId: req.user.id,
                    name,
                    type,
                    balance: Number(balance),
                },
            });
            res.json({
                success: true,
                message: "Account created successfully",
                data: account,
            });
        }
        catch (error) {
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
            const accounts = await prisma.account.findMany({
                where: { userId: req.user.id },
            });
            res.json({
                success: true,
                data: accounts,
            });
        }
        catch (error) {
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
            const account = await prisma.account.findFirst({
                where: { id: Number(id), userId: req.user.id },
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
        }
        catch (error) {
            console.error("Get account by ID error:", error);
            res.status(500).json({
                success: false,
                message: `Get Account By ID Error: ${error.message}`,
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
            const updated = await prisma.account.updateMany({
                where: { id: Number(id), userId: req.user.id },
                data: {
                    name,
                    type,
                    balance: balance !== undefined ? Number(balance) : undefined,
                },
            });
            if (!updated.count) {
                return res.status(404).json({
                    success: false,
                    message: "Account not found",
                });
            }
            res.json({
                success: true,
                message: "Account updated successfully",
            });
        }
        catch (error) {
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
        }
        catch (error) {
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
            const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
            res.json({
                success: true,
                data: {
                    totalBalance,
                    accounts,
                },
            });
        }
        catch (error) {
            console.error("Get account summary error:", error);
            res.status(500).json({
                success: false,
                message: `Get Account Summary Error: ${error.message}`,
            });
        }
    },
};