const express = require("express");
const   DebtRoutes = express.Router();

const { requireAuth } = require("../middleware/auth");
const {getDebts, createDebt, updateDebt, deleteDebt, makePayment, getDebtSummary} = require("../controller/DebtControllers");

DebtRoutes.use(requireAuth);

DebtRoutes.get("/", getDebts);
DebtRoutes.post("/",createDebt);
DebtRoutes.put("/:id", updateDebt);
DebtRoutes.delete("/:id",deleteDebt);

DebtRoutes.post("/:id/payment",makePayment);
DebtRoutes.get("/summary", getDebtSummary);

module.exports = DebtRoutes;