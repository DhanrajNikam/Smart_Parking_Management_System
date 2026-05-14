import React, { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function Rating() {
  const location = useLocation();
  const [bookingCode, setBookingCode] = useState(
    location.state?.booking_code || ""
  );
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const submitRating = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/ratings/add",
        {
          booking_code: bookingCode,
          rating,
          review
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(res.data.message);

      setBookingCode("");
      setRating(5);
      setReview("");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to submit rating");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Rate Parking</h2>

      <input
        type="text"
        placeholder="Booking Code"
        value={bookingCode}
        onChange={(e) => setBookingCode(e.target.value)}
        style={styles.input}
      />

      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        style={styles.input}
      >
        <option value="1">1 Star</option>
        <option value="2">2 Star</option>
        <option value="3">3 Star</option>
        <option value="4">4 Star</option>
        <option value="5">5 Star</option>
      </select>

      <textarea
        placeholder="Write Review"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        style={styles.textarea}
      />

      <button onClick={submitRating} style={styles.button}>
        Submit Rating
      </button>
    </div>
  );
}

const styles = {
  container: {
    width: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },

  input: {
    padding: "10px",
    fontSize: "16px"
  },

  textarea: {
    padding: "10px",
    minHeight: "100px",
    fontSize: "16px"
  },

  button: {
    padding: "12px",
    background: "black",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "16px"
  }
};

export default Rating;

