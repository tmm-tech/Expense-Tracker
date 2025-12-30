const express = require("express");
const   DebtRoutes = express.Router();

const { requireAuth } = require("../middleware/auth");
const {getDebts, createDebt, updateDebt, deleteDebt, makePayment, getDebtSummary} = require("../controller/DebtControllers");

DebtRoutes.use(requireAuth);

DebtRoutes.get("/debts", getDebts);
DebtRoutes.post("/debts",createDebt);
DebtRoutes.put("/ebts/:id", updateDebt);
DebtRoutes.delete("/debts/:id",deleteDebt);

DebtRoutes.post("/:id/payment",makePayment);
DebtRoutes.get("/summary", getDebtSummary);

module.exports = DebtRoutes;