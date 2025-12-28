const AlertRoutes = require('express').Router();

const {requireAuth} = require("../middleware/auth");
const { getAlerts, markAllAsRead, runChecks, markAsRead} = require('../controller/AlertControllers');
AlertRoutes.use(requireAuth);

AlertRoutes.get("/", getAlerts);
AlertRoutes.post("/:id/read", markAsRead);
AlertRoutes.post("/read-all", markAllAsRead);
AlertRoutes.post("/run-checks", runChecks);

module.exports = AlertRoutes;
