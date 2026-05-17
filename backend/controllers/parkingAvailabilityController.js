const db = require("../config/db");

// Simple duplicate prevention helper
async function alreadyRequested({ user_id, parking_location_id }) {
  const [rows] = await db.promise().query(
    `SELECT id FROM parking_full_notifications
     WHERE user_id = ? AND parking_location_id = ? AND is_completed = FALSE
     ORDER BY created_at DESC LIMIT 1`,
    [user_id, parking_location_id]
  );
  return rows.length > 0;
}

function buildSlotAvailableMessage(parkingName) {
  return `Slot now available at ${parkingName}`;
}

exports.notifyWhenFull = async (req, res) => {
  const user_id = req.user.id;
  const { parking_location_id } = req.body;

  if (!parking_location_id) {
    return res.status(400).json({ message: "parking_location_id is required" });
  }

  try {
    // Ensure parking exists and fetch name
    const [locRows] = await db.promise().query(
      `SELECT id, name FROM parking_locations WHERE id = ?`,
      [parking_location_id]
    );

    if (locRows.length === 0) {
      return res.status(404).json({ message: "Parking location not found" });
    }

    // Duplicate prevention (same user/location)
    const exists = await alreadyRequested({ user_id, parking_location_id });
    if (exists) {
      return res.json({ message: "Notification request already exists" });
    }

    await db.promise().query(
      `INSERT INTO parking_full_notifications (user_id, parking_location_id)
       VALUES (?, ?)`,
      [user_id, parking_location_id]
    );

    return res.json({ message: "Notification request saved" });
  } catch (err) {
    console.log("notifyWhenFull error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getNotifyRequestsForLocation = async (req, res) => {
  const user_id = req.user.id;
  const parking_location_id = req.params.parking_location_id;

  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM parking_full_notifications
       WHERE user_id = ? AND parking_location_id = ? AND is_completed = FALSE
       ORDER BY created_at DESC`,
      [user_id, parking_location_id]
    );

    res.json({ hasActiveRequest: rows.length > 0, requests: rows });
  } catch (err) {
    console.log("getNotifyRequestsForLocation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Called by cron/automation: if parking has any available slot, notify all waiting users.
exports.checkAndNotifyAvailability = async (req, res) => {
  // In this project, we allow admin/system call with token; we just scan.
  try {
    // Find all active notify requests
    const [requests] = await db.promise().query(
      `SELECT r.id AS request_id, r.user_id, r.parking_location_id, r.created_at
       FROM parking_full_notifications r
       WHERE r.is_completed = FALSE
       ORDER BY r.created_at DESC
       LIMIT 500`
    );

    if (requests.length === 0) {
      return res.json({ message: "No pending notifications" });
    }

    // Check availability per location. We do it in a loop for simplicity.
    let notified = 0;

    for (const r of requests) {
      const [locRows] = await db.promise().query(
        `SELECT pl.id, pl.name FROM parking_locations pl WHERE pl.id = ?`,
        [r.parking_location_id]
      );
      if (locRows.length === 0) continue;

      const parkingName = locRows[0].name;

      const [slotRows] = await db.promise().query(
        `SELECT COUNT(*) AS cnt
         FROM slots s
         WHERE s.location_id = ? AND s.status = 'available'`,
        [r.parking_location_id]
      );

      const availableCount = slotRows[0].cnt || 0;

      if (availableCount > 0) {
        const message = buildSlotAvailableMessage(parkingName);

        // Create in-app notification for the user
        await db.promise().query(
          `INSERT INTO notifications (user_id, message, type, is_read, booking_id)
           VALUES (?, ?, 'alert', FALSE, NULL)`,
          [r.user_id, message]
        );

        // Mark request completed
        await db.promise().query(
          `UPDATE parking_full_notifications SET is_completed = TRUE, completed_at = NOW()
           WHERE id = ?`,
          [r.request_id]
        );

        notified++;
      }
    }

    return res.json({ message: "Check completed", notified });
  } catch (err) {
    console.log("checkAndNotifyAvailability error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

