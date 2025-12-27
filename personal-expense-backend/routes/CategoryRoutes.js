const CategoryRoutes = require('express').Router()
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../controller/CategoryControllers')
// Create and insert a new category
CategoryRoutes.post('/categories', createCategory)
// Read all categories
CategoryRoutes.get('/categories', getCategories)
// Read a specific category by ID
CategoryRoutes.get('/categories/:id', getCategoryById)
// Update a category by ID
CategoryRoutes.put('/categories/:id', updateCategory)
// Delete a category by ID
CategoryRoutes.delete('/categories/:id', deleteCategory)

module.exports = CategoryRoutes