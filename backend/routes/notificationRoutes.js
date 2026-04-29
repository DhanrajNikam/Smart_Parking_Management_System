const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead
} = require("../controllers/notificationController");

const { verifyToken } = require("../middleware/authMiddleware");

router.get("/my", verifyToken, getNotifications);
router.put("/read/:id", verifyToken, markAsRead);

module.exports = router;