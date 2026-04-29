const cron = require("node-cron");
const db = require("../config/db");

cron.schedule("* * * * *", async () => {
  try {
    console.log("[Cron] Checking active bookings...");

    const [activeBookings] = await db.promise().query(
      `SELECT * FROM bookings WHERE status = 'active'`
    );

    console.log("[Cron] Active bookings found:", activeBookings.length);

    const now = new Date();

    for (let booking of activeBookings) {
      const bookingDateStr = booking.booking_date instanceof Date
        ? booking.booking_date.toISOString().split("T")[0]
        : booking.booking_date;

      const startDateTime = new Date(`${bookingDateStr}T${booking.start_time}`);
      const endTime = new Date(startDateTime.getTime() + booking.duration * 60 * 60 * 1000);
      const reminderTime = new Date(endTime.getTime() - 10 * 60 * 1000);

      // 🔔 Send 10-minute reminder
      if (
        now >= reminderTime &&
        now < endTime &&
        !booking.reminder_sent
      ) {
        await db.promise().query(
          `INSERT INTO notifications 
           (user_id, booking_id, message, type)
           VALUES (?, ?, ?, 'reminder')`,
          [
            booking.user_id,
            booking.id,
            `Your booking ${booking.booking_code} ends in 10 minutes. Please extend or vacate the slot.`
          ]
        );

        await db.promise().query(
          "UPDATE bookings SET reminder_sent = 1 WHERE id = ?",
          [booking.id]
        );

        console.log(`[Cron] Reminder sent for booking ${booking.booking_code}`);
      }

      // ⏱ Auto complete booking after end time
      if (now >= endTime) {
        await db.promise().query(
          "UPDATE bookings SET status = 'completed' WHERE id = ?",
          [booking.id]
        );

        await db.promise().query(
          "UPDATE slots SET status = 'available' WHERE id = ?",
          [booking.slot_id]
        );

        await db.promise().query(
          `INSERT INTO notifications 
           (user_id, booking_id, message, type)
           VALUES (?, ?, ?, 'alert')`,
          [
            booking.user_id,
            booking.id,
            `Your booking ${booking.booking_code} has been completed. Slot is now free.`
          ]
        );

        console.log(`[Cron] Booking ${booking.id} auto-completed`);
      }
    }
  } catch (error) {
    console.log("[Cron] Error:", error);
  }
});

