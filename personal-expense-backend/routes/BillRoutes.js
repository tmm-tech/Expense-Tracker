const express = require("express");
const BillRoutes = express.Router();

const {requireAuth} = require("../middleware/auth");
const {
    getBills,
    createBill,
    updateBill,
    deleteBill,
    markBillPaid
} =  require("../controller/BillControllers");
// Protect all bill routes
BillRoutes.use(requireAuth);

// GET
BillRoutes.get("/bills", getBills);

// POST
BillRoutes.post("/bills", createBill);

// PUT
BillRoutes.put("/bills/:id", updateBill);

// DELETE
BillRoutes.delete("/bills/:id", deleteBill);

// MARK AS PAID
BillRoutes.post("/bills/:id/pay", markBillPaid);

module.exports = BillRoutes;