const db = require("../config/db");

// ⭐ Add Rating
exports.addRating = async (req, res) => {
const { booking_code, rating, review } = req.body;
const user_id = req.user.id;

  try {

    // ✅ Rating Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    // ✅ Check booking completed
    const [booking] = await db.promise().query(
      `SELECT location_id
       FROM bookings
       WHERE booking_code = ?
       AND user_id = ?
       AND status = 'completed'`,
      [booking_code, user_id]
    );


    if (booking.length === 0) {
      return res.status(400).json({
        message: "You can rate only completed bookings"
      });
    }

    // ✅ Prevent duplicate rating
    const [existing] = await db.promise().query(
      "SELECT id FROM ratings WHERE booking_code = ?",
      [booking_code]
    );


    if (existing.length > 0) {
      return res.status(400).json({
        message: "Rating already submitted"
      });
    }

    // ✅ Insert Rating
    await db.promise().query(
      `INSERT INTO ratings
      (user_id, booking_code, location_id, rating, review)
      VALUES (?, ?, ?, ?, ?)`,
      [
        user_id,
        booking_code,
        booking[0].location_id,
        rating,
        review
      ]
    );

    res.json({
      message: "Rating submitted successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// ⭐ Get Average Rating
exports.getLocationRating = async (req, res) => {

  const { location_id } = req.params;

  try {

    const [result] = await db.promise().query(
      `SELECT
        ROUND(AVG(rating),1) AS average_rating,
        COUNT(*) AS total_reviews
      FROM ratings
      WHERE location_id = ?`,
      [location_id]
    );

    res.json(result[0]);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};