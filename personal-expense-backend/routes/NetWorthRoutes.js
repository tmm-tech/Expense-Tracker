const NetWorthRoutes = require("express").Router();
const {getTrend, getSnapshots} = require("../controller/NetWorthController");
const {requireAuth} = require("../middleware/auth");

NetWorthRoutes.get("/net-worth/trend", requireAuth, getTrend);
NetWorthRoutes.get("/net-worth/snapshots", requireAuth, getSnapshots);

module.exports = NetWorthRoutes;
