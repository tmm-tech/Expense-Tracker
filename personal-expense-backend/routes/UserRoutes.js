const express = require('express');
const   UserRoutes = express.Router();
const { createSession } = require('../controller/UserControllers');
const {requireAuth} = require("../middleware/auth");

// Create and insert a new user session
UserRoutes.post('/users/sync', requireAuth, createSession);

module.exports = UserRoutes;