const AlertRoutes = require('express').Router();

const {requireAuth} = require("../middleware/auth");
const AlertControllers = require("../controller/AlertControllers");

AlertRoutes.use(requireAuth);

AlertRoutes.get("/", AlertControllers.getAlerts);
AlertRoutes.post("/:id/read", AlertControllers.markAsRead);
AlertRoutes.post("/read-all", AlertControllers.markAllAsRead);
AlertRoutes.post("/run-checks", AlertControllers.runChecks);

module.exports = AlertRoutes;
