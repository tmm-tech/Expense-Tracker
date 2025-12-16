const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(id) },
        });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create transaction
exports.createTransaction = async (req, res) => {
    try {
        const { amount, category, description, type } = req.body;
        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                category,
                description,
                type,
            },
        });
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, category, description, type } = req.body;
        const transaction = await prisma.transaction.update({
            where: { id: parseInt(id) },
            data: {
                amount: amount ? parseFloat(amount) : undefined,
                category,
                description,
                type,
            },
        });
        res.status(200).json(transaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.transaction.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};