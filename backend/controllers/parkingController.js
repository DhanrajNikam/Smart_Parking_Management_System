// const db = require("../config/db");


// // =====================================
// // GET ALL PARKING LOCATIONS (WITH AVG RATING)
// // =====================================
// exports.getAllLocations = async (req, res) => {
//   try {
//     const [locations] = await db.promise().query(`
//       SELECT 
//         p.*,
//         ROUND(AVG(r.rating), 1) AS rating
//       FROM parking_locations p
//       LEFT JOIN ratings r ON p.id = r.location_id
//       GROUP BY p.id
//       ORDER BY p.id DESC
//     `);

//     res.json(locations);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // =====================================
// // GET LOCATION BY ID (WITH RATING)
// // =====================================
// exports.getLocationById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [location] = await db.promise().query(`
//       SELECT 
//         p.*,
//         ROUND(AVG(r.rating), 1) AS rating
//       FROM parking_locations p
//       LEFT JOIN ratings r ON p.id = r.location_id
//       WHERE p.id = ?
//       GROUP BY p.id
//     `, [id]);

//     if (location.length === 0) {
//       return res.status(404).json({ message: "Location not found" });
//     }

//     res.json(location[0]);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // =====================================
// // GET SLOTS BY LOCATION
// // =====================================
// exports.getSlotsByLocation = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [slots] = await db.promise().query(
//       `SELECT
//          s.*,
//          b.id AS active_booking_id,
//          b.booking_code AS active_booking_code,
//          b.booking_date AS active_booking_date,
//          b.start_time AS active_start_time,
//          b.duration AS active_duration,
//          b.vehicle_type AS active_vehicle_type,
//          b.vehicle_number AS active_vehicle_number,
//          u.name AS booked_by_user
//        FROM slots s
//        LEFT JOIN bookings b
//          ON b.slot_id = s.id
//          AND b.status = 'active'
//          AND b.booking_date = CURDATE()
//        LEFT JOIN users u ON b.user_id = u.id
//        WHERE s.location_id = ?
//        ORDER BY s.slot_number ASC`,
//       [id]
//     );

//     // Compute display_status: if there's an active booking today → occupied
//     const enriched = slots.map((slot) => ({
//       ...slot,
//       display_status: slot.active_booking_id ? "occupied" : slot.status
//     }));

//     res.json(enriched);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // =====================================
// // ADD PARKING LOCATION (ADMIN)
// // =====================================
// exports.addParkingLocation = async (req, res) => {
//   const { name, address, latitude, longitude, total_slots, price_per_hour } =
//     req.body;

//   if (!name || !address || !latitude || !longitude || !total_slots || !price_per_hour) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     const [result] = await db.promise().query(
//       `INSERT INTO parking_locations 
//       (name, address, latitude, longitude, total_slots, price_per_hour)
//       VALUES (?, ?, ?, ?, ?, ?)`,
//       [name, address, latitude, longitude, total_slots, price_per_hour]
//     );

//     res.status(201).json({
//       message: "Parking location added successfully",
//       location_id: result.insertId
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // =====================================
// // ADD SLOT (ADMIN)
// // =====================================
// exports.addSlot = async (req, res) => {
//   const { location_id, slot_number } = req.body;

//   if (!location_id || !slot_number) {
//     return res.status(400).json({ message: "location_id and slot_number required" });
//   }

//   try {
//     await db.promise().query(
//       "INSERT INTO slots (location_id, slot_number, status) VALUES (?, ?, 'available')",
//       [location_id, slot_number]
//     );

//     res.status(201).json({ message: "Slot added successfully" });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // =====================================
// // RATE + REVIEW PARKING
// // =====================================
// exports.rateParking = async (req, res) => {
//   const { location_id, rating, review } = req.body;
//   const user_id = req.user.id;

//   if (!location_id || !rating) {
//     return res.status(400).json({ message: "location_id and rating required" });
//   }

//   if (rating < 1 || rating > 5) {
//     return res.status(400).json({ message: "Rating must be between 1 and 5" });
//   }

//   try {
//     await db.promise().query(
//       `
//       INSERT INTO ratings (user_id, location_id, rating, review)
//       VALUES (?, ?, ?, ?)
//       ON DUPLICATE KEY UPDATE 
//         rating = VALUES(rating),
//         review = VALUES(review)
//       `,
//       [user_id, location_id, rating, review || null]
//     );

