const db = require("../config/db");
const { sendSMS } = require("./smsService");

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

function formatDateTime(dateStr, timeStr) {
  // dateStr: YYYY-MM-DD
  // timeStr: HH:mm:ss or HH:mm
  const d = new Date(`${dateStr}T${timeStr}`);
  if (Number.isNaN(d.getTime())) return `${dateStr} ${timeStr}`;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(d);
}

exports.sendBookingSMS = async ({
  phone_number,
  booking_code,
  slot_id,
  booking_date,
  start_time,
  location_address
}) => {
  if (!phone_number) return;

  const to = phone_number;

  const start = formatDateTime(booking_date, start_time);
  // End time not available in booking create payload; keep SMS consistent for existing feature

  const locationLine = location_address ? `\nLocation:\n${location_address}` : "";

  const body = [
    "Smart Parking System",
    "",
    "Booking Confirmed ✅",
    "",
    `Code: ${booking_code}`,
    `Slot: ${slot_id}`,
    "",
    locationLine ? locationLine : null,
    "",
    `Start Time: ${start}`
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await sendSMS(to, body);
  } catch (err) {
    console.log("SMS send failed:", err?.message || err);
  }
};

exports.sendBookingCancelledSMS = async ({
  phone_number,
  booking_code,
  refund_amount,
  slot_id,
  location_address,
  start_time_display,
  end_time_display
}) => {
  if (!phone_number) return;

  const to = phone_number;

  const refundLine = refund_amount
    ? `₹${Number(refund_amount).toFixed(2).replace(/\.00$/, "") } refunded to wallet`
    : "Refund added to wallet";

  const body = [
    "Smart Parking System",
    "",
    "Booking Cancelled ❌",
    "",
    `Code: ${booking_code}`,
    "",
    refundLine,
    "",
    slot_id ? `Slot: ${slot_id}` : null,
    location_address ? `Location:\n${location_address}` : null,
    start_time_display ? `Start Time: ${start_time_display}` : null,
    end_time_display ? `End Time: ${end_time_display}` : null
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await sendSMS(to, body);
  } catch (err) {
    console.log("SMS send failed:", err?.message || err);
  }
};

exports.sendRefundStatusSMS = async ({
  phone_number,
  booking_code,
  refund_amount,
  status
}) => {
  if (!phone_number) return;

  const to = phone_number;

  const body = [
    "Smart Parking System",
    "",
    status === "approved" ? "Refund Approved ✅" : "Refund Rejected ❌",
    "",
    booking_code ? `Code: ${booking_code}` : null,
    `Amount: ₹${Number(refund_amount).toFixed(2)}`,
    "",
    status === "approved"
      ? "Refund will be processed to your requested account"
      : "Refund amount has been credited back to your wallet"
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await sendSMS(to, body);
  } catch (err) {
    console.log("SMS send failed:", err?.message || err);
  }
};


