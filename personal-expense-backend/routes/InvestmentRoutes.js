const InvestmentRoutes = require('express').Router();

const {
    createInvestment,
    getAllInvestments,
    getInvestmentById,
    updateInvestment,
    deleteInvestment,
    getInvestmentsByUserId
} = require('../controllers/InvestmentControllers');

// Create a new investment
InvestmentRoutes.post('/create', createInvestment);

// Get all investments
InvestmentRoutes.get('/all', getAllInvestments);

// Get investments by user ID
InvestmentRoutes.get('/user/:userId', getInvestmentsByUserId);

// Get a specific investment by ID
InvestmentRoutes.get('/:id', getInvestmentById);

// Update an investment
InvestmentRoutes.put('/update/:id', updateInvestment);

// Delete an investment
InvestmentRoutes.delete('/delete/:id', deleteInvestment);

module.exports = InvestmentRoutes;