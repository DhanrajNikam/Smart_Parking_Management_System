const express = require("express");
const router = express.Router();

const { addRating, getLocationRating } = require("../controllers/ratingController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/add", verifyToken, addRating);
router.get("/location/:location_id", getLocationRating);

module.exports = router;