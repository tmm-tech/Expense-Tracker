const express = require("express");
const BudgetRoutes = express.Router();

const {requireAuth} = require("../middleware/auth");
const {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget
} =   require("../controller/BudgetControllers");
// Protect all budget routes
BudgetRoutes.use(requireAuth);

BudgetRoutes.get("/budgets", getBudgets);
BudgetRoutes.post("/budgets", createBudget);
BudgetRoutes.put("/budgets/:id", updateBudget);
BudgetRoutes.delete("/budgets/:id", deleteBudget);

module.exports = BudgetRoutes;