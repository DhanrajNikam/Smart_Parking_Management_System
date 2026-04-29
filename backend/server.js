// backend/server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const cron = require("node-cron");
const db = require("./config/db");

const app = express();

/*
==================================================
AUTO COMPLETE BOOKING CRON
==================================================

Only complete booking AFTER:
start_time + duration < current time

Runs every 1 minute
==================================================
*/

cron.schedule("* * * * *", async () => {
  try {
    console.log("[Cron] Checking active bookings...");

    const [bookings] = await db.promise().query(`
      SELECT 
        id,
        booking_date,
        start_time,
        duration,
        status
      FROM bookings
      WHERE status = 'active'
    `);

    console.log(`[Cron] Active bookings found: ${bookings.length}`);

    const now = new Date();

    for (const booking of bookings) {
      const bookingStart = new Date(
        `${booking.booking_date}T${booking.start_time}`
      );

      const bookingEnd = new Date(bookingStart);

      bookingEnd.setHours(
        bookingEnd.getHours() + Number(booking.duration)
      );

      if (now > bookingEnd) {
        await db.promise().query(
          `
          UPDATE bookings
          SET status = 'completed'
          WHERE id = ?
          `,
          [booking.id]
        );

        console.log(
          `[Cron] Booking ${booking.id} auto-completed`
        );
      }
    }
  } catch (error) {
    console.log("[Cron Error]", error);
  }
});

console.log("Reminder Cron Started...");

/* ================= HTTP SERVER ================= */

const server = http.createServer(app);

/* ================= SOCKET IO ================= */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client Disconnected:", socket.id);
  });
});

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */

const authRoutes = require("./routes/authRoutes");
const parkingRoutes = require("./routes/parkingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("Smart Parking Backend Running");
});

/* ================= 404 ================= */

app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found"
  });
});

/* ================= GLOBAL ERROR ================= */

app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);

  res.status(500).json({
    message: "Internal Server Error"
  });
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});