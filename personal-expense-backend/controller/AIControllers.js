const { prisma } = require("../src/lib/prism");
const { openai } = require("../src/lib/openai.js");
/**
 * NOTE:
 * req.user.id is assumed to be set by auth middleware
 */

module.exports = {
  getInsights: async (req, res) => {
    try {
      const userId = req.user.sub;

      // 1️⃣ Fetch minimal financial data
      const [transactions, budgets, accounts] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          take: 50,
          orderBy: { date: "desc" },
        }),
        prisma.budget.findMany({ where: { userId } }),
        prisma.account.findMany({ where: { userId } }),
      ]);

      if (!transactions.length) {
        return res.json({
          success: true,
          insights: [
            {
              type: "info",
              message:
                "You don’t have enough data yet. Add transactions to unlock AI insights.",
            },
          ],
        });
      }

      // 2️⃣ Prepare compact prompt (VERY IMPORTANT)
      const prompt = `
You are a personal finance assistant.

Analyze the user's financial data and give 3–5 concise insights.
Focus on:
- Spending patterns
- Budget risks
- Cash flow health
- Actionable advice

Transactions:
${transactions.map((t) => `• ${t.type} - ${t.amount}`).join("\n")}

Budgets:
${budgets.map((b) => `• Limit: ${b.limit}`).join("\n")}

Accounts:
${accounts.map((a) => `• ${a.name}: ${a.balance}`).join("\n")}

Respond as bullet points.
`;

      // 3️⃣ Call OpenAI
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: [
          { role: "system", content: "You are a financial advisor." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      });

      const content = completion.choices[0].message.content;

      res.json({
        success: true,
        insights: content
          .split("\n")
          .filter(Boolean)
          .map((msg) => ({
            type: "ai",
            message: msg.replace(/^[-•]\s*/, ""),
          })),
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
