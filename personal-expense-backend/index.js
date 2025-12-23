const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const BudgetRoutes = require('./routes/BudgetRoutes');
const DashboardRoutes = require('./routes/DashboardRoutes');
const ImportRoutes = require('./routes/ImportRoutes');
const TransactionRoutes = require('./routes/TransactionRoutes');
 


const app = express(); 
app.use(cors());


// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware to add token to the request
const addTokenToRequest = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer ' from the beginning
        try {
            const decodedToken = await jwt.verify(token, process.env.SECRET);
            req.token = decodedToken;
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
    }
    next();
};

app.use(addTokenToRequest);

// // Route handling
app.use('/budgets', BudgetRoutes);
app.use('/dashboard', DashboardRoutes);
app.use('/import', ImportRoutes);
app.use('/transactions', TransactionRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Confirmed Connection to Aurex Expense Tracker" });
});


// Server setup
const port = process.env.PORT || 4080;
app.listen(port, () => {
    console.log(`Authentication Server Listening on port: ${port}`);
});
