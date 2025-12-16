const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Example controller methods
const importExpenses = async (req, res) => {
    try {
        const { expenses } = req.body;
        
        const result = await prisma.expense.createMany({
            data: expenses,
        });
        
        res.status(201).json({ 
            message: 'Expenses imported successfully', 
            data: result 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getImportStatus = async (req, res) => {
    try {
        const count = await prisma.expense.count();
        res.status(200).json({ totalExpenses: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    importExpenses,
    getImportStatus,
};