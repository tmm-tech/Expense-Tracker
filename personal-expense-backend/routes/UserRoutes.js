const express = require('express');
const   UserRoutes = express.Router();
const { createSession } = require('../controller/UserControllers');


// Create and insert a new user session
UserRoutes.post('/sync', createSession);

module.exports = UserRoutes;