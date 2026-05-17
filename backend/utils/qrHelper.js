const crypto = require("crypto");

const buildQrPayload = (data) => {
  // Keep payload short and stable
  return JSON.stringify({
    booking_code: data.booking_code,
    slot_number: data.slot_number,
    vehicle_number: data.vehicle_number,
    user_id: data.user_id,
    booking_timestamp: data.booking_timestamp
  });
};

const hashToken = (rawToken) => {
  return crypto.createHash("sha256").update(String(rawToken)).digest("hex");
};

// Demo verifier (token is verified by hash in DB)
const verifyQrToken = ({ rawToken, tokenHashFromDb }) => {
  const h = hashToken(rawToken);
  return h === tokenHashFromDb;
};

module.exports = {
  buildQrPayload,
  hashToken,
  verifyQrToken
};

