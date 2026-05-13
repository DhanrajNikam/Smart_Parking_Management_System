const db = require("../config/db");
const { createNotification } = require("../utils/notificationHelper");


function getMoneyDiffInHours(now, startDateTime) {
  return (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
}

function computeRefundAmount({ bookingTotalPrice, hoursLeft }) {
  // Refund policy:
  // - Cancel before 1 hour  -> 100%
  // - Cancel before 30 minutes -> 50%
  // - After booking start time -> 0%
  if (hoursLeft >= 1) return bookingTotalPrice; // 100%
  if (hoursLeft >= 0.5) return bookingTotalPrice * 0.5; // 50%
  return 0;
}

exports.getWalletBalance = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [rows] = await db.promise().query(
      "SELECT wallet FROM users WHERE id = ?",
      [user_id]
    );

    const wallet = rows[0]?.wallet ?? 0;
    res.json({ wallet: Number(wallet) });
  } catch (error) {
    console.log("getWalletBalance error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWalletTransactions = async (req, res) => {
  const user_id = req.user.id;

  try {
    const { limit = 50 } = req.query;

    const [rows] = await db.promise().query(
      `SELECT id, booking_id, amount, type, description, created_at
       FROM wallet_transactions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [user_id, parseInt(limit, 10)]
    );

    res.json(rows);
  } catch (error) {
    console.log("getWalletTransactions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.requestRefund = async (req, res) => {
//   const user_id = req.user.id;
//   const {
//     booking_id = null,
//     amount,
//     upi_id = null,
//     account_number = null,
//     ifsc_code = null,
//     payment_method
//   } = req.body;

//   try {
//     if (!amount || Number(amount) <= 0) {
//       return res.status(400).json({ message: "Invalid amount" });
//     }
//     if (!payment_method || !["upi", "bank"].includes(payment_method)) {
//       return res.status(400).json({ message: "Invalid payment_method" });
//     }

//     if (payment_method === "upi" && !upi_id) {
//       return res.status(400).json({ message: "upi_id is required for UPI" });
//     }

//     if (payment_method === "bank") {
//       if (!account_number || !ifsc_code) {
//         return res.status(400).json({ message: "account_number and ifsc_code are required for bank" });
//       }
//     }

//     // Transaction safety: deduct wallet immediately + create refund_request
//     await db.promise().beginTransaction();

//     const [[userRow]] = await db.promise().query(
//       "SELECT wallet FROM users WHERE id = ? FOR UPDATE",
//       [user_id]
//     );

//     const currentWallet = Number(userRow?.wallet ?? 0);
//     const refundAmount = Number(amount);

//     if (refundAmount > currentWallet) {
//       await db.promise().rollback();
//       return res.status(400).json({ message: "Insufficient wallet balance" });
//     }

//     // 1) Deduct wallet
//     await db.promise().query(
//       "UPDATE users SET wallet = wallet - ? WHERE id = ?",
//       [refundAmount, user_id]
//     );

//     // 2) Insert refund request
//     const [insertReq] = await db.promise().query(
//       `INSERT INTO refund_requests
//        (user_id, booking_id, amount, upi_id, account_number, ifsc_code, payment_method, status)
//        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
//       [
//         user_id,
//         booking_id,
//         refundAmount,
//         upi_id,
//         account_number,
//         ifsc_code,
//         payment_method
//       ]
//     );

//     const refund_request_id = insertReq.insertId;

//     // 3) Insert wallet transaction (debit)
//     await db.promise().query(
//       `INSERT INTO wallet_transactions
//        (user_id, booking_id, amount, type, description)
//        VALUES (?, ?, ?, 'debit', ?)` ,
//       [
//         user_id,
//         booking_id,
//         refundAmount,
//         `Refund request submitted (Refund Request ID: ${refund_request_id})`
//       ]
//     );

//     // 4) In-app notification
//     await createNotification(
//       user_id,
//       `💸 Refund requested. Amount: ₹${refundAmount}. Status: Pending`,
//       "info",
//       null
//     );

//     await db.promise().commit();

//     res.status(201).json({
//       message: "Refund request submitted successfully",
//       refund_request_id
//     });
//   } catch (error) {
//     try {
//       await db.promise().rollback();
//     } catch (e) {
//       // ignore
//     }

//     console.log("requestRefund error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.applyBookingCancellationRefund = async ({ booking, refundHoursLeft, refundAmount, booking_code }) => {
//   // Helper: credit user wallet based on booking cancellation
//   // booking: { user_id, total_price }
//   const user_id = booking.user_id;

//   // Credit wallet amount only
//   await db.promise().query(
//     "UPDATE users SET wallet = wallet + ? WHERE id = ?",
//     [refundAmount, user_id]
//   );

//   // wallet transaction credit
//   await db.promise().query(
//     `INSERT INTO wallet_transactions
//      (user_id, booking_id, amount, type, description)
//      VALUES (?, ?, ?, 'credit', ? )`,
//     [
//       user_id,
//       booking.id,
//       refundAmount,
//       `Cancellation refund for booking ${booking_code} (${refundHoursLeft} hours left rule)`
//     ]
//   );

//   return;
// };



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
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!payment_method || !["upi", "bank"].includes(payment_method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    if (payment_method === "upi" && !upi_id) {
      return res.status(400).json({ message: "UPI ID required" });
    }

    if (
      payment_method === "bank" &&
      (!account_number || !ifsc_code)
    ) {
      return res.status(400).json({
        message: "Bank details required"
      });
    }

    connection = await db.promise().getConnection();

    await connection.beginTransaction();

    const [users] = await connection.query(
      "SELECT wallet FROM users WHERE id = ? FOR UPDATE",
      [user_id]
    );

    const currentWallet = Number(users[0]?.wallet || 0);
    const refundAmount = Number(amount);

    console.log("Current Wallet:", currentWallet);
    console.log("Refund Amount:", refundAmount);

    if (refundAmount > currentWallet) {
      await connection.rollback();

      return res.status(400).json({
        message: "Insufficient wallet balance"
      });
    }

    // deduct wallet
    await connection.query(
      "UPDATE users SET wallet = wallet - ? WHERE id = ?",
      [refundAmount, user_id]
    );

    // insert refund request
    const [refundResult] = await connection.query(
      `INSERT INTO refund_requests
      (user_id, booking_id, amount, upi_id, account_number, ifsc_code, payment_method, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
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

    // wallet transaction
    await connection.query(
      `INSERT INTO wallet_transactions
      (user_id, booking_id, amount, type, description)
      VALUES (?, ?, ?, 'debit', ?)`,
      [
        user_id,
        booking_id,
        refundAmount,
        `Refund request submitted`
      ]
    );

    await createNotification(
      user_id,
      `Refund request submitted for ₹${refundAmount}`,
      "info"
    );

    await connection.commit();

    res.status(201).json({
      message: "Refund request submitted successfully",
      refund_request_id: refundResult.insertId
    });

  } catch (error) {

    console.log("REFUND ERROR:", error);

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