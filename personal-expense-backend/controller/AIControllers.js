const { prisma } = require("../src/lib/prism");
const { openai } = require("../src/lib/openai.js");

module.exports = {
  getInsights: async (req, res) => {
    try {
      const userId = req.user.sub;

      /* ---------------- FETCH DATA ---------------- */
      const [transactions, budgets, accounts, investments] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          orderBy: { date: "desc" },
        }),
        prisma.budget.findMany({ where: { userId } }),
        prisma.account.findMany({ where: { userId } }),
        prisma.investment.findMany({ where: { userId } }),
      ]);

      /* ---------------- GUARD: NOT ENOUGH DATA ---------------- */
      if (transactions.length < 5) {
        return res.json({
          success: true,
          insights: [
            {
              type: "info",
              message:
                "Add at least a few more transactions to unlock meaningful AI insights.",
            },
          ],
        });
      }

      /* ---------------- COMPUTE SUMMARY (NO AI) ---------------- */
      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);

      const balance = totalIncome - totalExpense;

      const totalInvested = investments.reduce(
        (s, i) => s + i.quantity * i.purchasePrice,
        0,
      );

      const currentValue = investments.reduce(
        (s, i) => s + i.quantity * i.currentPrice,
        0,
      );

      const investmentReturn = currentValue - totalInvested;
      const returnPercentage =
        totalInvested > 0
          ? ((investmentReturn / totalInvested) * 100).toFixed(2)
          : "0.00";

      /* ---------------- COMPACT DATA FOR AI ---------------- */
      const compactTransactions = transactions.slice(0, 40).map((t) => ({
        type: t.type,
        amount: t.amount,
      }));

      const compactAccounts = accounts.map((a) => ({
        name: a.name,
        balance: a.balance,
      }));

      /* ---------------- AI PROMPT (STRICT JSON) ---------------- */
      const prompt = `
You are a personal finance assistant.

Analyze the data and return 3–5 insights.

RULES:
- Output MUST be valid JSON
- NO markdown
- NO explanations outside JSON
- Keep each message concise (1–2 sentences)
- Use types: "ai" | "warning" | "success"

JSON FORMAT:
{
  "insights": [
    { "type": "ai", "message": "..." }
  ]
}

DATA:
Transactions: ${JSON.stringify(compactTransactions)}
Accounts: ${JSON.stringify(compactAccounts)}
Budgets: ${budgets.length}
Investments: ${investments.length}
`;

      /* ---------------- OPENAI CALL ---------------- */
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: "You are a careful financial analyst." },
          { role: "user", content: prompt },
        ],
      });

      let parsed;
      try {
        parsed = JSON.parse(completion.choices[0].message.content);
      } catch {
        return res.json({
          success: true,
          insights: [
            {
              type: "info",
              message:
                "We couldn’t generate structured insights this time. Try again later.",
            },
          ],
        });
      }

      /* ---------------- FINAL RESPONSE ---------------- */
      res.json({
        success: true,
        insights: parsed.insights,
        summary: {
          totalIncome,
          totalExpense,
          balance,
          totalInvested,
          currentValue,
          investmentReturn,
          returnPercentage,
          transactionCount: transactions.length,
          budgetCount: budgets.length,
          investmentCount: investments.length,
        },
      });
    } catch (error) {
      console.error("AI Insights error:", error);
      res.status(500).json({
        success: false,
        message: "AI insights failed",
      });
    }
  },
};