//     res.json({ message: "Review submitted successfully" });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // =====================================
// // GET REVIEWS FOR LOCATION
// // =====================================
// exports.getLocationReviews = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [reviews] = await db.promise().query(
//       `
//       SELECT 
//         r.rating,
//         r.review,
//         r.created_at,
//         u.name AS user_name
//       FROM ratings r
//       JOIN users u ON r.user_id = u.id
//       WHERE r.location_id = ?
//       ORDER BY r.created_at DESC
//       `,
//       [id]
//     );

//     res.json(reviews);

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // =====================================
// // GET NEARBY PARKING (DISTANCE + RADIUS + RATING)
// // =====================================
// exports.getNearbyParking = async (req, res) => {
//   const { latitude, longitude, radius, availableOnly, sort, page, limit } = req.query;

//   if (!latitude || !longitude) {
//     return res.status(400).json({ message: "Latitude and Longitude required" });
//   }

//   const searchRadius = radius ? parseFloat(radius) : 5;
//   const pageNumber = page ? parseInt(page) : 1;
//   const pageLimit = limit ? parseInt(limit) : 5;
//   const offset = (pageNumber - 1) * pageLimit;

//   let orderClause = "ORDER BY distance ASC";

//   if (sort === "rating") {
//     orderClause = "ORDER BY rating DESC, distance ASC";
//   }

//   if (sort === "price") {
//     orderClause = "ORDER BY p.price_per_hour ASC";
//   }

//   try {
//     // Main Data Query with Pagination
//     const [locations] = await db.promise().query(
//       `
//       SELECT 
//         p.id,
//         p.name,
//         p.address,
//         p.latitude,
//         p.longitude,
//         p.price_per_hour,
//         COUNT(DISTINCT s.id) AS total_slots,
//         SUM(CASE WHEN s.status = 'available' THEN 1 ELSE 0 END) AS available_slots,
//         ROUND(AVG(r.rating), 1) AS rating,
//         (
//           6371 * ACOS(
//             COS(RADIANS(?)) *
//             COS(RADIANS(p.latitude)) *
//             COS(RADIANS(p.longitude) - RADIANS(?)) +
//             SIN(RADIANS(?)) *
//             SIN(RADIANS(p.latitude))
//           )
//         ) AS distance
//       FROM parking_locations p
//       LEFT JOIN slots s ON p.id = s.location_id
//       LEFT JOIN ratings r ON p.id = r.location_id
//       GROUP BY p.id
//       HAVING distance <= ?
//       ${availableOnly === "true" ? "AND available_slots > 0" : ""}
//       ${orderClause}
//       LIMIT ? OFFSET ?
//       `,
//       [latitude, longitude, latitude, searchRadius, pageLimit, offset]
//     );

//     // Count Query (for total pages)
//     const [countResult] = await db.promise().query(
//       `
//       SELECT COUNT(*) AS total
//       FROM (
//         SELECT p.id
//         FROM parking_locations p
//         LEFT JOIN slots s ON p.id = s.location_id
//         GROUP BY p.id
//       ) AS temp
//       `
//     );

//     const total = countResult[0].total;
//     const totalPages = Math.ceil(total / pageLimit);

//     res.json({
//       currentPage: pageNumber,
//       totalPages,
//       totalItems: total,
//       data: locations
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // =====================================
// // UPDATE SLOT STATUS (ADMIN)
// // =====================================
// exports.updateSlotStatus = async (req, res) => {
//   const { slot_id, status } = req.body;

//   if (!slot_id || !status) {
//     return res.status(400).json({ message: "slot_id and status required" });
//   }

//   const allowedStatuses = ["available", "occupied", "reserved"];

//   if (!allowedStatuses.includes(status)) {
//     return res.status(400).json({ message: "Invalid status value" });
//   }

//   try {
//     await db.promise().query(
//       "UPDATE slots SET status = ? WHERE id = ?",
//       [status, slot_id]
//     );

//     const io = req.app.get("io");
//     if (io) {
//       io.emit("slotUpdated", { slotId: slot_id, status });
//     }

//     res.json({ message: "Slot status updated successfully", slot_id, status });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // =====================================
// // REMOVE SLOT (ADMIN)
// // =====================================
// exports.removeSlot = async (req, res) => {
//   const { slot_id } = req.body;

//   if (!slot_id) {
//     return res.status(400).json({ message: "slot_id required" });
//   }

//   try {
//     const [active] = await db.promise().query(
//       "SELECT id FROM bookings WHERE slot_id = ? AND status IN ('active','pending')",
//       [slot_id]
//     );

//     if (active.length > 0) {
//       return res.status(400).json({ message: "Cannot delete slot with active bookings" });
//     }

//     await db.promise().query(
//       "DELETE FROM slots WHERE id = ?",
//       [slot_id]
//     );

