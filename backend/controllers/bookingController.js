const db = require("../config/db");
const {
  createNotification,
  sendBookingSMS
} = require("../utils/notificationHelper");


// ======================================
// CREATE BOOKING
// ======================================
exports.createBooking = async (req, res) => {
  const {
    location_id,
    slot_id,
    vehicle_type,
    vehicle_number,
    booking_date,
    start_time,
    duration,
    total_price
  } = req.body;


  const user_id = req.user.id;

  try {
    // ================= VALIDATION =================
    if (!location_id || !slot_id || !booking_date || !start_time || !duration) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    // ================= CHECK OVERLAP =================
    const [conflicts] = await db.promise().query(
      `SELECT id
       FROM bookings
       WHERE slot_id = ?
       AND booking_date = ?
       AND status IN ('active', 'pending')
       AND start_time < ADDTIME(?, SEC_TO_TIME(? * 3600))
       AND ADDTIME(start_time, SEC_TO_TIME(duration * 3600)) > ?`,
      [slot_id, booking_date, start_time, duration, start_time]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: "Slot already booked for selected time"
      });
    }

    // ================= PRICE =================
    const [locationData] = await db.promise().query(
      "SELECT price_per_hour FROM parking_locations WHERE id = ?",
      [location_id]
    );

    const pricePerHour = locationData[0]?.price_per_hour || 40;
    const calculatedPrice = total_price || Number(duration) * pricePerHour;

    // ================= CREATE BOOKING =================
    const bookingCode = "BK" + Date.now();

    const [result] = await db.promise().query(
      `INSERT INTO bookings
       (
         booking_code,
         user_id,
         location_id,
         slot_id,
         vehicle_type,
         vehicle_number,
         booking_date,
         start_time,
         duration,
         total_price,
         status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        bookingCode,
        user_id,
        location_id,
        slot_id,
        vehicle_type,
        vehicle_number,
        booking_date,
        start_time,
        duration,
        calculatedPrice
      ]
    );

    const bookingId = result.insertId;

    // ================= NOTIFICATION =================
    await createNotification(
      user_id,
      `🚗 Booking created | Slot ${slot_id} | ${booking_date} ${start_time}`,
      "info",
      bookingId
    );

    // ================= SMS =================
    // Fetch phone number from users table
    const [userRows] = await db.promise().query(
      "SELECT phone_number FROM users WHERE id = ?",
      [user_id]
    );

    const phone_number = userRows[0]?.phone_number;

    await sendBookingSMS({
      phone_number,
      booking_code: bookingCode,
      slot_id,
      booking_date,
      start_time
    });

    // ❌ IMPORTANT: DO NOT OCCUPY SLOT HERE


    res.status(201).json({
      message: "Booking created. Please complete payment.",
      booking_id: bookingId,
      booking_code: bookingCode
    });

  } catch (error) {
    console.log("Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================
// CANCEL BOOKING
// ======================================
exports.cancelBooking = async (req, res) => {
  const bookingId = req.params.id;

  try {
    const [rows] = await db.promise().query(
      `SELECT 
        b.id,
        b.booking_code,
        b.user_id,
        b.location_id,
        b.slot_id,
        b.booking_date,
        b.start_time,
        b.duration,
        b.total_price,
        pl.address,
        pl.name AS location_name
      FROM bookings b
      JOIN parking_locations pl ON pl.id = b.location_id
      WHERE b.id = ?`,
      [bookingId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = rows[0];

    // Policy calculation
    const now = new Date();
    const bookingDateStr = booking.booking_date instanceof Date
      ? booking.booking_date.toISOString().split("T")[0]
      : booking.booking_date;

    const startDateTime = new Date(`${bookingDateStr}T${booking.start_time}`);
    const hoursLeft = (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
let refundAmount = Number(booking.total_price);

console.log("FORCE REFUND ENABLED");
console.log("refundAmount:", refundAmount);

    console.log("[cancelBooking] bookingId:", bookingId);
    console.log("[cancelBooking] hoursLeft:", hoursLeft);
    console.log("[cancelBooking] total_price:", booking.total_price);
    console.log("[cancelBooking] refundAmount:", refundAmount);

    // DB transaction for cancellation + wallet credit + transactions
    await db.promise().beginTransaction();

    // Only cancel if not already cancelled
    await db.promise().query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ? AND status != 'cancelled'",
      [bookingId]
    );

    // Free slot
    await db.promise().query(
      "UPDATE slots SET status = 'available' WHERE id = ?",
      [booking.slot_id]
    );

    // Notification
    await createNotification(
      booking.user_id,
      `❌ Booking cancelled | Code: ${booking.booking_code} | Refund: ₹${refundAmount.toFixed(2).replace(/\.00$/, "")}`,
      "alert",
      bookingId
    );

    // Wallet credit (only if refundAmount > 0)
    if (refundAmount > 0) {
      await db.promise().query(
        "UPDATE users SET wallet = wallet + ? WHERE id = ?",
        [refundAmount, booking.user_id]
      );

      await db.promise().query(
        `INSERT INTO wallet_transactions (user_id, booking_id, amount, type, description)
         VALUES (?, ?, ?, 'credit', ?)` ,
        [
          booking.user_id,
          booking.id,
          refundAmount,
          `Cancellation refund credited for ${booking.booking_code} (hoursLeft=${hoursLeft.toFixed(2)})`
        ]
      );
    }

    await db.promise().commit();

    // Socket update
    const io = req.app.get("io");
    if (io) {
      io.emit("slotUpdated", {
        slotId: booking.slot_id,
        status: "available"
      });
    }

    // SMS (best-effort)
    // SMS (best-effort) using helper
    try {
      const [userRows] = await db.promise().query(
        "SELECT phone_number FROM users WHERE id = ?",
        [booking.user_id]
      );
      const phone_number = userRows[0]?.phone_number;

      const endDate = new Date(startDateTime.getTime() + Number(booking.duration) * 60 * 60 * 1000);

      const start_time_display = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }).format(startDateTime);

      const end_time_display = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }).format(endDate);

      const { sendBookingCancelledSMS } = require("../utils/notificationHelper");

      await sendBookingCancelledSMS({
        phone_number,
        booking_code: booking.booking_code,
        refund_amount: refundAmount,
        slot_id: booking.slot_id,
        location_address: booking.address ? booking.address : booking.location_name,
        start_time_display,
        end_time_display
      });
    } catch (smsErr) {
      console.log("Cancellation SMS best-effort failed:", smsErr?.message || smsErr);
    }

    res.json({ message: "Booking cancelled successfully", refund_amount: Number(refundAmount.toFixed(2)) });

  } catch (error) {
    console.log(error);
    try {
      await db.promise().rollback();
    } catch (e) {
      // ignore
    }
    res.status(500).json({ message: "Server error" });
  }
};


// ======================================
// EXTEND BOOKING
// ======================================
exports.extendBooking = async (req, res) => {
  const bookingId = req.params.id;
  const { extra_hours } = req.body;

  try {
    const [booking] = await db.promise().query(
      `SELECT * FROM bookings
       WHERE id = ? AND status = 'active'`,
      [bookingId]
    );

    if (!booking.length) {
      return res.status(404).json({
        message: "Active booking not found"
      });
    }

    const b = booking[0];
    const newDuration = Number(b.duration) + Number(extra_hours);

    await db.promise().query(
      "UPDATE bookings SET duration = ? WHERE id = ?",
      [newDuration, bookingId]
    );

    await createNotification(
      b.user_id,
      `⏱ Booking extended by ${extra_hours} hour(s)`,
      "info",
      bookingId
    );

    res.json({
      message: "Booking extended successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
// ======================================
// GET USER BOOKINGS
// ======================================
exports.getUserBookings = async (req, res) => {
  const user_id = req.user.id;
  const status = req.query.status;

  try {

    let query = `
      SELECT
        b.*,
        pl.name AS parking_location,
        s.slot_number
      FROM bookings b
      JOIN parking_locations pl
        ON b.location_id = pl.id
      JOIN slots s
        ON b.slot_id = s.id
      WHERE b.user_id = ?
    `;

    let values = [user_id];

    // ✅ FILTER BY STATUS
    if (
      status &&
      status !== "all"
    ) {
      query += ` AND b.status = ?`;
      values.push(status);
    }

    // ✅ ORDER
    query += ` ORDER BY b.created_at DESC`;

    const [bookings] = await db.promise().query(
      query,
      values
    );

    res.json(bookings);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};