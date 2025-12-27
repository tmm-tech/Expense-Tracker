const express = require('express');
const   UserRoutes = express.Router();
const { createSession } = require('../controller/UserControllers');
import { authMiddleware } from '../middleware/auth';

// Create and insert a new user session
UserRoutes.post('/sync', createSession);

module.exports = UserRoutes;