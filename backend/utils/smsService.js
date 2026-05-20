// Twilio SMS Service
require("dotenv").config();

const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_FROM_NUMBER;

let client = null;

async function sendSMS(to, body) {
  if (!to) throw new Error("Missing 'to' phone number");
  if (!body) throw new Error("Missing SMS body");

  // If provider env vars are not set, silently skip SMS sending
  if (!twilioSid || !twilioToken || !twilioFrom) {
    console.log(
      "SMS skipped: Twilio is not configured (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER in backend .env)"
    );
    return null;
  }


  if (!client) {
    // Lazy import so the app can still start without Twilio dependency until configured
    const twilio = require("twilio");
    client = twilio(twilioSid, twilioToken);
  }

  // Twilio expects E.164 format like +14155550123
  return client.messages.create({
    to,
    from: twilioFrom,
    body
  });
}

module.exports = {
  sendSMS
};