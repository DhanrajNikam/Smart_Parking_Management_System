const express = require("express");
const router = express.Router();

const { generateQrForBooking, validateQr } = require("../controllers/qrController");

const { verifyToken } = require("../middleware/authMiddleware");

// Generate QR for a booking
// NOTE: In this system, this endpoint is for the logged-in user to generate their own entry/exit QR.
router.post("/generate/:bookingId", verifyToken, generateQrForBooking);

// Validate QR for entry/exit by security guard (usually no user auth)
// For demo, we allow validate without verifyToken, but we still require booking QR token in body.
router.post("/validate", validateQr);

module.exports = router;

