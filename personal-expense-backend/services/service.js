// src/services/services.js
import prisma from "../lib/prisma.js";

/* ================================
   TRANSACTIONS
================================ */

export async function getTransactionsByUser(userId) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

/* ================================
   BILLS
================================ */

export async function getBillsByUser(userId) {
  return prisma.bill.findMany({
    where: { userId },
    orderBy: { dueDate: "asc" },
  });
}

/* ================================
   DEBTS
================================ */

export async function getDebtsByUser(userId) {
  return prisma.debt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/* ================================
   GOALS
================================ */

export async function getGoalsByUser(userId) {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { deadline: "asc" },
  });
}

/* ================================
   BUDGETS
================================ */

export async function getBudgetsByUser(userId) {
  return prisma.budget.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/* ================================
   RECURRING TRANSACTIONS
================================ */

export async function getRecurringTransactionsByUser(userId) {
  return prisma.recurringTransaction.findMany({
    where: {
      userId,
      isActive: true,
    },
  });
}

/* ================================
   CATEGORIES
================================ */

export async function getCategoriesByUser(userId) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

/* ================================
   INVESTMENTS
================================ */

export async function getInvestmentsByUser(userId) {
  return prisma.investment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}