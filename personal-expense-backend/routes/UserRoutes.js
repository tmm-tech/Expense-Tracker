const express = require("express");
const UserRoutes = express.Router();
const {
  createSession,
  getCurrentUser,
  updateSettings,
} = require("../controller/UserControllers");
const { requireAuth } = require("../middleware/auth");

// Create and insert a new user session
UserRoutes.post("/sync", requireAuth, createSession);
UserRoutes.get("/current", requireAuth, getCurrentUser);
UserRoutes.put("/settings", requireAuth, updateSettings);
module.exports = UserRoutes;
