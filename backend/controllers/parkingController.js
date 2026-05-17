const db = require("../config/db");

// ================= GET ALL =================
exports.getAllLocations = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM parking_locations"
    );

    res.json(rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
};

// ================= GET BY ID =================
exports.getLocationById = async (req, res) => {

  const { id } = req.params;

  try {

    const [rows] = await db.promise().query(
      "SELECT * FROM parking_locations WHERE id = ?",
      [id]
    );

    res.json(rows[0]);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
};

// ================= GET SLOTS =================
exports.getSlotsByLocation = async (req, res) => {

  const { id } = req.params;

  try {

    const [slots] = await db.promise().query(
      `
      SELECT 
        s.*,

        CASE

          -- CURRENT ACTIVE BOOKING
          WHEN EXISTS (
            SELECT 1
            FROM bookings b
            WHERE b.slot_id = s.id
            AND b.status IN ('active', 'pending')

            AND NOW() BETWEEN
              TIMESTAMP(b.booking_date, b.start_time)

            AND DATE_ADD(
              TIMESTAMP(b.booking_date, b.start_time),
              INTERVAL b.duration HOUR
            )
          )
          THEN 'occupied'

          -- RESERVED ONLY 15 MIN BEFORE START
          WHEN EXISTS (
            SELECT 1
            FROM bookings b
            WHERE b.slot_id = s.id
            AND b.status IN ('active', 'pending')

            AND NOW() >= DATE_SUB(
              TIMESTAMP(b.booking_date, b.start_time),
              INTERVAL 15 MINUTE
            )

            AND NOW() <
              TIMESTAMP(b.booking_date, b.start_time)
          )
          THEN 'reserved'

          ELSE 'available'

        END AS dynamic_status

      FROM slots s
      WHERE s.location_id = ?
      ORDER BY s.id ASC
      `,
      [id]
    );

    const formatted = slots.map((slot) => ({
      ...slot,
      status: slot.dynamic_status
    }));

    res.json(formatted);

  } catch (error) {

    console.log("getSlotsByLocation error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

// ================= ADD LOCATION + AUTO SLOTS =================
exports.addParkingLocation = async (req, res) => {

  const {
    name,
    address,
    latitude,
    longitude,
    total_slots,
    price_per_hour
  } = req.body;

  try {

    const [result] = await db.promise().query(
      `
      INSERT INTO parking_locations
      (name, address, latitude, longitude, total_slots, price_per_hour)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        address,
        latitude,
        longitude,
        total_slots,
        price_per_hour
      ]
    );

    const locationId = result.insertId;

    // AUTO CREATE SLOTS
    const slots = [];

    for (let i = 1; i <= total_slots; i++) {
      slots.push([locationId, `A${i}`, "available"]);
    }

    await db.promise().query(
      "INSERT INTO slots (location_id, slot_number, status) VALUES ?",
      [slots]
    );

    res.json({
      message: "Location + slots created"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
};

// ================= ADD SLOT =================
exports.addSlot = async (req, res) => {

  const { location_id, slot_number } = req.body;

  try {

    await db.promise().query(
      `
      INSERT INTO slots
      (location_id, slot_number, status)
      VALUES (?, ?, 'available')
      `,
      [location_id, slot_number]
    );

    res.json({
      message: "Slot added"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
};

// ================= UPDATE SLOT =================
exports.updateSlotStatus = async (req, res) => {

  const { slot_id, status } = req.body;

  try {

    await db.promise().query(
      "UPDATE slots SET status = ? WHERE id = ?",
      [status, slot_id]
    );

    res.json({
      message: "Updated"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
};

// ================= DELETE SLOT =================
exports.removeSlot = async (req, res) => {

  const { slot_id } = req.body;

  try {

    await db.promise().query(
      "DELETE FROM slots WHERE id = ?",
      [slot_id]
    );

    res.json({
      message: "Deleted"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
};

// ================= RATE =================
exports.rateParking = async (req, res) => {

  const { location_id, rating } = req.body;

  try {

    await db.promise().query(
      "INSERT INTO ratings (location_id, rating) VALUES (?, ?)",
      [location_id, rating]
    );

    res.json({
      message: "Rated"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
};

// ================= REVIEWS =================
exports.getLocationReviews = async (req, res) => {

  const { id } = req.params;

  try {

    // Summary
    const [[summary]] = await db.promise().query(
      `
      SELECT
        ROUND(AVG(r.rating), 1) AS average_rating,
        COUNT(*) AS total_reviews
      FROM ratings r
      WHERE r.location_id = ?
      `,
      [id]
    );

    // Reviews List
    const [reviews] = await db.promise().query(
      `
      SELECT
        r.id,
        u.name AS user_name,
        r.rating,
        r.review,
        r.admin_reply,
        DATE_FORMAT(r.created_at, '%Y-%m-%d') AS created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.location_id = ?
      ORDER BY r.created_at DESC
      `,
      [id]
    );

    res.json({
      average_rating: summary.average_rating || 0,
      total_reviews: summary.total_reviews || 0,
      reviews
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
};

// ================= NEARBY =================
exports.getNearbyParking = async (req, res) => {

  const { latitude, longitude, radius } = req.query;

  try {

    const [rows] = await db.promise().query(
      `
      SELECT
        p.*,

        (
          6371 * ACOS(
            COS(RADIANS(?)) *
            COS(RADIANS(p.latitude)) *
            COS(RADIANS(p.longitude) - RADIANS(?)) +
            SIN(RADIANS(?)) *
            SIN(RADIANS(p.latitude))
          )
        ) AS distance,

        (
          SELECT COUNT(*)
          FROM slots s
          WHERE s.location_id = p.id
          AND s.status = 'available'
        ) AS available_slots,

        (
          SELECT ROUND(AVG(r.rating),1)
          FROM ratings r
          WHERE r.location_id = p.id
        ) AS average_rating,

        (
          SELECT COUNT(*)
          FROM ratings r
          WHERE r.location_id = p.id
        ) AS total_reviews

      FROM parking_locations p

      HAVING distance < ?

      ORDER BY distance ASC
      `,
      [
        latitude,
        longitude,
        latitude,
        radius || 5
      ]
    );

    res.json({
      data: rows
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
};