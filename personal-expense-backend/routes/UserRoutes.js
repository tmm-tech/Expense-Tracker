const express = require('express');
const   UserRoutes = express.Router();
const { createSession } = require('../controller/UserControllers');
import { requireAuth } from '../middleware/auth';

// Create and insert a new user session
UserRoutes.post('/sync', requireAuth, createSession);

module.exports = UserRoutes;