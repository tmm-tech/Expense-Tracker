require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const BudgetRoutes = require("./routes/BudgetRoutes");
const BillRoutes = require("./routes/BillRoutes");
const UserRoutes = require("./routes/UserRoutes");
const TransactionRoutes = require("./routes/TransactionRoutes");
const AccountsRoutes = require("./routes/AccountRoutes");
const CategoryRoutes = require("./routes/CategoryRoutes");
const InvestmentRoutes = require("./routes/InvestmentRoutes");
const GoalRoutes = require("./routes/GoalRoutes");
const AlertRoutes = require("./routes/AlertRoutes");
const DebtRoutes = require("./routes/DebtRoutes");
const AIRoutes = require("./routes/AIRoutes");
const CalendarRoutes = require("./routes/CalendarRoutes");
const savingsChallengesRoutes = require("./routes/savingsChallengesRoutes");
const RecurringTransactionRoutes = require("./routes/RecurringRoutes");

const express = require("express");
const cors = require("cors");
const app = express();
// Middleware to parse cookies
app.use(cookieParser());

const allowedOrigins = [
  "https://aurex-expense-tracker.vercel.app",
  "http://localhost:5173", // dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Route handling
app.use("/api", BudgetRoutes);
app.use("/api/debts", DebtRoutes);
app.use("/api", TransactionRoutes);
app.use("/api", UserRoutes);
app.use("/api", AccountsRoutes);
app.use("/api", BillRoutes);
app.use("/api", CategoryRoutes);
app.use("/api/goals", GoalRoutes);
app.use("/api/investments", InvestmentRoutes);
app.use("/api/alerts", AlertRoutes);
app.use("/api/ai", AIRoutes);
app.use("/api", CalendarRoutes);
app.use("/api/savings-challenges", savingsChallengesRoutes);
app.use("/api/recurring-transactions", RecurringTransactionRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Confirmed Connection to Aurex Expense Tracker" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});

// Server setup
const port = process.env.PORT || 4080;
app.listen(port, () => {
  console.log(`Authentication Server Listening on port: ${port}`);
});
