const NetWorthRoutes = require("express").Router();
const {getTrend, getSnapshots, getCurrent} = require("../controller/NetWorthController");
const {requireAuth} = require("../middleware/auth");

NetWorthRoutes.use(requireAuth);

NetWorthRoutes.get("/trend", getTrend);
NetWorthRoutes.get("/snapshots", getSnapshots);
NetWorthRoutes.get("/current", getCurrent);


module.exports = NetWorthRoutes;
