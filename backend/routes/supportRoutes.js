const express = require("express");
const router = express.Router();

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const supportController = require("../controllers/supportController");


// User: create ticket
router.post("/tickets", verifyToken, supportController.createTicket);

// User: list tickets
router.get("/my-tickets", verifyToken, supportController.getMyTickets);

// Admin: list all tickets
router.get("/tickets", verifyToken, verifyAdmin, supportController.getAllTickets);

// Admin: reply to ticket
router.post(
  "/tickets/:id/reply",
  verifyToken,
  verifyAdmin,
  supportController.replyToTicket
);

// Admin: update status
router.put(
  "/tickets/:id/status",
  verifyToken,
  verifyAdmin,
  supportController.updateTicketStatus
);

module.exports = router;

