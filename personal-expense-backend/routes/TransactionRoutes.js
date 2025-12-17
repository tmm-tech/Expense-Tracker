const TransactionRoutes = require('express').Router();

const {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary
} = require('../controllers/TransactionControllers');

// Create and insert a new transaction
TransactionRoutes.post('/transactions', createTransaction);

// Read all transactions
TransactionRoutes.get('/transactions', getTransactions);

// Read a specific transaction by ID
TransactionRoutes.get('/transactions/:id', getTransactionById);

// Update a transaction by ID
TransactionRoutes.put('/transactions/:id', updateTransaction);

// Delete a transaction by ID
TransactionRoutes.delete('/transactions/:id', deleteTransaction);

// Transaction Summary
TransactionRoutes.get('/transactions/summary', getTransactionSummary);

module.exports = TransactionRoutes;