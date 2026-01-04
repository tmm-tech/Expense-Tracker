const NetWorthRoutes = require("express").Router();
const {getTrend, getSnapshots} = require("../controller/NetWorthController");
const {requireAuth} = require("../middleware/auth");

NetWorthRoutes.use(requireAuth);
NetWorthRoutes.get("/trend", getTrend);
NetWorthRoutes.get("/snapshots", getSnapshots);

module.exports = NetWorthRoutes;
