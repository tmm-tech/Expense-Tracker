const express = require('express');
const   UserRoutes = express.Router();
const { createSession } = require('../controller/UserControllers');
import { authMiddleware } from "../middleware/auth.js";

// Create and insert a new user session
UserRoutes.post('/sync', authMiddleware, createSession);

module.exports = UserRoutes;