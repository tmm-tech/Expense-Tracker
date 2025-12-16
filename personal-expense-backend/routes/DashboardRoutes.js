const DashboardRoutes = require('express').Router();

const {
  createDashboardEntry,
  getAllDashboardEntries,
  updateDashboardEntry,
  deleteDashboardEntry,
  getDashboardEntry,
} = require('../controllers/DashboardControllers');

// Create a new dashboard entry
DashboardRoutes.post('/entry', createDashboardEntry);

// Get all dashboard entries
DashboardRoutes.get('/entries', getAllDashboardEntries);

// Get a specific dashboard entry by ID
DashboardRoutes.get('/entry/:id', getDashboardEntry);

// Update a specific dashboard entry by ID
DashboardRoutes.put('/entry/:id', updateDashboardEntry);

// Delete a specific dashboard entry by ID
DashboardRoutes.delete('/entry/:id', deleteDashboardEntry);

module.exports = DashboardRoutes;