const db = require("../config/db");

exports.makePayment = async (req, res) => {
  const { booking_id, payment_method } = req.body;

  try {

    // 1️⃣ Find pending booking
    const [booking] = await db.promise().query(
      "SELECT * FROM bookings WHERE id = ? AND status = 'pending'",
      [booking_id]
    );

    if (booking.length === 0) {
      return res.status(400).json({
        message: "Invalid booking or already paid"
      });
    }

    // 2️⃣ Insert payment record
    await db.promise().query(
      `INSERT INTO payments
       (booking_id, amount, payment_method, status)
       VALUES (?, ?, ?, 'success')`,
      [
        booking_id,
        booking[0].total_price,
        payment_method
      ]
    );

    // 3️⃣ Update booking to ACTIVE
    await db.promise().query(
      "UPDATE bookings SET status = 'active' WHERE id = ?",
      [booking_id]
    );

    // 4️⃣ Mark slot as OCCUPIED
    await db.promise().query(
      "UPDATE slots SET status = 'occupied' WHERE id = ?",
      [booking[0].slot_id]
    );

    // 5️⃣ Real-time socket update
    const io = req.app.get("io");
    if (io) {
      io.emit("slotUpdated", {
        slotId: booking[0].slot_id,
        status: "occupied"
      });
    }

    res.json({
      message: "Payment successful",
      booking_status: "active"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
