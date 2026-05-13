const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const {
  getWalletBalance,
  getWalletTransactions,
  requestRefund
} = require("../controllers/walletController");

router.get("/balance", verifyToken, getWalletBalance);
router.get("/transactions", verifyToken, getWalletTransactions);
router.post("/refund/request", verifyToken, requestRefund);

module.exports = router;

