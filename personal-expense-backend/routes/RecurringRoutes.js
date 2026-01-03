const RecurringTransactionRoutes = require("express").Router();
const {   CreateRecurring,
  GetRecurring,
  GetRecurringById,
  UpdateRecurring,
  DeleteRecurring,} = require("../controller/RecurringTransactionController.js");
const { requireAuth } = require("../middleware/auth");

RecurringTransactionRoutes.use(requireAuth);

RecurringTransactionRoutes.post("/", CreateRecurring);
RecurringTransactionRoutes.get("/", GetRecurring);
RecurringTransactionRoutes.get("/:id", GetRecurringById);
RecurringTransactionRoutes.put("/:id", UpdateRecurring);
RecurringTransactionRoutes.delete("/:id", DeleteRecurring);

module.exports = RecurringTransactionRoutes;