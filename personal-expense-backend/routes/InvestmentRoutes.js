const InvestmentRoutes = require('express').Router();

const {
    createInvestment,
    getInvestments,
    getInvestmentById,
    updateInvestment,
    deleteInvestment,
    getPortfolioSummary
} = require('../controllers/InvestmentControllers');

// Create a new investment
InvestmentRoutes.post('/create', createInvestment);

// Get all investments
InvestmentRoutes.get('/', getInvestments);

// Get investments by user ID
InvestmentRoutes.get('/summary', getPortfolioSummary);

// Get a specific investment by ID
InvestmentRoutes.get('/:id', getInvestmentById);

// Update an investment
InvestmentRoutes.put('/update/:id', updateInvestment);

// Delete an investment
InvestmentRoutes.delete('/delete/:id', deleteInvestment);

module.exports = InvestmentRoutes;