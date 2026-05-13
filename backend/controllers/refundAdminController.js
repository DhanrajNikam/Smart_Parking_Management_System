const db = require("../config/db");
const { createNotification } = require("../utils/notificationHelper");
const { sendRefundStatusSMS } = require("../utils/notificationHelper");

function getId(req, name, fallback) {
  const v = req.params?.[name] ?? req.body?.[name] ?? fallback;
  return v;
}

exports.getAllRefundRequests = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT 
        id,
        user_id,
        booking_id,
        amount,
        upi_id,
        account_number,
        ifsc_code,
        payment_method,
        status,
        created_at
       FROM refund_requests
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (error) {
    console.log("getAllRefundRequests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

async function sendBestEffortRefundSMS({ refundRequest, status }) {
  try {
    if (!refundRequest?.user_id) return;

    const [userRows] = await db.promise().query(
      "SELECT phone_number FROM users WHERE id = ?",
      [refundRequest.user_id]
    );
    const phone_number = userRows[0]?.phone_number;
    if (!phone_number) return;

    await sendRefundStatusSMS({
      phone_number,
      booking_code: null,
      refund_amount: refundRequest.amount,
      status
    });
  } catch (e) {
    console.log("Refund status SMS best-effort failed:", e?.message || e);
  }
}
exports.approveRefund = async (req, res) => {

  const refundRequestId = req.params.id;

  let connection;

  try {

    connection = await db.promise().getConnection();

    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT * FROM refund_requests WHERE id = ? FOR UPDATE",
      [refundRequestId]
    );

    if (!rows.length) {

      await connection.rollback();

      return res.status(404).json({
        message: "Refund request not found"
      });
    }

    const refundRequest = rows[0];

    if (refundRequest.status !== "pending") {

      await connection.rollback();

      return res.status(400).json({
        message: `Refund request already ${refundRequest.status}`
      });
    }

    await connection.query(
      "UPDATE refund_requests SET status='approved' WHERE id=?",
      [refundRequestId]
    );

    await createNotification(
      refundRequest.user_id,
      `✅ Refund approved. Amount ₹${refundRequest.amount}`,
      "info",
      refundRequest.booking_id
    );

    await connection.commit();

    await sendBestEffortRefundSMS({
      refundRequest,
      status: "approved"
    });

    res.json({
      message: "Refund approved successfully"
    });

  } catch (error) {

    console.log("approveRefund error:", error);

    if (connection) {
      await connection.rollback();
    }

    res.status(500).json({
      message: "Server error"
    });

  } finally {

    if (connection) {
      connection.release();
    }
  }
};


exports.rejectRefund = async (req, res) => {

  const refundRequestId = req.params.id;

  let connection;

  try {

    connection = await db.promise().getConnection();

    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT * FROM refund_requests WHERE id = ? FOR UPDATE",
      [refundRequestId]
    );

    if (!rows.length) {

      await connection.rollback();

      return res.status(404).json({
        message: "Refund request not found"
      });
    }

    const refundRequest = rows[0];

    if (refundRequest.status !== "pending") {

      await connection.rollback();

      return res.status(400).json({
        message: `Refund request already ${refundRequest.status}`
      });
    }

    await connection.query(
      "UPDATE refund_requests SET status='rejected' WHERE id=?",
      [refundRequestId]
    );

    await connection.query(
      "UPDATE users SET wallet = wallet + ? WHERE id = ?",
      [refundRequest.amount, refundRequest.user_id]
    );

    await connection.query(
      `INSERT INTO wallet_transactions
      (user_id, booking_id, amount, type, description)
      VALUES (?, ?, ?, 'credit', ?)`,
      [
        refundRequest.user_id,
        refundRequest.booking_id,
        refundRequest.amount,
        `Refund rejected → wallet credited back`
      ]
    );

    await createNotification(
      refundRequest.user_id,
      `❌ Refund rejected. ₹${refundRequest.amount} returned to wallet`,
      "alert",
      refundRequest.booking_id
    );

    await connection.commit();

    await sendBestEffortRefundSMS({
      refundRequest,
      status: "rejected"
    });

    res.json({
      message: "Refund rejected successfully"
    });

  } catch (error) {

    console.log("rejectRefund error:", error);

    if (connection) {
      await connection.rollback();
    }

    res.status(500).json({
      message: "Server error"
    });

  } finally {

    if (connection) {
      connection.release();
    }
  }
};