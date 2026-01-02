const {
  getTransactionsByUser,
  getBillsByUser,
  getDebtsByUser,
  getGoalsByUser,
  getBudgetsByUser,
  getRecurringTransactionsByUser
} = require("../services/service");
/**
 * All Calendar operations are user-scoped
 * req.user.sub comes from Supabase JWT
 */

module.exports = {
  // GET /api/debts
  FetchCalendar: async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Missing date range" });
    }

    const start = Number(startDate);
    const end = Number(endDate);

    // Fetch data (examples – adapt to your DB layer)
    const transactions = await getTransactionsByUser(req.user.id);
    const bills = await getBillsByUser(req.user.id);
    const debts = await getDebtsByUser(req.user.id);
    const goals = await getGoalsByUser(req.user.id);
    const budgets = await getBudgetsByUser(req.user.id);
    const recurringTransactions = await getRecurringTransactionsByUser(req.user.id);

    const events = [];

    // --- TRANSACTIONS ---
    for (const t of transactions) {
      const date = new Date(t.date).getTime();
      if (date >= start && date <= end) {
        events.push({
          id: t.id,
          type: "transaction",
          date,
          title: t.description,
          amount: t.amount,
          category: t.category,
          status: t.type,
          color: t.type === "income" ? "#10b981" : "#ef4444",
        });
      }
    }

    // --- BILLS ---
    for (const bill of bills) {
      const due = new Date(bill.dueDay).getTime();
      if (due >= start && due <= end) {
        events.push({
          id: bill.id,
          type: "bill",
          date: due,
          title: bill.name,
          amount: bill.amount,
          status: bill.status,
          color:
            bill.status === "paid"
              ? "#10b981"
              : bill.status === "overdue"
              ? "#ef4444"
              : "#f59e0b",
        });
      }
    }

    // --- Goals ---
    for (const goal of goals) {
      const deadline = new Date(goal.endDate).getTime();

      if (deadline >= start && deadline <= end) {
        events.push({
          id: goal.id,
          type: "goal",
          date: deadline,
          title: `Goal: ${goal.name}`,
          amount: goal.targetAmount,
          category: goal.category,
          status: goal.status,
          color: goal.status === "completed" ? "#10b981" : "#3b82f6",
          metadata: {
            progress: goal.currentAmount,
            status: goal.status,
          },
        });
      }
    }

    // --- Debts ---
    for (const debt of debts) {
      if (debt.status !== "active") continue;

      const now = new Date();
      let paymentDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        debt.dueDay
      );

      // If this month's due date passed → next month
      if (paymentDate.getTime() < now.getTime()) {
        paymentDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          debt.dueDay
        );
      }

      const ts = paymentDate.getTime();

      if (ts >= start && ts <= end) {
        events.push({
          id: debt.id,
          type: "debt",
          date: ts,
          title: `Debt Payment: ${debt.name}`,
          amount: debt.minimumPayment,
          category: "Debt",
          status: "upcoming",
          color: "#f59e0b",
          metadata: {
            balance: debt.currentBalance,
          },
        });
      }
    }

    // --- Budgets ---
    for (const budget of budgets) {
      const monthStart = new Date(start);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const ts = monthStart.getTime();

      if (ts >= start && ts <= end) {
        events.push({
          id: `${budget.id}-period`,
          type: "budget",
          date: ts,
          title: `Budget Period: ${budget.category}`,
          amount: budget.limit,
          category: budget.category,
          status: "period-start",
          color: "#6366f1",
          metadata: {
            period: budget.period,
          },
        });
      }
    }

    // --- Recurring ---
    for (const recurring of recurringTransactions) {
      if (!recurring.isActive) continue;

      let currentDate = new Date(recurring.startDate).getTime();
      const recurringEnd = recurring.endDate
        ? new Date(recurring.endDate).getTime()
        : null;

      while (currentDate <= end) {
        if (currentDate >= start) {
          events.push({
            id: `${recurring.id}-${currentDate}`,
            type: "recurring",
            date: currentDate,
            title: `${recurring.description} (Recurring)`,
            amount: recurring.amount,
            category: recurring.category,
            status: recurring.type,
            color: recurring.type === "income" ? "#8b5cf6" : "#ec4899",
            metadata: {
              frequency: recurring.frequency,
              type: recurring.type,
            },
          });
        }

        const next = new Date(currentDate);

        switch (recurring.frequency) {
          case "daily":
            next.setDate(next.getDate() + 1);
            break;
          case "weekly":
            next.setDate(next.getDate() + 7);
            break;
          case "monthly":
            next.setMonth(next.getMonth() + 1);
            break;
          case "yearly":
            next.setFullYear(next.getFullYear() + 1);
            break;
        }

        currentDate = next.getTime();

        if (recurringEnd && currentDate > recurringEnd) break;
      }
    }

    events.sort((a, b) => a.date - b.date);

    res.json({ success: true, data: events });
  },
};
