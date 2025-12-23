// const ImportRoutes = require('express').Router();
// const multer = require("multer");
// import { authMiddleware } from "../middleware/auth.js";
// const { importTransactions, importBudgets } = require('../controller/ImportControllers');
// const upload = multer({
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });

// // Import data
// ImportRoutes.post('/transactions', authMiddleware, upload.single('file'), importTransactions);
// // Get all imports
// ImportRoutes.get('/budgets', authMiddleware, upload.single("file"), importBudgets);


// module.exports = ImportRoutes;