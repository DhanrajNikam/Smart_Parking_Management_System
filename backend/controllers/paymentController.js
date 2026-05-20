const db = require("../config/db");

exports.makePayment = async (req, res) => {

  const {
    booking_id,
    payment_method
  } = req.body;

  try {

    // =========================
    // FIND PENDING BOOKING
    // =========================

    const [bookingRows] = await db.promise().query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      AND status = 'pending'
      `,
      [booking_id]
    );

    if (bookingRows.length === 0) {

      return res.status(400).json({
        message: "Invalid booking or already paid"
      });

    }

    const booking = bookingRows[0];

    // =========================
    // WALLET PAYMENT
    // =========================

    if (payment_method === "wallet") {

      // Get current user wallet balance

      const [userRows] = await db.promise().query(
        `
        SELECT wallet
        FROM users
        WHERE id = ?
        `,
        [req.user.id]
      );

      if (userRows.length === 0) {

        return res.status(404).json({
          message: "User not found"
        });

      }

      const walletBalance =
        Number(userRows[0].wallet || 0);

      const bookingAmount =
        Number(booking.total_price || 0);

      // Check wallet balance

      if (walletBalance < bookingAmount) {

        return res.status(400).json({
          message: "Insufficient wallet balance"
        });

      }

      // Deduct wallet money

      await db.promise().query(
        `
        UPDATE users
        SET wallet = wallet - ?
        WHERE id = ?
        `,
        [
          bookingAmount,
          req.user.id
        ]
      );

      // Add wallet transaction history

      await db.promise().query(
        `
        INSERT INTO wallet_transactions
        (
          user_id,
          booking_id,
          amount,
          type,
          description
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          req.user.id,
          booking.id,
          bookingAmount,
          "debit",
          `Wallet payment for booking ${booking.booking_code}`
        ]
      );

    }

    // =========================
    // INSERT PAYMENT RECORD
    // =========================

    await db.promise().query(
      `
      INSERT INTO payments
      (
        booking_id,
        amount,
        payment_method,
        status
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        booking_id,
        booking.total_price,
        payment_method,
        "success"
      ]
    );

    // =========================
    // UPDATE BOOKING STATUS
    // =========================

    await db.promise().query(
      `
      UPDATE bookings
      SET status = 'active'
      WHERE id = ?
      `,
      [booking_id]
    );

    // =========================
    // UPDATE SLOT STATUS
    // =========================

    await db.promise().query(
      `
      UPDATE slots
      SET status = 'occupied'
      WHERE id = ?
      `,
      [booking.slot_id]
    );

    // =========================
    // REALTIME SOCKET UPDATE
    // =========================

    const io = req.app.get("io");

    if (io) {

      io.emit("slotUpdated", {
        slotId: booking.slot_id,
        status: "occupied"
      });

    }

    // =========================
    // SUCCESS RESPONSE
    // =========================

    res.json({
      message: "Payment successful",
      booking_status: "active"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};