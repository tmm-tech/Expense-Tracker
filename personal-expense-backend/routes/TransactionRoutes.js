const TransactionRoutes = require('express').Router();
const multer = require("multer");
const upload = multer();
const {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    batchDeleteTransactions,
    getTransactionSummary,
    previewImport,
    confirmImport,
    createTransfer,
    updateTransfer,
    deleteTransfer
} = require('../controller/TransactionControllers');

// Create and insert a new transaction
TransactionRoutes.post('/transactions', createTransaction);

// Create Transfer between accounts
TransactionRoutes.post("/transfer", createTransfer);

// Update Transfer between accounts
TransactionRoutes.put("/transfer/:id", updateTransfer);

// Delete Transfer between accounts
TransactionRoutes.delete("/transfer/:id", deleteTransfer);

// Read all transactions
TransactionRoutes.get('/transactions', getTransactions);

// Read a specific transaction by ID
TransactionRoutes.get('/transactions/:id', getTransactionById);

// Update a transaction by ID
TransactionRoutes.put('/transactions/:id', updateTransaction);

// Delete a transaction by ID
TransactionRoutes.delete('/transactions/:id', deleteTransaction);

// Batch delete transactions and transfers
TransactionRoutes.delete('/transactions/batch', batchDeleteTransactions);

// Transaction Summary
TransactionRoutes.get('/transactions/summary', getTransactionSummary);

// Preview Import
TransactionRoutes.post('/import/preview', upload.single('file'), previewImport);

// Confirm Import
TransactionRoutes.post('/import/confirm', confirmImport);

module.exports = TransactionRoutes;