// controllers/currencyController.js
const { prisma } = require("../src/lib/prism");

// Mock external rates provider or DB table
async function getRate(from, to) {
  // Example: fetch from DB or external API
  const fromCurrency = await prisma.currency.findUnique({ where: { code: from } });
  const toCurrency = await prisma.currency.findUnique({ where: { code: to } });

  if (!fromCurrency || !toCurrency) throw new Error("Invalid currency code");

  // Convert via USD baseline
  const rate = toCurrency.rateToUSD / fromCurrency.rateToUSD;
  return rate;
}

module.exports = {
  // GET /currencies
  getCurrencies: async (req, res) => {
    try {
      const currencies = await prisma.currency.findMany();
      res.json(currencies);
    } catch (err) {
      console.error("Get currencies error:", err);
      res.status(500).json({ message: "Failed to fetch currencies" });
    }
  },

  // GET /currencies/exchange-rate?from=XXX&to=YYY
  getExchangeRate: async (req, res) => {
    try {
      const { from, to } = req.query;
      const rate = await getRate(from, to);
      res.json({ rate });
    } catch (err) {
      console.error("Exchange rate error:", err);
      res.status(400).json({ message: err.message });
    }
  },

  // GET /currencies/convert?amount=NNN&from=XXX&to=YYY
  convertCurrency: async (req, res) => {
    try {
      const { amount, from, to } = req.query;
      const rate = await getRate(from, to);
      const converted = Number(amount) * rate;
      res.json(converted);
    } catch (err) {
      console.error("Convert error:", err);
      res.status(400).json({ message: err.message });
    }
  },
};