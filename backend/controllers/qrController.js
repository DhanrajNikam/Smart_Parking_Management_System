const db = require("../config/db");
const crypto = require("crypto");
const QRCode = require("qrcode");

const {
  buildQrPayload,
  hashToken
} = require("../utils/qrHelper");


// =============================
// POST /api/qr/generate/:bookingId
// =============================
exports.generateQrForBooking = async (req, res) => {

  const bookingId = Number(req.params.bookingId);
  const userId = req.user?.id;

  try {

    if (!bookingId) {
      return res.status(400).json({
        message: "Invalid bookingId"
      });
    }

    // =============================
    // FETCH BOOKING
    // =============================

    const [rows] = await db.promise().query(
      `
      SELECT 
        b.*,
        pl.name AS parking_location_name,
        pl.address AS parking_location_address,
        s.slot_number
      FROM bookings b
      JOIN parking_locations pl
        ON pl.id = b.location_id
      JOIN slots s
        ON s.id = b.slot_id
      WHERE b.id = ?
      AND b.user_id = ?
      `,
      [bookingId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const booking = rows[0];

    // =============================
    // VALID STATUS
    // =============================

    if (!["pending", "active"].includes(booking.status)) {
      return res.status(409).json({
        message: "Booking is not eligible for QR"
      });
    }

    // =============================
    // CHECK EXISTING ACTIVE QR
    // =============================

    const [existing] = await db.promise().query(
      `
      SELECT *
      FROM booking_qr_codes
      WHERE booking_id = ?
      AND status = 'active'
      ORDER BY id DESC
      LIMIT 1
      `,
      [bookingId]
    );

    // =============================
    // RETURN EXISTING QR
    // =============================

    if (existing.length) {

      const qr = existing[0];

      let qrBase64 = "";

      try {

        const qrValue = qr.qr_value || "";

        qrBase64 = await QRCode.toDataURL(qrValue, {
          errorCorrectionLevel: "M",
          margin: 1,
          scale: 6
        });

      } catch (e) {

        console.log("QR existing generate error:", e);

      }

      return res.status(200).json({
        success: true,
        message: "QR ready",

        qr: {
          bookingId: booking.id,
          booking_code: booking.booking_code,
          slot_number: booking.slot_number,
          vehicle_number: booking.vehicle_number,
          user_id: booking.user_id,
          booking_timestamp: new Date(
            booking.created_at
          ).toISOString(),
          token: qr.qr_token,
          expires_at: qr.expires_at
        },

        qr_code: qrBase64
      });
    }

    // =============================
    // CREATE NEW QR
    // =============================

    const rawToken = crypto
      .randomBytes(32)
      .toString("hex");

    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    const payload = buildQrPayload({
      booking_code: booking.booking_code,
      slot_number: booking.slot_number,
      vehicle_number: booking.vehicle_number,
      user_id: booking.user_id,
      booking_timestamp: new Date(
        booking.created_at
      ).toISOString()
    });

    const qrCodeValue = JSON.stringify({
      payload,
      token: rawToken
    });

    // =============================
    // GENERATE BASE64 QR
    // =============================

    let qrBase64 = "";

    try {

      qrBase64 = await QRCode.toDataURL(
        qrCodeValue,
        {
          errorCorrectionLevel: "M",
          margin: 1,
          scale: 6
        }
      );

    } catch (e) {

      console.log("QR generate error:", e);

    }

    // =============================
    // STORE QR
    // =============================

    await db.promise().query(
      `
      INSERT INTO booking_qr_codes
      (
        booking_id,
        qr_value,
        qr_token,
        qr_payload_json,
        token_hash,
        expires_at,
        status
      )
      VALUES
      (?, ?, ?, ?, ?, ?, 'active')
      `,
      [
        bookingId,
        qrCodeValue,
        rawToken,
        payload,
        tokenHash,
        expiresAt
      ]
    );

    // =============================
    // RESPONSE
    // =============================

    return res.status(201).json({

      message: "QR generated",

      qr: {
        bookingId: booking.id,
        booking_code: booking.booking_code,
        slot_number: booking.slot_number,
        vehicle_number: booking.vehicle_number,
        user_id: booking.user_id,
        booking_timestamp: new Date(
          booking.created_at
        ).toISOString(),
        token: rawToken,
        expires_at: expiresAt.toISOString()
      },

      qr_code: qrBase64

    });

  } catch (err) {

    console.log(
      "generateQrForBooking error:",
      err
    );

    res.status(500).json({
      message: "Server error"
    });

  }
};


// =============================
// POST /api/qr/validate
// =============================

exports.validateQr = async (req, res) => {

  const {
    qrCodeValue,
    token,
    mode
  } = req.body || {};

  const validationMode = mode;

  try {

    // =============================
    // VALID MODE
    // =============================

    if (
      !validationMode ||
      !["entry", "exit"].includes(validationMode)
    ) {
      return res.status(400).json({
        message: "Invalid mode"
      });
    }

    // =============================
    // PARSE QR
    // =============================

    let payload = null;

    let tokenToVerify = token;

    if (qrCodeValue) {

      const parsed =
        typeof qrCodeValue === "string"
          ? JSON.parse(qrCodeValue)
          : qrCodeValue;

      payload = parsed.payload;

      tokenToVerify = parsed.token;
    }

    if (!tokenToVerify) {
      return res.status(400).json({
        message: "Missing token"
      });
    }

    // =============================
    // VERIFY TOKEN
    // =============================

    const tokenHash = hashToken(
      tokenToVerify
    );

    const [qrRows] = await db.promise().query(
      `
      SELECT *
      FROM booking_qr_codes
      WHERE token_hash = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [tokenHash]
    );

    if (!qrRows.length) {
      return res.status(401).json({
        message: "Invalid QR"
      });
    }

    const qr = qrRows[0];

    // =============================
    // QR STATUS CHECK
    // =============================

    if (qr.status === "expired") {
      return res.status(401).json({
        message: "QR expired"
      });
    }

    if (
      validationMode === "entry" &&
      qr.status !== "active"
    ) {
      return res.status(401).json({
        message: "QR is not active for entry"
      });
    }

    if (
      validationMode === "exit" &&
      !["active", "used"].includes(qr.status)
    ) {
      return res.status(401).json({
        message: "QR is not valid for exit"
      });
    }

    // =============================
    // EXPIRE CHECK
    // =============================

    const now = new Date();

    if (
      new Date(qr.expires_at) <= now
    ) {

      await db.promise().query(
        `
        UPDATE booking_qr_codes
        SET status='expired'
        WHERE id=?
        `,
        [qr.id]
      );

      return res.status(401).json({
        message: "QR expired"
      });
    }

    // =============================
    // GET BOOKING
    // =============================

    const [bRows] = await db.promise().query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      `,
      [qr.booking_id]
    );

    if (!bRows.length) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const booking = bRows[0];

    // =============================
    // ENTRY VALIDATION
    // =============================

    if (validationMode === "entry") {

      if (
        !["pending", "active"].includes(
          booking.status
        )
      ) {
        return res.status(409).json({
          message:
            "Booking not eligible for entry"
        });
      }

      await db.promise().query(
        `
        UPDATE bookings
        SET status='active'
        WHERE id=?
        `,
        [booking.id]
      );

      // IMPORTANT:
      // DO NOT MARK QR USED HERE

      await db.promise().query(
        `
        UPDATE booking_qr_codes
        SET last_mode='entry'
        WHERE id=?
        `,
        [qr.id]
      );

      return res.json({
        message: "Entry validated",
        booking_id: booking.id
      });
    }

    // =============================
    // EXIT VALIDATION
    // =============================

    if (validationMode === "exit") {

      if (
        booking.status !== "active"
      ) {
        return res.status(409).json({
          message:
            "Booking not eligible for exit"
        });
      }

      await db.promise().beginTransaction();

      try {

        await db.promise().query(
          `
          UPDATE bookings
          SET status='completed'
          WHERE id=?
          `,
          [booking.id]
        );

        await db.promise().query(
          `
          UPDATE slots
          SET status='available'
          WHERE id=?
          `,
          [booking.slot_id]
        );

        // QR USED AFTER EXIT

        await db.promise().query(
          `
          UPDATE booking_qr_codes
          SET
            last_mode='exit',
            status='used',
            used_at=NOW()
          WHERE id=?
          `,
          [qr.id]
        );

        await db.promise().commit();

      } catch (e) {

        await db.promise().rollback();

        throw e;

      }

      return res.json({
        message: "Exit validated",
        booking_id: booking.id
      });
    }

    return res.status(400).json({
      message: "Invalid request"
    });

  } catch (err) {

    console.log("validateQr error:", err);

    res.status(500).json({
      message: "Server error"
    });

  }
};