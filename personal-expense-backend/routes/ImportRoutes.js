const ImportRoutes = require('express').Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const { importTransactions, importBudgets } = require('../controller/ImportControllers');
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Import data
ImportRoutes.post('/transactions', auth, upload.single('file'), importTransactions);
// Get all imports
ImportRoutes.get('/budgets', auth, upload.single("file"), importBudgets);


module.exports = ImportRoutes;