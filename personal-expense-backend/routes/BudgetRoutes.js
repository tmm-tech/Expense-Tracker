const BudgetRoutes = require('express').Router();
const { checkAuth } = require('../controllers/UserControllers');

const {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetByUserId
} = require('../controllers/BudgetControllers');

// Create a new budget
BudgetRoutes.post('/create', checkAuth, createBudget);

// Get all budgets
BudgetRoutes.get('/all', checkAuth, getAllBudgets);

// Get budget by ID
BudgetRoutes.get('/:id', checkAuth, getBudgetById);

// Get budgets by user ID
BudgetRoutes.get('/user/:userId', checkAuth, getBudgetByUserId);

// Update budget
BudgetRoutes.put('/update/:id', checkAuth, updateBudget);

// Delete budget
BudgetRoutes.delete('/delete/:id', checkAuth, deleteBudget);

module.exports = BudgetRoutes;