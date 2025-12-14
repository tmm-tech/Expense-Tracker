import express from "express";
import prisma from "../prisma.js";

const DashboardRoutes = express.Router();

/* Load layout */
DashboardRoutes.get("/layout", async (req, res) => {
  const layout = await prisma.dashboardLayout.findFirst({
    where: { userId: req.user.id },
  });
  res.json(layout?.layout || null);
});

/* Save layout */
DashboardRoutes.post("/layout", async (req, res) => {
  const { layout } = req.body;

  const saved = await prisma.dashboardLayout.upsert({
    where: { userId: req.user.id },
    update: { layout },
    create: { userId: req.user.id, layout },
  });

  res.json(saved);
});

export default DashboardRoutes;