// const db = require("../config/db");

// const {
//   createNotification,
//   sendBookingSMS
// } = require("../utils/notificationHelper");

// // ======================================
// // CREATE BOOKING
// // ======================================
// exports.createBooking = async (req, res) => {

//   const {
//     location_id,
//     slot_id,
//     vehicle_type,
//     vehicle_number,
//     booking_date,
//     start_time,
//     duration,
//     total_price
//   } = req.body;

//   const user_id = req.user.id;

//   try {

//     // ================= VALIDATION =================

//     if (
//       !location_id ||
//       !slot_id ||
//       !booking_date ||
//       !start_time ||
//       !duration
//     ) {

//       return res.status(400).json({
//         message: "Missing required fields"
//       });

//     }

//     // ================= CHECK OVERLAP =================

//     const [conflicts] = await db.promise().query(
//       `
//       SELECT id
//       FROM bookings
//       WHERE slot_id = ?
//       AND booking_date = ?
//       AND status IN ('active', 'pending')
//       AND start_time < ADDTIME(?, SEC_TO_TIME(? * 3600))
//       AND ADDTIME(start_time, SEC_TO_TIME(duration * 3600)) > ?
//       `,
//       [
//         slot_id,
//         booking_date,
//         start_time,
//         duration,
//         start_time
//       ]
//     );

//     if (conflicts.length > 0) {

//       return res.status(409).json({
//         message: "Slot already booked for selected time"
//       });

//     }

//     // ================= PRICE =================

//     const [locationData] = await db.promise().query(
//       `
//       SELECT price_per_hour
//       FROM parking_locations
//       WHERE id = ?
//       `,
//       [location_id]
//     );

//     const pricePerHour =
//       locationData[0]?.price_per_hour || 40;

//     const calculatedPrice =
//       total_price ||
//       Number(duration) * pricePerHour;

//     // ================= CREATE BOOKING =================

//     const bookingCode =
//       "BK" + Date.now();

//     const [result] = await db.promise().query(
//       `
//       INSERT INTO bookings
//       (
//         booking_code,
//         user_id,
//         location_id,
//         slot_id,
//         vehicle_type,
//         vehicle_number,
//         booking_date,
//         start_time,
//         duration,
//         total_price,
//         status
//       )
//       VALUES
//       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
//       `,
//       [
//         bookingCode,
//         user_id,
//         location_id,
//         slot_id,
//         vehicle_type,
//         vehicle_number,
//         booking_date,
//         start_time,
//         duration,
//         calculatedPrice
//       ]
//     );

//     const bookingId = result.insertId;

//     // ================= NOTIFICATION =================

//     try {

//       await createNotification(
//         user_id,
//         `🚗 Booking created | Slot ${slot_id} | ${booking_date} ${start_time}`,
//         "info",
//         bookingCode
//       );

//     } catch (notifyError) {

//       console.log(
//         "Notification error:",
//         notifyError
//       );

//     }

//     // ================= SMS =================

//     try {

//       const [userRows] = await db.promise().query(
//         `
//         SELECT phone_number
//         FROM users
//         WHERE id = ?
//         `,
//         [user_id]
//       );

//       const phone_number =
//         userRows[0]?.phone_number;

//       await sendBookingSMS({
//         phone_number,
//         booking_code: bookingCode,
//         slot_id,
//         booking_date,
//         start_time
//       });

//     } catch (smsError) {

//       console.log(
//         "SMS Error:",
//         smsError
//       );

//     }

//     res.status(201).json({
//       message: "Booking created. Please complete payment.",
//       booking_id: bookingId,
//       booking_code: bookingCode
//     });

//   } catch (error) {

//     console.log(
//       "Booking Error:",
//       error
//     );

//     res.status(500).json({
//       message: "Server error"
//     });

//   }

// };

// // ======================================
// // CANCEL BOOKING
// // ======================================
// exports.cancelBooking = async (req, res) => {

//   const bookingId = req.params.id;

//   try {

//     const [rows] = await db.promise().query(
//       `
//       SELECT
//         b.*,
//         pl.address,
//         pl.name AS location_name
//       FROM bookings b
//       JOIN parking_locations pl
//         ON pl.id = b.location_id
//       WHERE b.id = ?
//       `,
//       [bookingId]
//     );

//     if (!rows.length) {

//       return res.status(404).json({
//         message: "Booking not found"
//       });

//     }

//     const booking = rows[0];

//     // Prevent duplicate cancel

//     if (booking.status === "cancelled") {

//       return res.status(400).json({
//         message: "Booking already cancelled"
//       });

//     }

//     // Cancel booking

//     await db.promise().query(
//       `
//       UPDATE bookings
//       SET status = 'cancelled'
//       WHERE id = ?
//       `,
//       [bookingId]
//     );

