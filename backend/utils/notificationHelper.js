const db = require("../config/db");

exports.createNotification = async (
  user_id,
  message,
  type = "info",
  booking_id = null
) => {
  try {
    await db.promise().query(
      `INSERT INTO notifications (user_id, message, type, booking_id)
       VALUES (?, ?, ?, ?)`,
      [user_id, message, type, booking_id]
    );
  } catch (error) {
    console.log("Notification error:", error);
  }
};