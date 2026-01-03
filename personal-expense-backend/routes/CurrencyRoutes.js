
const CurrencyRoutes = require('express').Router()
const { getCurrencies, getExchangeRate, convertCurrency} = require("../controllers/currencyController");
const { requireAuth } = require("../middleware/auth");


CurrencyRoutes.use(requireAuth);
CurrencyRoutes.get("/", getCurrencies);
CurrencyRoutes.get("/exchange-rate", getExchangeRate);
CurrencyRoutes.get("/convert", convertCurrency);

module.exports = CurrencyRoutes;
