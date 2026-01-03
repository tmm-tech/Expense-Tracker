const savingsChallengesRoutes = require("express").Router();
const { getChallenges, getSummary } = require("../controller/savingsChallengesControllers");
const { requireAuth } = require("../middleware/auth");


savingsChallengesRoutes.use(requireAuth);
savingsChallengesRoutes.get("/", getChallenges);
savingsChallengesRoutes.get("/summary", getSummary);

module.exports = savingsChallengesRoutes;