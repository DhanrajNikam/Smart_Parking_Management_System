require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const cron = require("node-cron");

const db = require("./config/db");

const {
  checkAndNotifyAvailability
} = require("./controllers/parkingAvailabilityController");

const app = express();

/*
==================================================
AUTO COMPLETE BOOKING CRON
==================================================
*/

cron.schedule("* * * * *", async () => {

  try {

    console.log("[Cron] Checking expired bookings...");

    // COMPLETE EXPIRED BOOKINGS
    const [result] = await db.promise().query(`
      UPDATE bookings
      SET status = 'completed'
      WHERE status = 'active'
      AND DATE_ADD(
            TIMESTAMP(booking_date, start_time),
            INTERVAL duration HOUR
          ) <= NOW()
    `);

    console.log(
      `[Cron] Completed bookings: ${result.affectedRows}`
    );

    // FREE COMPLETED SLOT
    await db.promise().query(`
      UPDATE slots s
      JOIN bookings b
        ON s.id = b.slot_id
      SET s.status = 'available'
      WHERE b.status = 'completed'
    `);

    console.log("[Cron] Slots updated");

  } catch (error) {

    console.log("[Cron Error]", error);

  }

});

console.log("Reminder Cron Started...");

/*
==================================================
PARKING FULL NOTIFY CRON
==================================================
*/

cron.schedule("*/1 * * * *", async () => {

  try {

    await checkAndNotifyAvailability(
      { body: {} },
      {
        status: () => ({
          json: () => {}
        }),
        json: () => {}
      }
    );

    console.log(
      "[Cron] Parking full notify scan completed"
    );

  } catch (e) {

    console.log(
      "[Cron] Parking notify scan error:",
      e
    );

  }

});

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

  console.log(
    "Client Connected:",
    socket.id
  );

  socket.on("disconnect", () => {

    console.log(
      "Client Disconnected:",
      socket.id
    );

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
const walletRoutes = require("./routes/walletRoutes");
const supportRoutes = require("./routes/supportRoutes");

const parkingAvailabilityRoutes = require(
  "./routes/parkingAvailabilityRoutes"
);

const qrRoutes = require("./routes/qrRoutes");

const anprRoutes = require("./routes/anprRoutes");

/* ================= API ROUTES ================= */

app.use("/api/auth", authRoutes);

app.use("/api/parking", parkingRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/favorites", favoriteRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/user", userRoutes);

app.use("/api/ratings", ratingRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/wallet", walletRoutes);

app.use("/api/support", supportRoutes);

// PARKING AVAILABILITY
app.use(
  "/api/parking-availability",
  parkingAvailabilityRoutes
);

// QR ROUTES
app.use(
  "/api/qr",
  qrRoutes
);

// ANPR ROUTES
app.use(
  "/api/anpr",
  anprRoutes
);

/* ================= ROOT ================= */

app.get("/", (req, res) => {

  res.send(
    "Smart Parking Backend Running"
  );

});

/* ================= 404 ================= */

app.use((req, res) => {

  res.status(404).json({
    message: "Route Not Found"
  });

});

/* ================= GLOBAL ERROR ================= */

app.use((err, req, res, next) => {

  console.error(
    "Server Error:",
    err.stack
  );

  res.status(500).json({
    message: "Internal Server Error"
  });

});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});