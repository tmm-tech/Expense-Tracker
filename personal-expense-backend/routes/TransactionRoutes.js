const TransactionRoutes = require('express').Router();
const multer = require("multer");
const upload = multer();
const {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary,
    previewImport,
    confirmImport,
    createTransfer,
    updateTransfer
} = require('../controller/TransactionControllers');

// Create and insert a new transaction
TransactionRoutes.post('/transactions', createTransaction);

// Create Transfer between accounts
TransactionRoutes.post("/transfer", createTransfer);

// Update Transfer between accounts
TransactionRoutes.put("/transfer/:id", updateTransfer);

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

// Preview Import
TransactionRoutes.post('/import/preview', upload.single('file'), previewImport);

// Confirm Import
TransactionRoutes.post('/import/confirm', confirmImport);

module.exports = TransactionRoutes;