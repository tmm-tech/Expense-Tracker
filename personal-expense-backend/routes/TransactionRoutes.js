const TransactionRoutes = require('express').Router();

const {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
} = require('../controllers/TransactionControllers');

// Create and insert a new transaction
TransactionRoutes.post('/transactions', createTransaction);

// Read all transactions
TransactionRoutes.get('/transactions', getAllTransactions);

// Read a specific transaction by ID
TransactionRoutes.get('/transactions/:id', getTransactionById);

// Update a transaction by ID
TransactionRoutes.put('/transactions/:id', updateTransaction);

// Delete a transaction by ID
TransactionRoutes.delete('/transactions/:id', deleteTransaction);

module.exports = TransactionRoutes;