const db = require("../config/db");

exports.getDashboard = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [[available]] = await db.promise().query(
      "SELECT COUNT(*) as count FROM slots WHERE status = 'available'"
    );

    const [[occupied]] = await db.promise().query(
      "SELECT COUNT(*) as count FROM slots WHERE status = 'occupied'"
    );

    const [[activeBookings]] = await db.promise().query(
      "SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND status = 'active'",
      [user_id]
    );

    const [[favorites]] = await db.promise().query(
      "SELECT COUNT(*) as count FROM favorites WHERE user_id = ?",
      [user_id]
    );

    const [[user]] = await db.promise().query(
      "SELECT name FROM users WHERE id = ?",
      [user_id]
    );

    res.json({
      user_name: user.name,
      available_slots: available.count,
      occupied_slots: occupied.count,
      active_bookings: activeBookings.count,
      favorite_locations: favorites.count
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};