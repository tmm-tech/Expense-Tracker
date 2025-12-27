const AccountsRoutes = require('express').Router();
const {
    createAccount,
    getAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
    getAccountSummary
} = require('../controller/AccountControllers');
// Create and insert a new account
AccountsRoutes.post('/accounts', createAccount);
// Read all accounts
AccountsRoutes.get('/accounts', getAccounts);
// Read a specific account by ID
AccountsRoutes.get('/accounts/:id', getAccountById);
// Update an account by ID
AccountsRoutes.put('/accounts/:id', updateAccount);
// Delete an account by ID
AccountsRoutes.delete('/accounts/:id', deleteAccount);
// Account Summary
AccountsRoutes.get('/accounts/summary', getAccountSummary);

module.exports = AccountsRoutes;