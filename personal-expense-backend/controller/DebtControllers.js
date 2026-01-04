const { prisma } = require("../src/lib/prism");

/**
 * All debt operations are user-scoped
 * req.user.sub comes from Supabase JWT
 */

module.exports = {
  // GET /api/debts
  getDebts: async (req, res) => {
    try {
      if (!req.user?.sub) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const userId = req.user.sub;

      // 1️⃣ Pagination params
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const skip = (page - 1) * limit;

      // 2️⃣ Fetch debts + total count
      const debts = await prisma.debt.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        });
      const debtCount = await prisma.debt.count({ where: { userId } });

      if (debtCount === 0) {
        return res.json({ success: true, message: "No debt to check" });
      }

      // 3️⃣ Standard ApiResponse
      res.json({
        success: true,
        data: debts,
        pagination: {
          page,
          limit,
          total: debtCount,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error("Get debts error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch debts",
      });
    }
  },

  // POST /api/debts
  createDebt: async (req, res) => {
    try {
      const userId = req.user.sub;
      const {
        name,
        type,
        creditor,
        originalAmount,
        currentBalance,
        interestRate,
        minimumPayment,
        dueDay,
        startDate,
        notes,
      } = req.body;

      if (
        !name ||
        !type ||
        !creditor ||
        originalAmount == null ||
        currentBalance == null
      ) {
        return res
          .status(400)
          .json({ message: "Missing required debt fields" });
      }

      const debt = await prisma.debt.create({
        data: {
          userId,
          name,
          type,
          creditor,
          originalAmount,
          currentBalance,
          interestRate: interestRate ?? 0,
          minimumPayment: minimumPayment ?? 0,
          dueDay: dueDay ?? 1,
          startDate: new Date(startDate),
          notes,
        },
      });

      res.status(201).json(debt);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to create debt" });
    }
  },

  // PUT /api/debts/:id
  updateDebt: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const updated = await prisma.debt.updateMany({
        where: { id, userId },
        data: req.body,
      });

      if (!updated.count) {
        return res.status(404).json({ message: "Debt not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to update debt" });
    }
  },

  // DELETE /api/debts/:id
  deleteDebt: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const deleted = await prisma.debt.deleteMany({
        where: { id, userId },
      });

      if (!deleted.count) {
        return res.status(404).json({ message: "Debt not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to delete debt" });
    }
  },

  // POST /api/debts/:id/payment
  makePayment: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid payment amount" });
      }

      const debt = await prisma.debt.findFirst({
        where: { id, userId },
      });

      if (!debt) {
        return res.status(404).json({ message: "Debt not found" });
      }

      const newBalance = Math.max(debt.currentBalance - amount, 0);

      const updatedDebt = await prisma.debt.update({
        where: { id },
        data: {
          currentBalance: newBalance,
          status: newBalance === 0 ? "closed" : "active",
        },
      });

      res.json(updatedDebt);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to apply payment" });
    }
  },

  // GET /api/debts/summary
  getDebtSummary: async (req, res) => {
    try {
      const userId = req.user.sub;

      const debts = await prisma.debt.findMany({
        where: { userId },
      });

      const summary = debts.reduce(
        (acc, d) => {
          acc.totalDebt += d.originalAmount;
          acc.totalPaidOff += d.originalAmount - d.currentBalance;
          acc.totalMinimumPayment += d.minimumPayment;
          acc.numberOfDebts += 1;
          acc.totalInterestRate += d.interestRate;
          return acc;
        },
        {
          totalDebt: 0,
          totalPaidOff: 0,
          totalMinimumPayment: 0,
          numberOfDebts: 0,
          totalInterestRate: 0,
        }
      );

      res.json({
        totalDebt: summary.totalDebt,
        totalPaidOff: summary.totalPaidOff,
        totalMinimumPayment: summary.totalMinimumPayment,
        numberOfDebts: summary.numberOfDebts,
        averageInterestRate:
          summary.numberOfDebts > 0
            ? summary.totalInterestRate / summary.numberOfDebts
            : 0,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get debt summary" });
    }
  },
};
