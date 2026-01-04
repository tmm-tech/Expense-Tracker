const NetWorthRoutes = require("express").Router();
const {getTrend, getSnapshots} = require("../controller/NetWorthController");
const {requireAuth} = require("../middleware/auth");

NetWorthRoutes.get("/trend", requireAuth, getTrend);
NetWorthRoutes.get("/snapshots", requireAuth, getSnapshots);

module.exports = NetWorthRoutes;
