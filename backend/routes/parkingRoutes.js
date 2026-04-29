const express = require("express");
const router = express.Router();

const {
  getAllLocations,
  getLocationById,
  getSlotsByLocation,
  addParkingLocation,
  addSlot,
  getNearbyParking,
  rateParking,
  getLocationReviews,
  updateSlotStatus,
  removeSlot
} = require("../controllers/parkingController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

router.get("/", getAllLocations);
router.get("/nearby", getNearbyParking);
router.get("/:id/reviews", getLocationReviews);
router.get("/:id", getLocationById);
router.get("/:id/slots", getSlotsByLocation);

router.post("/add-location", verifyToken, verifyAdmin, addParkingLocation);
router.post("/add-slot", verifyToken, verifyAdmin, addSlot);
router.put("/slot-status", verifyToken, verifyAdmin, updateSlotStatus);
router.delete("/remove-slot", verifyToken, verifyAdmin, removeSlot);
router.post("/rate", verifyToken, rateParking);

module.exports = router;
