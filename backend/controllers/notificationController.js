const db = require("../config/db");

exports.getNotifications = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [notifications] = await db.promise().query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    await db.promise().query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ?",
      [id]
    );

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};