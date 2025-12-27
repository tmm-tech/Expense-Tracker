const express = require("express");
const BillRoutes = express.Router();

const { requireAuth } = require("../middleware/auth");
const BillControllers = require("../controllers/BillControllers");

// Protect all bill routes
BillRoutes.use(requireAuth);

// GET
BillRoutes.get("/bills", BillControllers.getBills);

// POST
BillRoutes.post("/bills", BillControllers.createBill);

// PUT
BillRoutes.put("/bills/:id", BillControllers.updateBill);

// DELETE
BillRoutes.delete("/bills/:id", BillControllers.deleteBill);

// MARK AS PAID
BillRoutes.post("/bills/:id/pay", BillControllers.markBillPaid);

module.exports = BillRoutes;