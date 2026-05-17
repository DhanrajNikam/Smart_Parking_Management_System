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
    if (
      !location_id ||
      !slot_id ||
      !booking_date ||
      !start_time ||
      !duration
    ) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    // ================= CHECK OVERLAP =================
    const [conflicts] = await db.promise().query(
      `
      SELECT id
      FROM bookings
      WHERE slot_id = ?
      AND booking_date = ?
      AND status IN ('active', 'pending')
      AND start_time < ADDTIME(?, SEC_TO_TIME(? * 3600))
      AND ADDTIME(start_time, SEC_TO_TIME(duration * 3600)) > ?
      `,
      [
        slot_id,
        booking_date,
        start_time,
        duration,
        start_time
      ]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: "Slot already booked for selected time"
      });
    }

    // ================= PRICE =================
    const [locationData] = await db.promise().query(
      `
      SELECT price_per_hour
      FROM parking_locations
      WHERE id = ?
      `,
      [location_id]
    );

    const pricePerHour =
      locationData[0]?.price_per_hour || 40;

    const calculatedPrice =
      total_price ||
      Number(duration) * pricePerHour;

    // ================= CREATE BOOKING =================
    const bookingCode =
      "BK" + Date.now();

    const [result] = await db.promise().query(
      `
      INSERT INTO bookings
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
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
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
    // IMPORTANT:
    // notifications.booking_id references bookings.booking_code

    try {

      await createNotification(
        user_id,
        `🚗 Booking created | Slot ${slot_id} | ${booking_date} ${start_time}`,
        "info",
        bookingCode
      );

    } catch (notifyError) {

      console.log(
        "Notification error:",
        notifyError
      );

    }

    // ================= SMS =================

    try {

      const [userRows] = await db.promise().query(
        `
        SELECT phone_number
        FROM users
        WHERE id = ?
        `,
        [user_id]
      );

      const phone_number =
        userRows[0]?.phone_number;

      await sendBookingSMS({
        phone_number,
        booking_code: bookingCode,
        slot_id,
        booking_date,
        start_time
      });

    } catch (smsError) {

      console.log(
        "SMS Error:",
        smsError
      );

    }

    res.status(201).json({
      message: "Booking created. Please complete payment.",
      booking_id: bookingId,
      booking_code: bookingCode
    });

  } catch (error) {

    console.log(
      "Booking Error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });

  }
};

// ======================================
// CANCEL BOOKING
// ======================================
exports.cancelBooking = async (req, res) => {

  const bookingId = req.params.id;

  try {

    const [rows] = await db.promise().query(
      `
      SELECT
        b.*,
        pl.address,
        pl.name AS location_name
      FROM bookings b
      JOIN parking_locations pl
        ON pl.id = b.location_id
      WHERE b.id = ?
      `,
      [bookingId]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const booking = rows[0];

    await db.promise().query(
      `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = ?
      `,
      [bookingId]
    );

    await db.promise().query(
      `
      UPDATE slots
      SET status = 'available'
      WHERE id = ?
      `,
      [booking.slot_id]
    );

    // ================= NOTIFICATION =================

    try {

      await createNotification(
        booking.user_id,
        `❌ Booking cancelled | ${booking.booking_code}`,
        "alert",
        booking.booking_code
      );

    } catch (notifyError) {

      console.log(
        "Notification error:",
        notifyError
      );

    }

    res.json({
      message: "Booking cancelled successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

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
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      AND status = 'active'
      `,
      [bookingId]
    );

    if (!booking.length) {
      return res.status(404).json({
        message: "Active booking not found"
      });
    }

    const b = booking[0];

    const newDuration =
      Number(b.duration) +
      Number(extra_hours);

    await db.promise().query(
      `
      UPDATE bookings
      SET duration = ?
      WHERE id = ?
      `,
      [newDuration, bookingId]
    );

    // ================= NOTIFICATION =================

    try {

      await createNotification(
        b.user_id,
        `⏱ Booking extended by ${extra_hours} hour(s)`,
        "info",
        b.booking_code
      );

    } catch (notifyError) {

      console.log(
        "Notification error:",
        notifyError
      );

    }

    res.json({
      message: "Booking extended successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

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

    // ================= FILTER =================

    if (
      status &&
      status !== "all"
    ) {

      query += ` AND b.status = ?`;

      values.push(status);

    }

    // ================= ORDER =================

    query += `
      ORDER BY b.created_at DESC
    `;

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