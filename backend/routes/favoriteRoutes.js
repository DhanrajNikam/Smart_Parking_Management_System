const express = require("express");
const router = express.Router();

const {
  addFavorite,
  removeFavorite,
  getFavorites
} = require("../controllers/favoriteController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/add", verifyToken, addFavorite);
router.delete("/remove/:location_id", verifyToken, removeFavorite);
router.get("/my", verifyToken, getFavorites);

module.exports = router;