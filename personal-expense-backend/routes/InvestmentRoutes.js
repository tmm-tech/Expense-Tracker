const InvestmentRoutes = require('express').Router();

const {
    createInvestment,
    getInvestments,
    getInvestmentById,
    updateInvestment,
    deleteInvestment,
    getPortfolioSummary
} = require('../controller/InvestmentControllers');

// Create a new investment
InvestmentRoutes.post('/', createInvestment);

// Get all investments
InvestmentRoutes.get('/', getInvestments);

// Get investments by user ID
InvestmentRoutes.get('/summary', getPortfolioSummary);

// Get a specific investment by ID
InvestmentRoutes.get('/:id', getInvestmentById);

// Update an investment
InvestmentRoutes.put('/:id', updateInvestment);

// Delete an investment
InvestmentRoutes.delete('/:id', deleteInvestment);

module.exports = InvestmentRoutes;