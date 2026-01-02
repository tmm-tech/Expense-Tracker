const CalendarRoutes = require('express').Router()
const {
FetchCalendar,
} = require('../controller/CalendarControllers')
const {requireAuth} = require("../middleware/auth");
// Fetch Calendar Data
CalendarRoutes.post('/calendar', requireAuth, FetchCalendar)

module.exports = CalendarRoutes