//     res.json({ message: "Slot removed successfully" });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const db = require("../config/db");

// // ================= GET ALL =================
// exports.getAllLocations = async (req, res) => {
//   try {
//     const [rows] = await db.promise().query("SELECT * FROM parking_locations");
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= GET BY ID =================
// exports.getLocationById = async (req, res) => {
//   const { id } = req.params;
//   const [rows] = await db.promise().query(
//     "SELECT * FROM parking_locations WHERE id = ?",
//     [id]
//   );
//   res.json(rows[0]);
// };

// // ================= GET SLOTS =================
// exports.getSlotsByLocation = async (req, res) => {
//   const { id } = req.params;
//   const [rows] = await db.promise().query(
//     "SELECT * FROM slots WHERE location_id = ?",
//     [id]
//   );
//   res.json(rows);
// };

// // ================= ADD LOCATION + AUTO SLOTS =================
// exports.addParkingLocation = async (req, res) => {
//   const { name, address, latitude, longitude, total_slots, price_per_hour } =
//     req.body;

//   try {
//     const [result] = await db.promise().query(
//       `INSERT INTO parking_locations 
//       (name, address, latitude, longitude, total_slots, price_per_hour)
//       VALUES (?, ?, ?, ?, ?, ?)`,
//       [name, address, latitude, longitude, total_slots, price_per_hour]
//     );

//     const locationId = result.insertId;

//     // 🔥 AUTO CREATE SLOTS
//     const slots = [];
//     for (let i = 1; i <= total_slots; i++) {
//       slots.push([locationId, `A${i}`, "available"]);
//     }

//     await db.promise().query(
//       "INSERT INTO slots (location_id, slot_number, status) VALUES ?",
//       [slots]
//     );

//     res.json({ message: "Location + slots created" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= ADD SLOT =================
// exports.addSlot = async (req, res) => {
//   const { location_id, slot_number } = req.body;

//   await db.promise().query(
//     "INSERT INTO slots (location_id, slot_number, status) VALUES (?, ?, 'available')",
//     [location_id, slot_number]
//   );

//   res.json({ message: "Slot added" });
// };

// // ================= UPDATE SLOT =================
// exports.updateSlotStatus = async (req, res) => {
//   const { slot_id, status } = req.body;

//   await db.promise().query(
//     "UPDATE slots SET status=? WHERE id=?",
//     [status, slot_id]
//   );

//   res.json({ message: "Updated" });
// };

// // ================= DELETE SLOT =================
// exports.removeSlot = async (req, res) => {
//   const { slot_id } = req.body;

//   await db.promise().query(
//     "DELETE FROM slots WHERE id=?",
//     [slot_id]
//   );

//   res.json({ message: "Deleted" });
// };

// // ================= RATE =================
// exports.rateParking = async (req, res) => {
//   const { location_id, rating } = req.body;

//   await db.promise().query(
//     "INSERT INTO ratings (location_id, rating) VALUES (?, ?)",
//     [location_id, rating]
//   );

//   res.json({ message: "Rated" });
// };

// // ================= REVIEWS =================
// exports.getLocationReviews = async (req, res) => {
//   const { id } = req.params;

//   const [rows] = await db.promise().query(
//     "SELECT * FROM ratings WHERE location_id=?",
//     [id]
//   );

//   res.json(rows);
// };

// // ================= NEARBY =================
// exports.getNearbyParking = async (req, res) => {
//   const { latitude, longitude, radius } = req.query;

//   const [rows] = await db.promise().query(
//     `
//     SELECT *,
//     (
//       6371 * ACOS(
//         COS(RADIANS(?)) *
//         COS(RADIANS(latitude)) *
//         COS(RADIANS(longitude) - RADIANS(?)) +
//         SIN(RADIANS(?)) *
//         SIN(RADIANS(latitude))
//       )
//     ) AS distance
//     FROM parking_locations
//     HAVING distance < ?
//     ORDER BY distance
//     `,
//     [latitude, longitude, latitude, radius || 5]
//   );

//   res.json({ data: rows });
// };



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

    const [rows] = await db.promise().query(
      "SELECT * FROM ratings WHERE location_id = ?",
      [id]
    );

    res.json(rows);

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
      SELECT *,
      (
        6371 * ACOS(
          COS(RADIANS(?)) *
          COS(RADIANS(latitude)) *
          COS(RADIANS(longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) *
          SIN(RADIANS(latitude))
        )
      ) AS distance
      FROM parking_locations
      HAVING distance < ?
      ORDER BY distance
      `,
      [latitude, longitude, latitude, radius || 5]
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