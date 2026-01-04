const { prisma } = require("../src/lib/prism");
/**
 * All controllers assume:
 * req.user.sub = Supabase user id (UUID)
 */

module.exports = {
  // GET /api/bills
  getBills: async (req, res) => {
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

      const bills = await prisma.bill.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        })
      const billsCount = await prisma.bill.count({ where: { userId } });

      if (billsCount === 0) {
        return res.json({ success: true, message: "No bills to check" });
      }

      // 3️⃣ Return ApiResponse format
      res.json({
        success: true,
        data: bills,
        pagination: {
          page,
          limit,
          total: billsCount,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error("Get bills error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch bills",
      });
    }
  },

  // POST /api/bills
  createBill: async (req, res) => {
    try {
      const userId = req.user.sub;
      const {
        name,
        amount,
        dueDay,
        frequency,
        accountId,
        reminderDays = 0,
        notes,
      } = req.body;

      const bill = await prisma.bill.create({
        data: {
          userId,
          name,
          amount,
          dueDay,
          frequency,
          accountId,
          reminderDays,
          notes,
        },
      });

      res.status(201).json(bill);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to create bill" });
    }
  },

  // PUT /api/bills/:id
  updateBill: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const bill = await prisma.bill.updateMany({
        where: { id, userId },
        data: req.body,
      });

      if (!bill.count) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to update bill" });
    }
  },

  // DELETE /api/bills/:id
  deleteBill: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const bill = await prisma.bill.deleteMany({
        where: { id, userId },
      });

      if (!bill.count) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to delete bill" });
    }
  },

  // POST /api/bills/:id/pay
  markBillPaid: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const bill = await prisma.bill.updateMany({
        where: { id, userId },
        data: {
          isPaid: true,
          lastPaidAt: new Date(),
        },
      });

      if (!bill.count) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to mark bill as paid" });
    }
  },
};
