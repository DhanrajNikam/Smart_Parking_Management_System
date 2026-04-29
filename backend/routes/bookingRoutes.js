const express = require("express");
const router = express.Router();

const {
  createBooking,
  cancelBooking,
  extendBooking,
  getUserBookings
} = require("../controllers/bookingController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/create", verifyToken, createBooking);
router.put("/cancel/:id", verifyToken, cancelBooking);
router.put("/extend/:id", verifyToken, extendBooking);
router.get("/my", verifyToken, getUserBookings);

module.exports = router;