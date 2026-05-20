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

const {
  sendEmail
} = require("./utils/emailService");

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

/*
==================================================
15 MINUTE START REMINDER EMAIL CRON
==================================================
*/

cron.schedule("* * * * *", async () => {

  try {

    console.log(
      "[Cron] Checking upcoming bookings..."
    );

    const [bookings] =
      await db.promise().query(`
        SELECT
          b.*,
          u.email,
          pl.name AS location_name,
          pl.latitude,
          pl.longitude
        FROM bookings b
        JOIN users u
          ON b.user_id = u.id
        JOIN parking_locations pl
          ON b.location_id = pl.id
        WHERE b.status = 'active'
        AND TIMESTAMP(
              b.booking_date,
              b.start_time
            )
            BETWEEN NOW()
            AND DATE_ADD(
                  NOW(),
                  INTERVAL 15 MINUTE
                )
      `);

    for (const booking of bookings) {

      try {

        if (booking.email) {

          const mapsUrl =
            `https://maps.google.com/?q=${booking.latitude},${booking.longitude}`;

          const emailHtml = `
          <div style="
            font-family:Arial;
            max-width:600px;
            margin:auto;
            padding:20px;
            background:#f5f7fb;
          ">

            <div style="
              background:#0d6efd;
              color:white;
              padding:20px;
              border-radius:12px;
            ">
              <h2>
                🚗 Smart Parking Reminder
              </h2>
            </div>

            <div style="
              background:white;
              padding:25px;
              border-radius:12px;
              margin-top:20px;
              border:1px solid #eee;
            ">

              <h3 style="color:#0d6efd;">
                Your booking starts in 15 minutes ⏰
              </h3>

              <p>
                <b>Booking Code:</b><br/>
                ${booking.booking_code}
              </p>

              <p>
                <b>Parking Location:</b><br/>
                ${booking.location_name}
              </p>

              <p>
                <b>Slot Number:</b><br/>
                ${booking.slot_id}
              </p>

              <p>
                <b>Start Time:</b><br/>
                ${booking.booking_date}
                ${booking.start_time}
              </p>

              <p>
                <b>Duration:</b><br/>
                ${booking.duration} Hour(s)
              </p>

              <a
                href="${mapsUrl}"
                target="_blank"
                style="
                  display:inline-block;
                  background:#0d6efd;
                  color:white;
                  padding:12px 18px;
                  text-decoration:none;
                  border-radius:8px;
                  margin-top:10px;
                "
              >
                Open Directions
              </a>

              <p style="margin-top:30px;">
                Thank you for using Smart Parking 🚘
              </p>

            </div>

          </div>
          `;

          await sendEmail({

            to: booking.email,

            subject:
              "Parking Reminder - Smart Parking",

            text:
              `Your parking booking starts in 15 minutes.`,

            html: emailHtml

          });

          console.log(
            "Start reminder email sent:",
            booking.booking_code
          );

        }

      } catch (emailError) {

        console.log(
          "Reminder Email Error:",
          emailError
        );

      }

    }

  } catch (error) {

    console.log(
      "[Reminder Cron Error]",
      error
    );

  }

});

/*
==================================================
15 MINUTE END REMINDER EMAIL CRON
==================================================
*/

cron.schedule("* * * * *", async () => {

  try {

    console.log(
      "[Cron] Checking ending bookings..."
    );

    const [bookings] =
      await db.promise().query(`
        SELECT
          b.*,
          u.email,
          pl.name AS location_name
        FROM bookings b
        JOIN users u
          ON b.user_id = u.id
        JOIN parking_locations pl
          ON b.location_id = pl.id
        WHERE b.status = 'active'
        AND DATE_SUB(
              DATE_ADD(
                TIMESTAMP(
                  b.booking_date,
                  b.start_time
                ),
                INTERVAL b.duration HOUR
              ),
              INTERVAL 15 MINUTE
            )
            BETWEEN NOW()
            AND DATE_ADD(
                  NOW(),
                  INTERVAL 1 MINUTE
                )
      `);

    for (const booking of bookings) {

      try {

        if (booking.email) {

          const endTime = new Date(
            new Date(
              `${booking.booking_date} ${booking.start_time}`
            ).getTime() +
            booking.duration * 60 * 60 * 1000
          );

          const emailHtml = `
          <div style="
            font-family:Arial;
            max-width:600px;
            margin:auto;
            padding:20px;
            background:#f5f7fb;
          ">

            <div style="
              background:#dc3545;
              color:white;
              padding:20px;
              border-radius:12px;
            ">
              <h2>
                ⏰ Parking Ending Soon
              </h2>
            </div>

            <div style="
              background:white;
              padding:25px;
              border-radius:12px;
              margin-top:20px;
              border:1px solid #eee;
            ">

              <h3 style="color:#dc3545;">
                Your parking session will end in 15 minutes
              </h3>

              <p>
                <b>Booking Code:</b><br/>
                ${booking.booking_code}
              </p>

              <p>
                <b>Parking Location:</b><br/>
                ${booking.location_name}
              </p>

              <p>
                <b>Slot Number:</b><br/>
                ${booking.slot_id}
              </p>

              <p>
                <b>End Time:</b><br/>
                ${endTime}
              </p>

              <p style="
                margin-top:20px;
                color:#6b7280;
              ">
                If needed, please extend your booking before expiry to avoid penalties.
              </p>

              <p style="
                margin-top:25px;
                font-size:14px;
                color:#999;
              ">
                Thank you for using Smart Parking 🚘
              </p>

            </div>

          </div>
          `;

          await sendEmail({

            to: booking.email,

            subject:
              "Parking Ending Soon - Smart Parking",

            text:
              "Your parking session will end in 15 minutes.",

            html: emailHtml

          });

          console.log(
            "End reminder email sent:",
            booking.booking_code
          );

        }

      } catch (emailError) {

        console.log(
          "End Reminder Email Error:",
          emailError
        );

      }

    }

  } catch (error) {

    console.log(
      "[End Reminder Cron Error]",
      error
    );

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

app.use(
  "/api/parking-availability",
  parkingAvailabilityRoutes
);

app.use(
  "/api/qr",
  qrRoutes
);

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