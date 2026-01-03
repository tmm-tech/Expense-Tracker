const axios = require("axios");

const CURRENCIES_URL = "https://currencyapi.net/api/v1/currencies";
const RATES_URL = "https://currencyapi.net/api/v1/rates";
const API_KEY = process.env.CURRENCY_API_KEY || "7613d5d5a5f2a7bfd7a968fa45324b6384bb";

module.exports = {
  // GET /api/currencies
  getCurrencies: async (req, res) => {
    try {
      const response = await axios.get(CURRENCIES_URL, {
        params: { output: "json", key: API_KEY },
      });

      const currencies = Object.entries(response.data.currencies).map(([code, name]) => ({
        code,
        name,
      }));

      res.json(currencies);
    } catch (error) {
      res.status(error.response?.status || 500).json({ message: "Failed to fetch currencies" });
    }
  },

  // GET /api/currencies/exchange-rate?from=KES&to=USD
  getExchangeRate: async (req, res) => {
    try {
      const { from, to } = req.query;

      const response = await axios.get(RATES_URL, {
        params: { base: from, output: "json", key: API_KEY },
      });

      const rate = response.data.rates[to];
      if (!rate) return res.status(400).json({ message: "Invalid currency code" });

      res.json({ rate });
    } catch (error) {
      res.status(error.response?.status || 500).json({ message: "Failed to fetch exchange rate" });
    }
  },

  // GET /api/currencies/convert?amount=1000&from=KES&to=USD
  convertCurrency: async (req, res) => {
    try {
      const { amount, from, to } = req.query;

      const response = await axios.get(RATES_URL, {
        params: { base: from, output: "json", key: API_KEY },
      });

      const rate = response.data.rates[to];
      if (!rate) return res.status(400).json({ message: "Invalid currency code" });

      const converted = Number(amount) * rate;
      res.json({ converted, rate });
    } catch (error) {
      res.status(error.response?.status || 500).json({ message: "Failed to convert currency" });
    }
  },
};