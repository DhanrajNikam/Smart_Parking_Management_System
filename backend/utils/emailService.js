const nodemailer = require("nodemailer");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

const EMAIL_USER = requireEnv("EMAIL_USER");
const EMAIL_PASS = requireEnv("EMAIL_PASS");

// Gmail (App Password) SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  pool: true,
  maxConnections: 5
});

async function verifyTransporter() {
  try {
    console.log("[EmailService] Verifying Gmail SMTP transporter...");
    const info = await transporter.verify();
    console.log("[EmailService] Transporter verified:", info);
    return info;
  } catch (err) {
    console.error("[EmailService] Transporter verification failed:", {
      message: err?.message,
      code: err?.code,
      response: err?.response
    });
    throw err;
  }
}

function renderResetEmailHtml({
  brandName,
  recipientEmail,
  resetUrl,
  expiresMinutes
}) {
  const safeBrand = brandName || "ParkSmart";
  const safeRecipient = recipientEmail || "";

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>Reset Password</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f7fb;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 18px rgba(17, 24, 39, 0.06);">
            <tr>
              <td style="padding:26px 24px;background:linear-gradient(135deg,#0d6efd,#3b82f6,#93c5fd);color:#ffffff;">
                <h1 style="margin:0;font-size:22px;letter-spacing:0.2px;">${safeBrand}</h1>
                <p style="margin:8px 0 0;font-size:14px;opacity:0.95;">Password reset request</p>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 24px;">
                <p style="margin:0 0 12px;font-size:14px;color:#111827;line-height:1.5;">
                  Hi${safeRecipient ? ` ${safeRecipient}` : ""},<br/>
                  We received a request to reset your password.
                </p>

                <div style="margin:18px 0;">
                  <a href="${resetUrl}" target="_blank" rel="noopener"
                     style="display:inline-block;background:#0d6efd;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700;font-size:14px;">
                    Reset Password
                  </a>
                </div>

                <p style="margin:0 0 10px;font-size:13px;color:#4b5563;line-height:1.5;">
                  This link will expire in <b>${expiresMinutes}</b> minutes.
                </p>

                <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;">
                  If you didn’t request this, you can ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #eef2f7;">
                <p style="margin:0;font-size:12px;color:#6b7280;">
                  © ${new Date().getFullYear()} ${safeBrand}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:14px 0 0;font-size:12px;color:#9ca3af;">ParkSmart Security</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmail({ to, subject, text, html }) {
  if (!to) throw new Error("Email 'to' is required");
  if (!subject) throw new Error("Email 'subject' is required");

  // Validate transport before sending
  await verifyTransporter();

  const from = `"ParkSmart" <${EMAIL_USER}>`;

  try {
    console.log("[EmailService] Sending email...", { to, subject });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });

    console.log("[EmailService] Mail sent successfully:", {
      to,
      messageId: info?.messageId,
      accepted: info?.accepted
    });

    return info;
  } catch (error) {
    console.error("[EmailService] SMTP sendMail error:", {
      message: error?.message,
      code: error?.code,
      response: error?.response
    });
    throw error;
  }
}

module.exports = {
  sendEmail,
  renderResetEmailHtml
};

