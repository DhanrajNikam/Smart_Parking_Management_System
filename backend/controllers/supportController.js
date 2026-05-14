const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const ISSUE_TYPES = [
  "Booking Issue",
  "Refund Issue",
  "Payment Issue",
  "Slot/Parking Issue",
  "Emergency Issue",
];

const STATUS_VALUES = ["open", "pending", "resolved"];

const generateTicketCode = () => {
  // Example: TCK-3F2A9C
  const code = uuidv4().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `TCK-${code}`;
};

const validateIssueType = (issue_type) =>
  ISSUE_TYPES.includes(issue_type);

exports.createTicket = async (req, res) => {
  const user_id = req.user.id;
  const { booking_id = null, subject, issue_type, message } = req.body;

  try {
    if (!subject || !issue_type || !message) {
      return res.status(400).json({ message: "subject, issue_type and message are required" });
    }

    if (!validateIssueType(issue_type)) {
      return res.status(400).json({ message: "Invalid issue_type" });
    }

    const ticket_code = generateTicketCode();

    const [result] = await db.promise().query(
      `INSERT INTO support_tickets
        (ticket_code, user_id, booking_id, subject, issue_type, message, status, admin_reply)
       VALUES
        (?, ?, ?, ?, ?, ?, 'open', '')`,
      [ticket_code, user_id, booking_id, subject, issue_type, message]
    );

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: {
        id: result.insertId,
        ticket_code,
        user_id,
        booking_id,
        subject,
        issue_type,
        message,
        status: "open",
      },
    });
  } catch (error) {
    console.log("createTicket error:", error);
    // If ticket_code collision ever happens
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Ticket code collision. Please try again." });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const buildTicketFilters = (filters) => {
  const where = [];
  const values = [];

  if (filters.status) {
    where.push("st.status = ?");
    values.push(filters.status);
  }

  if (filters.search) {
    where.push("(st.ticket_code LIKE ? OR st.subject LIKE ? OR st.issue_type LIKE ?)");
    const s = `%${filters.search}%`;
    values.push(s, s, s);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, values };
};

exports.getMyTickets = async (req, res) => {
  const user_id = req.user.id;
  const { status, search, page = 1, limit = 10 } = req.query;

  try {
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
    const offset = (pageNum - 1) * limitNum;

    const { whereSql, values } = buildTicketFilters({ status, search });

    const [countRows] = await db.promise().query(
      `SELECT COUNT(*) as total
         FROM support_tickets st
         ${whereSql}
        `,
      values
    );

    const total = countRows[0]?.total ?? 0;

    const [rows] = await db.promise().query(
      `SELECT 
          st.*, 
          b.booking_code
        FROM support_tickets st
        LEFT JOIN bookings b ON st.booking_id = b.id
        ${whereSql}
        AND st.user_id = ?
        ORDER BY st.created_at DESC
        LIMIT ? OFFSET ?`,
      [...values, user_id, limitNum, offset]
    );

    // Note: whereSql doesn't include user_id; we add it by query shape above.
    // To keep it correct across both cases, we ensure st.user_id = ? is in WHERE by using post filters.

    res.json({
      current_page: pageNum,
      total_pages: Math.ceil(total / limitNum) || 1,
      total,
      tickets: rows,
    });
  } catch (error) {
    console.log("getMyTickets error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllTickets = async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;

  try {
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
    const offset = (pageNum - 1) * limitNum;

    const { whereSql, values } = buildTicketFilters({ status, search });

    const [countRows] = await db.promise().query(
      `SELECT COUNT(*) as total
         FROM support_tickets st
         ${whereSql}`,
      values
    );

    const total = countRows[0]?.total ?? 0;

    const [rows] = await db.promise().query(
      `SELECT 
          st.*, 
          u.name AS user_name,
          u.email AS user_email,
          b.booking_code
        FROM support_tickets st
        JOIN users u ON st.user_id = u.id
        LEFT JOIN bookings b ON st.booking_id = b.id
        ${whereSql}
        ORDER BY st.created_at DESC
        LIMIT ? OFFSET ?`,
      [...values, limitNum, offset]
    );

    res.json({
      current_page: pageNum,
      total_pages: Math.ceil(total / limitNum) || 1,
      total,
      tickets: rows,
    });
  } catch (error) {
    console.log("getAllTickets error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.replyToTicket = async (req, res) => {
  const admin_id = req.user.id;
  const { id } = req.params;
  const { admin_reply, status } = req.body;

  try {
    if (!admin_reply) {
      return res.status(400).json({ message: "admin_reply is required" });
    }

    if (status && !STATUS_VALUES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const [[ticketRow]] = await db.promise().query(
      `SELECT st.*, u.id AS user_id
         FROM support_tickets st
         JOIN users u ON st.user_id = u.id
        WHERE st.id = ?`,
      [id]
    );

    if (!ticketRow) return res.status(404).json({ message: "Ticket not found" });

    const newStatus = status || ticketRow.status;

    await db.promise().query(
      `UPDATE support_tickets
         SET admin_reply = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [admin_reply, newStatus, id]
    );

    // Create notification for user (future-ready for SMS/email)
    const notificationMessage =
      `Admin replied to ticket ${ticketRow.ticket_code}: ${admin_reply}`;

    await db.promise().query(
      `INSERT INTO notifications
        (user_id, booking_id, message, type, is_read)
       VALUES
        (?, ?, ?, 'info', FALSE)`,
      [ticketRow.user_id, ticketRow.booking_id, notificationMessage]
    );

    res.json({ message: "Reply saved", ticket_id: id, status: newStatus, admin_id });
  } catch (error) {
    console.log("replyToTicket error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!STATUS_VALUES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const [ticketRows] = await db.promise().query(
      "SELECT id FROM support_tickets WHERE id = ?",
      [id]
    );

    if (!ticketRows.length) return res.status(404).json({ message: "Ticket not found" });

    await db.promise().query(
      "UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );

    res.json({ message: "Status updated successfully", ticket_id: id, status });
  } catch (error) {
    console.log("updateTicketStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

