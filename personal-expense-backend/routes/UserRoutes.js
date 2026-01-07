const express = require("express");
const UserRoutes = express.Router();
const {
  createSession,
  getCurrentUser,
  updateSettings,
  getPreferences,
  getNotifications,
  getMe,
} = require("../controller/UserControllers");
const { requireAuth } = require("../middleware/auth");

// Create and insert a new user session
UserRoutes.post("/sync", requireAuth, createSession);
UserRoutes.get("/current", requireAuth, getCurrentUser);
UserRoutes.put("/settings", requireAuth, updateSettings);
UserRoutes.get("/me/", requireAuth, getMe);
UserRoutes.put("/me/preferences", requireAuth, getPreferences);
UserRoutes.put("/me/notifications", requireAuth, getNotifications);

module.exports = UserRoutes;
