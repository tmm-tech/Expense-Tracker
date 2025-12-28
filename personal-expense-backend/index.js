const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const BudgetRoutes = require('./routes/BudgetRoutes');
const BillRoutes = require('./routes/BillRoutes');
const UserRoutes = require('./routes/UserRoutes');
const TransactionRoutes = require('./routes/TransactionRoutes');
const AccountsRoutes = require('./routes/AccountRoutes');
const CategoryRoutes = require('./routes/CategoryRoutes');
const InvestmentRoutes = require('./routes/InvestmentRoutes');
const GoalRoutes = require('./routes/GoalRoutes');
const AlertRoutes = require('./routes/AlertRoutes');
const DebtRoutes = require('./routes/DebtRoutes');
const app = express(); 



// Middleware to parse cookies
app.use(cookieParser());

const allowedOrigins = [
    'https://aurex-expense-tracker.vercel.app/',
    'http://localhost:5173'
];


const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};

// CORS configuration
app.use(cors(corsOptions));


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
app.use('/api', BudgetRoutes);
app.use('/api/debts', DebtRoutes);
app.use('/api', TransactionRoutes);
app.use('/api', UserRoutes);
app.use('/api', AccountsRoutes);
app.use('/api', BillRoutes);
app.use('/api', CategoryRoutes);
app.use('/api/goals', GoalRoutes);
app.use('/api/investments', InvestmentRoutes)
app.use('/api/alerts', AlertRoutes)
app.get('/', (req, res) => {
    res.json({ message: "Confirmed Connection to Aurex Expense Tracker" });
});


// Server setup
const port = process.env.PORT || 4080;
app.listen(port, () => {
    console.log(`Authentication Server Listening on port: ${port}`);
});
