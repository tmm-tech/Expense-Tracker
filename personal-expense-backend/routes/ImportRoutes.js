const ImportRoutes = require('express').Router();

const {
    importData,
    getAllImports,
    getImportById,
    updateImport,
    deleteImport
} = require('../controllers/ImportControllers');

// Import data
ImportRoutes.post('/import', importData);
// Get all imports
ImportRoutes.get('/imports', getAllImports);
// Get a specific import by ID
ImportRoutes.get('/import/:id', getImportById);
// Update an import
ImportRoutes.put('/import/:id', updateImport);
// Delete an import
ImportRoutes.delete('/import/:id', deleteImport);

module.exports = ImportRoutes;