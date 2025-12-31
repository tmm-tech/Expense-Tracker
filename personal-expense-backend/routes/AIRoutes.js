const { getInsights } = require("../controller/AIControllers");
const { requireAuth } = require("../middleware/auth");
const AIRoutes = require("express").Router();

AIRoutes.post("/insights", requireAuth, getInsights);

module.exports = AIRoutes;