//     // Free slot

//     await db.promise().query(
//       `
//       UPDATE slots
//       SET status = 'available'
//       WHERE id = ?
//       `,
//       [booking.slot_id]
//     );

//     // Refund amount

//     const refundAmount =
//       Number(booking.total_price || 0);

//     // Add wallet money

//     await db.promise().query(
//       `
//       UPDATE users
//       SET wallet = wallet + ?
//       WHERE id = ?
//       `,
//       [
//         refundAmount,
//         booking.user_id
//       ]
//     );

//     // Wallet transaction

//     await db.promise().query(
//       `
//       INSERT INTO wallet_transactions
//       (
//         user_id,
//         booking_id,
//         amount,
//         type,
//         description
//       )
//       VALUES (?, ?, ?, ?, ?)
//       `,
//       [
//         booking.user_id,
//         booking.id,
//         refundAmount,
//         "credit",
//         `Refund for cancelled booking ${booking.booking_code}`
//       ]
//     );

//     // Notification

//     try {

//       await createNotification(
//         booking.user_id,
//         `❌ Booking cancelled | ₹${refundAmount} refunded to wallet`,
//         "warning",
//         booking.booking_code
//       );

//     } catch (notifyError) {

//       console.log(
//         "Notification error:",
//         notifyError
//       );

//     }

//     res.json({
//       message: "Booking cancelled successfully",
//       refund_amount: refundAmount
//     });

//   } catch (error) {

//     console.log(error);

//     res.status(500).json({
//       message: "Server error"
//     });

//   }

// };



// // ======================================
// // EXTEND BOOKING
// // ======================================
// exports.extendBooking = async (req, res) => {

//   const bookingId = req.params.id;

//   const { extra_hours } = req.body;

//   try {

//     const [booking] = await db.promise().query(
//       `
//       SELECT *
//       FROM bookings
//       WHERE id = ?
//       AND status = 'active'
//       `,
//       [bookingId]
//     );

//     if (!booking.length) {

//       return res.status(404).json({
//         message: "Active booking not found"
//       });

//     }

//     const b = booking[0];

//     const newDuration =
//       Number(b.duration) +
//       Number(extra_hours);

//     await db.promise().query(
//       `
//       UPDATE bookings
//       SET duration = ?
//       WHERE id = ?
//       `,
//       [newDuration, bookingId]
//     );

//     try {

//       await createNotification(
//         b.user_id,
//         `⏱ Booking extended by ${extra_hours} hour(s)`,
//         "info",
//         b.booking_code
//       );

//     } catch (notifyError) {

//       console.log(
//         "Notification error:",
//         notifyError
//       );

//     }

//     res.json({
//       message: "Booking extended successfully"
//     });

//   } catch (error) {

//     console.log(error);

//     res.status(500).json({
//       message: "Server error"
//     });

//   }

// };
// // ======================================
// // GET USER BOOKINGS
// // ======================================
// exports.getUserBookings = async (req, res) => {

//   const user_id = req.user.id;

//   const status = req.query.status;

//   try {

//     let query = `
//       SELECT
//         b.*,
//         pl.name AS parking_location,
//         s.slot_number
//       FROM bookings b
//       JOIN parking_locations pl
//         ON b.location_id = pl.id
//       JOIN slots s
//         ON b.slot_id = s.id
//       WHERE b.user_id = ?
//     `;

//     let values = [user_id];

//     if (
//       status &&
//       status !== "all"
//     ) {

//       query += ` AND b.status = ?`;

//       values.push(status);

//     }

//     query += `
//       ORDER BY b.created_at DESC
//     `;

//     const [bookings] = await db.promise().query(
//       query,
//       values
//     );

//     res.json(bookings);

//   } catch (error) {

//     console.log(error);

//     res.status(500).json({
//       message: "Server error"
//     });

//   }

// };





const db = require("../config/db");

const {
  createNotification,
  sendBookingSMS
} = require("../utils/notificationHelper");

