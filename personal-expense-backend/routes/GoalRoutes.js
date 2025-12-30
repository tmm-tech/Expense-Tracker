const express = require("express");
const GoalRoutes = express.Router();

const { requireAuth } = require("../middleware/auth");
const {getGoals, createGoal, updateGoal, deleteGoal, contributeToGoal} = require("../controller/GoalControllers");

GoalRoutes.use(requireAuth);

GoalRoutes.get("/",getGoals);
GoalRoutes.post("/", createGoal);
GoalRoutes.put("/:id", updateGoal);
GoalRoutes.delete("/:id", deleteGoal);

GoalRoutes.post("/:id/contribute", contributeToGoal);

module.exports = GoalRoutes;