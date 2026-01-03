const axios = require("axios");
const { prisma } = require("../src/lib/prism");

const CURRENCY_API_URL = "https://currencyapi.net/api/v1";
const CURRENCY_API_KEY = process.env.CURRENCY_API_KEY; // store securely in .env

module.exports = {
  /**
   * GET /api/currencies
   * Fetch available currencies from public API
   */
  getCurrencies: async (req, res) => {
    try {
      const response = await axios.get(`${CURRENCY_API_URL}/currencies`, {
        params: { apikey: CURRENCY_API_KEY },
      });

      const currencies = response.data.data; // API returns codes + names
      res.json(Object.values(currencies));
    } catch (error) {
      console.error("Get currencies error:", error.message);
      res.status(500).json({ message: "Failed to fetch currencies" });
    }
  },

  /**
   * GET /api/currencies/exchange-rate?from=XXX&to=YYY
   * Fetch exchange rate between two currencies from public API
   */
  getExchangeRate: async (req, res) => {
    try {
      const { from, to } = req.query;

      const response = await axios.get(`${CURRENCY_API_URL}/latest`, {
        params: { apikey: CURRENCY_API_KEY, base_currency: from, currencies: to },
      });

      const rate = response.data.data[to].value;
      res.json({ rate });
    } catch (error) {
      console.error("Exchange rate error:", error.message);
      res.status(400).json({ message: "Invalid currency code" });
    }
  },

  /**
   * GET /api/currencies/convert?amount=NNN&from=XXX&to=YYY
   * Convert amount using public API
   */
  convertCurrency: async (req, res) => {
    try {
      const { amount, from, to } = req.query;

      const response = await axios.get(`${CURRENCY_API_URL}/latest`, {
        params: { apikey: CURRENCY_API_KEY, base_currency: from, currencies: to },
      });

      const rate = response.data.data[to].value;
      const converted = Number(amount) * rate;

      res.json(converted);
    } catch (error) {
      console.error("Convert error:", error.message);
      res.status(400).json({ message: "Invalid currency code" });
    }
  },
};