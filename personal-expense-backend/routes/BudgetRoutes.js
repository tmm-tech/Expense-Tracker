import {
  getBudgets,
  createBudget,
  getBudgetUsage,
  applyRollover,
  deleteBudget,
  applyRollover,

} from "../controllers/budget.controller.js";
import auth from "../middleware/auth.js";

const BudgetRoutes = require('express').Router();

BudgetRoutes.get("/", auth, createBudget);
BudgetRoutes.post("/", auth, getBudgets);
BudgetRoutes.put("/usage", auth, getBudgetUsage);
BudgetRoutes.delete("/:id", auth, deleteBudget);
BudgetRoutes.post("/rollover", auth, applyRollover);

export default BudgetRoutes;
