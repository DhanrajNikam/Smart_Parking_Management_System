const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/dashboard", verifyToken, getDashboard);

module.exports = router;