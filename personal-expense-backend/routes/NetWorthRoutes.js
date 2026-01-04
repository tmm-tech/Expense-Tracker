const NetWorthRoutes = require("express").Router();
const {getTrend, getSnapshots, getCurrent, createSnapshot} = require("../controller/NetWorthController");
const {requireAuth} = require("../middleware/auth");

NetWorthRoutes.use(requireAuth);

NetWorthRoutes.get("/trend", getTrend);
NetWorthRoutes.get("/snapshots", getSnapshots);
NetWorthRoutes.post("/snapshots", createSnapshot);
NetWorthRoutes.get("/current", getCurrent);


module.exports = NetWorthRoutes;
