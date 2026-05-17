const express = require("express");
const router = express.Router();

const {
  notifyWhenFull,
  getNotifyRequestsForLocation,
  checkAndNotifyAvailability
} = require("../controllers/parkingAvailabilityController");

const { verifyToken } = require("../middleware/authMiddleware");

// Create a notify request when parking is full (or user wants future notifications)
router.post("/notify", verifyToken, notifyWhenFull);

// (Optional) check existing requests (for frontend UX)
router.get("/notify/:parking_location_id", verifyToken, getNotifyRequestsForLocation);

// Cron/automation endpoint: scan requests and send if any slot becomes available
router.post("/check", verifyToken, checkAndNotifyAvailability);

module.exports = router;

