const {
  createRecurring,
  getRecurringByUser,
  getRecurringById,
  updateRecurring,
  deleteRecurring,
} = require("../services/recurringTransactionServices");

module.exports = {
  /* ================= CREATE ================= */
  CreateRecurring: async (req, res) => {
    try {
      const recurring = await createRecurring({
        ...req.body,
        userId: req.user.id,
      });

      res.status(201).json({ success: true, data: recurring });
    } catch (error) {
      console.error("Create recurring error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create recurring transaction",
      });
    }
  },

  /* ================= READ ================= */
  GetRecurring: async (req, res) => {
    try {
      const recurring = await getRecurringByUser(req.user.id);

      res.json({ success: true, data: recurring });
    } catch (error) {
      console.error("Get recurring error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recurring transactions",
      });
    }
  },

  GetRecurringById: async (req, res) => {
    try {
      const recurring = await getRecurringById(req.params.id, req.user.id);

      if (!recurring) {
        return res.status(404).json({
          success: false,
          message: "Recurring transaction not found",
        });
      }

      res.json({ success: true, data: recurring });
    } catch (error) {
      console.error("Get recurring by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recurring transaction",
      });
    }
  },

  /* ================= UPDATE ================= */
  UpdateRecurring: async (req, res) => {
    try {
      const updated = await updateRecurring(
        req.params.id,
        req.user.id,
        req.body
      );

      if (!updated.count) {
        return res.status(404).json({
          success: false,
          message: "Recurring transaction not found",
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Update recurring error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update recurring transaction",
      });
    }
  },

  /* ================= DELETE ================= */
  DeleteRecurring: async (req, res) => {
    try {
      const deleted = await deleteRecurring(req.params.id, req.user.id);

      if (!deleted.count) {
        return res.status(404).json({
          success: false,
          message: "Recurring transaction not found",
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete recurring error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete recurring transaction",
      });
    }
  },
};
