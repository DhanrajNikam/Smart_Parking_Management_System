const express = require("express");
const router = express.Router();

const { makePayment } = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/pay", verifyToken, makePayment);

module.exports = router;