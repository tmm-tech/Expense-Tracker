const express = require("express");
const BudgetRoutes = express.Router();

const {requireAuth} = require("../middleware/auth");
const BudgetControllers = require("../controllers/BudgetControllers");

// Protect all budget routes
BudgetRoutes.use(requireAuth);

BudgetRoutes.get("/budgets", BudgetControllers.getBudgets);
BudgetRoutes.post("/budgets", BudgetControllers.createBudget);
BudgetRoutes.put("/budgets/:id", BudgetControllers.updateBudget);
BudgetRoutes.delete("/budgets/:id", BudgetControllers.deleteBudget);

module.exports = BudgetRoutes;