const {
  sendEmail
} = require("../utils/emailService");

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

    // VALIDATION

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

    // CHECK OVERLAP

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

    // PRICE

    const [locationData] = await db.promise().query(
      `
      SELECT
        price_per_hour,
        name,
        address,
        latitude,
        longitude
      FROM parking_locations
      WHERE id = ?
      `,
      [location_id]
    );

    const location =
      locationData[0];

    const pricePerHour =
      location?.price_per_hour || 40;

    const calculatedPrice =
      total_price ||
      Number(duration) * pricePerHour;

    // CREATE BOOKING

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

    const bookingId =
      result.insertId;

    // NOTIFICATION

    try {

      await createNotification(
        user_id,
        `🚗 Booking created | Slot ${slot_id}`,
        "info",
        bookingCode
      );

    } catch (notifyError) {

      console.log(
        "Notification error:",
        notifyError
      );

    }

    // GET USER DETAILS

    const [userRows] =
      await db.promise().query(
        `
        SELECT
          phone_number,
          email
        FROM users
        WHERE id = ?
        `,
        [user_id]
      );

    const phone_number =
      userRows[0]?.phone_number;

    const userEmail =
      userRows[0]?.email;

    // ================= SMS =================

    try {

      await sendBookingSMS({
        phone_number,
        booking_code: bookingCode,
        slot_id,
        booking_date,
        start_time,
        duration,
        total_price: calculatedPrice,
        location_name: location?.name,
        latitude: location?.latitude,
        longitude: location?.longitude
      });

      console.log(
        "Booking SMS sent successfully"
      );

    } catch (smsError) {

      console.log(
        "SMS Error:",
        smsError
      );

    }

    // ================= EMAIL =================

    try {

      if (userEmail) {

        const mapsUrl =
          `https://maps.google.com/?q=${location?.latitude},${location?.longitude}`;

        const emailText = `
Smart Parking System

Booking Confirmed

Booking Code: ${bookingCode}

Parking Location:
${location?.name}

Slot Number:
${slot_id}

Start Time:
${booking_date} ${start_time}

Duration:
${duration} Hour(s)

Amount Paid:
Rs.${calculatedPrice}

Directions:
${mapsUrl}

Thank you for using Smart Parking
`;

        const emailHtml = `
          <div style="font-family:Arial;padding:20px;max-width:600px;margin:auto;">

            <div style="background:#0d6efd;color:white;padding:20px;border-radius:12px;">
              <h2 style="margin:0;">
                🚗 Smart Parking System
              </h2>
            </div>

            <div style="padding:20px;border:1px solid #eee;border-radius:12px;margin-top:20px;">

              <h3 style="color:green;">
                Booking Confirmed ✅
              </h3>

              <p>
                <b>Booking Code:</b>
                ${bookingCode}
              </p>

              <p>
                <b>Parking Location:</b><br/>
                ${location?.name}
              </p>

              <p>
                <b>Slot Number:</b>
                ${slot_id}
              </p>

              <p>
                <b>Start Time:</b><br/>
                ${booking_date} ${start_time}
              </p>

              <p>
                <b>Duration:</b>
                ${duration} Hour(s)
              </p>

              <p>
                <b>Amount Paid:</b>
                ₹${calculatedPrice}
              </p>

              <a
                href="${mapsUrl}"
                target="_blank"
                style="
                  display:inline-block;
                  background:#0d6efd;
                  color:white;
                  padding:12px 18px;
                  text-decoration:none;
                  border-radius:8px;
                  margin-top:10px;
                "
              >
                Open Directions
              </a>

              <p style="margin-top:30px;">
                Thank you for using Smart Parking 🚘
              </p>

            </div>

          </div>
        `;

        await sendEmail({
          to: userEmail,
          subject:
            "Booking Confirmed - Smart Parking",
          text: emailText,
          html: emailHtml
        });

        console.log(
          "Booking email sent successfully"
        );

      }

    } catch (emailError) {

      console.log(
        "Email send error:",
        emailError
      );

    }

    res.status(201).json({
      message:
        "Booking created successfully",
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

  const bookingId =
    req.params.id;

  try {

    const [rows] =
      await db.promise().query(
        `
        SELECT *
        FROM bookings
        WHERE id = ?
        `,
        [bookingId]
      );

    if (!rows.length) {

      return res.status(404).json({
        message: "Booking not found"
      });

    }

    const booking =
      rows[0];

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

    const refundAmount =
      Number(
        booking.total_price || 0
      );

    await db.promise().query(
      `
      UPDATE users
      SET wallet = wallet + ?
      WHERE id = ?
      `,
      [
        refundAmount,
        booking.user_id
      ]
    );

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
        booking.user_id,
        booking.id,
        refundAmount,
        "credit",
        `Refund for cancelled booking ${booking.booking_code}`
      ]
    );

    res.json({
      message:
        "Booking cancelled successfully"
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
exports.extendBooking = async (
  req,
  res
) => {

  const bookingId =
    req.params.id;

  const {
    extra_hours
  } = req.body;

  try {

    const [booking] =
      await db.promise().query(
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
        message:
          "Active booking not found"
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
      [
        newDuration,
        bookingId
      ]
    );

    res.json({
      message:
        "Booking extended successfully"
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
exports.getUserBookings = async (
  req,
  res
) => {

  const user_id =
    req.user.id;

  const status =
    req.query.status;

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

    if (
      status &&
      status !== "all"
    ) {

      query +=
        ` AND b.status = ?`;

      values.push(status);

    }

    query += `
      ORDER BY b.created_at DESC
    `;

    const [bookings] =
      await db.promise().query(
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