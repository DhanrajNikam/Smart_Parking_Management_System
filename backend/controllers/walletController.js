const db = require("../config/db");

// ======================================
// HELPER FUNCTIONS
// ======================================

function getMoneyDiffInHours(now, startDateTime) {

  return (
    (startDateTime.getTime() - now.getTime()) /
    (1000 * 60 * 60)
  );

}

function computeRefundAmount({
  bookingTotalPrice,
  hoursLeft
}) {

  if (hoursLeft >= 1) {

    return bookingTotalPrice;

  }

  if (hoursLeft >= 0.5) {

    return bookingTotalPrice * 0.5;

  }

  return 0;

}

// ======================================
// GET WALLET BALANCE
// ======================================

exports.getWalletBalance = async (req, res) => {

  const user_id = req.user.id;

  try {

    const [rows] = await db.promise().query(
      `
      SELECT wallet
      FROM users
      WHERE id = ?
      `,
      [user_id]
    );

    const wallet =
      rows[0]?.wallet ?? 0;

    res.json({
      wallet: Number(wallet)
    });

  } catch (error) {

    console.log(
      "getWalletBalance error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });

  }

};

// ======================================
// GET WALLET TRANSACTIONS
// ======================================

exports.getWalletTransactions = async (
  req,
  res
) => {

  const user_id = req.user.id;

  try {

    const {
      limit = 50
    } = req.query;

    const [rows] = await db.promise().query(
      `
      SELECT
        id,
        booking_id,
        amount,
        type,
        description,
        created_at
      FROM wallet_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
      `,
      [
        user_id,
        parseInt(limit, 10)
      ]
    );

    res.json(rows);

  } catch (error) {

    console.log(
      "getWalletTransactions error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });

  }

};

// ======================================
// REQUEST REFUND
// ======================================

exports.requestRefund = async (req, res) => {

  const user_id = req.user.id;

  const {
    booking_id = null,
    amount,
    upi_id = null,
    account_number = null,
    ifsc_code = null,
    payment_method
  } = req.body;

  let connection;

  try {

    // ================= VALIDATION =================

    if (
      !amount ||
      Number(amount) <= 0
    ) {

      return res.status(400).json({
        message: "Invalid amount"
      });

    }

    if (
      !payment_method ||
      !["upi", "bank"].includes(payment_method)
    ) {

      return res.status(400).json({
        message: "Invalid payment method"
      });

    }

    if (
      payment_method === "upi" &&
      !upi_id
    ) {

      return res.status(400).json({
        message: "UPI ID required"
      });

    }

    if (
      payment_method === "bank" &&
      (
        !account_number ||
        !ifsc_code
      )
    ) {

      return res.status(400).json({
        message: "Bank details required"
      });

    }

    // ================= START TRANSACTION =================

    connection =
      await db.promise().getConnection();

    await connection.beginTransaction();

    // ================= LOCK USER =================

    const [users] =
      await connection.query(
        `
        SELECT wallet
        FROM users
        WHERE id = ?
        FOR UPDATE
        `,
        [user_id]
      );

    const currentWallet =
      Number(users[0]?.wallet || 0);

    const refundAmount =
      Number(amount);

    console.log(
      "Current Wallet:",
      currentWallet
    );

    console.log(
      "Refund Amount:",
      refundAmount
    );

    // ================= CHECK BALANCE =================

    if (
      refundAmount > currentWallet
    ) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Insufficient wallet balance"
      });

    }

    // ================= DEDUCT WALLET =================

    await connection.query(
      `
      UPDATE users
      SET wallet = wallet - ?
      WHERE id = ?
      `,
      [
        refundAmount,
        user_id
      ]
    );

    // ================= INSERT REFUND REQUEST =================

    const [refundResult] =
      await connection.query(
        `
        INSERT INTO refund_requests
        (
          user_id,
          booking_id,
          amount,
          upi_id,
          account_number,
          ifsc_code,
          payment_method,
          status
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, 'pending')
        `,
        [
          user_id,
          booking_id,
          refundAmount,
          upi_id,
          account_number,
          ifsc_code,
          payment_method
        ]
      );

    // ================= WALLET TRANSACTION =================

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
      VALUES
      (?, ?, ?, 'debit', ?)
      `,
      [
        user_id,
        booking_id,
        refundAmount,
        "Refund request submitted"
      ]
    );

    // ================= NOTIFICATION =================

    await connection.query(
      `
      INSERT INTO notifications
      (
        user_id,
        message,
        type,
        booking_id
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        user_id,
        `Refund request submitted for ₹${refundAmount}`,
        "info",
        null
      ]
    );

    // ================= COMMIT =================

    await connection.commit();

    res.status(201).json({
      message:
        "Refund request submitted successfully",
      refund_request_id:
        refundResult.insertId
    });

  } catch (error) {

    console.log(
      "REFUND ERROR:",
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