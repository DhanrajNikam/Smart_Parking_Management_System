const db = require("../config/db");
const { createNotification } = require("../utils/notificationHelper");

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
    const [booking] = await db.promise().query(
      "SELECT slot_id, user_id FROM bookings WHERE id = ?",
      [bookingId]
    );

    if (!booking.length) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const slotId = booking[0].slot_id;
    const user_id = booking[0].user_id;

    // Cancel booking
    await db.promise().query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [bookingId]
    );

    // Free slot
    await db.promise().query(
      "UPDATE slots SET status = 'available' WHERE id = ?",
      [slotId]
    );

    // Notification
    await createNotification(
      user_id,
      `❌ Booking cancelled | Slot ${slotId}`,
      "alert",
      bookingId
    );

    // Socket update
    const io = req.app.get("io");
    if (io) {
      io.emit("slotUpdated", {
        slotId: slotId,
        status: "available"
      });
    }

    res.json({
      message: "Booking cancelled successfully"
    });

  } catch (error) {
    console.log(error);
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

  try {
    const [bookings] = await db.promise().query(
      `SELECT
          b.*,
          pl.name AS parking_location,
          s.slot_number
       FROM bookings b
       JOIN parking_locations pl ON b.location_id = pl.id
       JOIN slots s ON b.slot_id = s.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [user_id]
    );

    res.json(bookings);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};