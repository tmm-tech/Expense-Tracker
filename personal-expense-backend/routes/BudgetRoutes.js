import express from "express";
import prisma from "../prisma.js";

const BudgetRoutes = express.Router();

/* Get budgets for month */
BudgetRoutes.get("/", async (req, res) => {
  const { month } = req.query;
  const budgets = await prisma.budget.findMany({
    where: { userId: req.user.id, month },
  });
  res.json(budgets);
});

/* Update budget limit (drag) */
BudgetRoutes.put("/:id", async (req, res) => {
  const budget = await prisma.budget.update({
    where: { id: req.params.id },
    data: { limit: req.body.limit },
  });
  res.json(budget);
});

export default router;
