const express = require("express");
const GoalRoutes = express.Router();

const { requireAuth } = require("../middleware/auth");
const GoalControllers = require("../controller/GoalControllers");

GoalRoutes.use(requireAuth);

GoalRoutes.get("/", GoalControllers.getGoals);
GoalRoutes.post("/", GoalControllers.createGoal);
GoalRoutes.put("/:id", GoalControllers.updateGoal);
GoalRoutes.delete("/:id", GoalControllers.deleteGoal);

GoalRoutes.post("/:id/contribute", GoalControllers.contributeToGoal);

module.exports = GoalRoutes;