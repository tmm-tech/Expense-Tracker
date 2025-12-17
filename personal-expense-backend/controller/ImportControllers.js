const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const { parseCSV } = require("../utils/csvParser");

module.exports = {
  /* ===========================
     IMPORT TRANSACTIONS (CSV)
  ============================ */
  importTransactions: async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "CSV file is required" });
      }

      const transactions = await parseCSV(req.file.buffer);

      const data = transactions.map((t) => ({
        ...t,
        userId: req.user.id,
      }));

      const result = await prisma.transaction.createMany({
        data,
        skipDuplicates: true,
      });

      res.json({
        success: true,
        message: "Transactions imported successfully",
        imported: result.count,
      });
    } catch (error) {
      console.error("Import transactions error:", error);
      res.status(500).json({
        success: false,
        message: `Import Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     IMPORT BUDGETS (CSV)
     Format:
     category,limit,month
  ============================ */
  importBudgets: async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "CSV file is required" });
      }

      const rows = await parseCSV(req.file.buffer);

      const data = rows.map((r) => ({
        userId: req.user.id,
        category: r.category,
        limit: Number(r.amount),
        month: r.date.toISOString().slice(0, 7),
        rollover: 0,
      }));

      const result = await prisma.budget.createMany({
        data,
        skipDuplicates: true,
      });

      res.json({
        success: true,
        message: "Budgets imported successfully",
        imported: result.count,
      });
    } catch (error) {
      console.error("Import budgets error:", error);
      res.status(500).json({
        success: false,
        message: `Budget Import Error: ${error.message}`,
      });
    }
  },
};