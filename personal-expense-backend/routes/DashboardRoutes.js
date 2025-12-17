import { getInsights, getLayout, getSummary, saveLayout } from "../controller/DashboardControllers.js";
import auth from "../middleware/auth.js";

const DashboardRoutes = require('express').Router();

/* Layout */
DashboardRoutes.get("/layout", auth, getLayout);
DashboardRoutes.post("/layout", auth, saveLayout);

/* Data */
DashboardRoutes.post("/summary", auth, getSummary);
DashboardRoutes.post("/insights", auth, getInsights);


module.exports = DashboardRoutes;