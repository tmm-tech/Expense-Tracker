const express = require("express");
const   DebtRoutes = express.Router();

const { requireAuth } = require("../middleware/auth");
const DebtControllers = require("../controller/DebtControllers");

DebtRoutes.use(requireAuth);

DebtRoutes.get("/", DebtControllers.getDebts);
DebtRoutes.post("/", DebtControllers.createDebt);
DebtRoutes.put("/:id", DebtControllers.updateDebt);
DebtRoutes.delete("/:id", DebtControllers.deleteDebt);

DebtRoutes.post("/:id/payment", DebtControllers.makePayment);
DebtRoutes.get("/summary", DebtControllers.getDebtSummary);

module.exports = DebtRoutes;