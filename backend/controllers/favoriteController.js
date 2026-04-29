const db = require("../config/db");

exports.addFavorite = async (req, res) => {
  const user_id = req.user.id;
  const { location_id } = req.body;

  try {
    await db.promise().query(
      "INSERT INTO favorites (user_id, location_id) VALUES (?, ?)",
      [user_id, location_id]
    );

    res.status(201).json({ message: "Added to favorites" });
  } catch (error) {
    res.status(400).json({ message: "Already in favorites" });
  }
};

exports.removeFavorite = async (req, res) => {
  const user_id = req.user.id;
  const { location_id } = req.params;

  try {
    await db.promise().query(
      "DELETE FROM favorites WHERE user_id = ? AND location_id = ?",
      [user_id, location_id]
    );

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFavorites = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [favorites] = await db.promise().query(
      `SELECT parking_locations.*
       FROM favorites
       JOIN parking_locations
       ON favorites.location_id = parking_locations.id
       WHERE favorites.user_id = ?`,
      [user_id]
    );

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};