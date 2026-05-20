const db = require("../config/db");

const {
  createNotification,
  sendRefundStatusSMS
} = require("../utils/notificationHelper");

// ======================================
// GET ALL REFUND REQUESTS
// ======================================
exports.getAllRefundRequests = async (req, res) => {

  try {

    const [rows] = await db.promise().query(
      `
      SELECT
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
      ORDER BY created_at DESC
      `
    );

    res.json(rows);

  } catch (error) {

    console.log(
      "getAllRefundRequests error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });

  }

};

// ======================================
// SEND REFUND SMS
// ======================================
async function sendBestEffortRefundSMS({
  refundRequest,
  status
}) {

  try {

    if (!refundRequest?.user_id) return;

    const [userRows] = await db.promise().query(
      `
      SELECT phone_number
      FROM users
      WHERE id = ?
      `,
      [refundRequest.user_id]
    );

    const phone_number =
      userRows[0]?.phone_number;

    if (!phone_number) return;

    await sendRefundStatusSMS({
      phone_number,
      booking_code: null,
      refund_amount: refundRequest.amount,
      status
    });

  } catch (e) {

    console.log(
      "Refund status SMS failed:",
      e?.message || e
    );

  }

}

// ======================================
// APPROVE REFUND
// ======================================
exports.approveRefund = async (req, res) => {

  const refundRequestId = req.params.id;

  let connection;

  try {

    connection =
      await db.promise().getConnection();

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT *
      FROM refund_requests
      WHERE id = ?
      FOR UPDATE
      `,
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
        message:
          `Refund already ${refundRequest.status}`
      });

    }

    // Approve refund

    await connection.query(
      `
      UPDATE refund_requests
      SET status = 'approved'
      WHERE id = ?
      `,
      [refundRequestId]
    );

    // Notification

    await createNotification(
      refundRequest.user_id,
      `✅ Refund approved. Amount ₹${refundRequest.amount}`,
      "success",
      refundRequest.booking_id
    );

    await connection.commit();

    // SMS

    await sendBestEffortRefundSMS({
      refundRequest,
      status: "approved"
    });

    res.json({
      message: "Refund approved successfully"
    });

  } catch (error) {

    console.log(
      "approveRefund error:",
      error
    );

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

// ======================================
// REJECT REFUND
// ======================================
exports.rejectRefund = async (req, res) => {

  const refundRequestId = req.params.id;

  let connection;

  try {

    connection =
      await db.promise().getConnection();

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT *
      FROM refund_requests
      WHERE id = ?
      FOR UPDATE
      `,
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
        message:
          `Refund already ${refundRequest.status}`
      });

    }

    // Reject refund

    await connection.query(
      `
      UPDATE refund_requests
      SET status = 'rejected'
      WHERE id = ?
      `,
      [refundRequestId]
    );

    // Return money to wallet

    await connection.query(
      `
      UPDATE users
      SET wallet = wallet + ?
      WHERE id = ?
      `,
      [
        refundRequest.amount,
        refundRequest.user_id
      ]
    );

    // Wallet transaction

    await connection.query(
      `
      INSERT INTO wallet_transactions
      (
        user_id,
        booking_id,
        amount,
        type,
        description
      )
      VALUES (?, ?, ?, 'credit', ?)
      `,
      [
        refundRequest.user_id,
        refundRequest.booking_id,
        refundRequest.amount,
        "Refund rejected → wallet credited back"
      ]
    );

    // Notification

    await createNotification(
      refundRequest.user_id,
      `❌ Refund rejected. ₹${refundRequest.amount} returned to wallet`,
      "warning",
      refundRequest.booking_id
    );

    await connection.commit();

    // SMS

    await sendBestEffortRefundSMS({
      refundRequest,
      status: "rejected"
    });

    res.json({
      message: "Refund rejected successfully"
    });

  } catch (error) {

    console.log(
      "rejectRefund error:",
      error
    );

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