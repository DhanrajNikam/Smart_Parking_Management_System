const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { sendEmail, renderResetEmailHtml } = require("../utils/emailService");

const generateResetToken = () => {
  // token that can be safely placed in URL
  return crypto.randomBytes(32).toString("hex");
};

const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const v = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

const getGenericForgotPasswordResponse = () => {
  return {
    message: "If the email exists, you will receive a reset link shortly."
  };
};

exports.registerUser = async (req, res) => {
  const { name, email, password, role, phone_number } = req.body;

  try {
    const [existing] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      "INSERT INTO users (name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone_number, role || "user"]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    console.log("[Auth] forgotPassword called:", { email: normalizedEmail });

    const [users] = await db.promise().query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    // Never reveal whether the email exists
    const userExists = users.length > 0;
    const userId = userExists ? users[0].id : null;

    const token = generateResetToken();
    const expiresMinutes = 10;
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    if (!userExists) {
      console.log("[Auth] Email not found. Returning generic response.");
      return res.json(getGenericForgotPasswordResponse());
    }

    console.log("[Auth] User exists. Saving reset token to DB.");

    await db.promise().query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
       VALUES (?, ?, ?, FALSE)`,
      [userId, token, expiresAt]
    );

    const frontendBaseUrl = process.env.FRONTEND_RESET_PASSWORD_URL;
    const resetUrl = frontendBaseUrl
      ? `${frontendBaseUrl.replace(/\/+$/, "")}/${token}`
      : `http://localhost:3000/reset-password/${token}`;

    console.log("[Auth] Reset URL built.");

    const subject = "Reset your ParkSmart password";

    const html = renderResetEmailHtml({
      brandName: "ParkSmart",
      recipientEmail: normalizedEmail,
      resetUrl,
      expiresMinutes
    });

    const text = `You requested a password reset for your ParkSmart account.\n\nReset link (expires in ${expiresMinutes} minutes):\n${resetUrl}`;

    console.log("[Auth] Sending reset email via Nodemailer...");

    await sendEmail({
      to: normalizedEmail,
      subject,
      text,
      html
    });

    return res.json({ message: "Reset email sent successfully" });
  } catch (error) {
    console.error("[Auth] forgotPassword error:", {
      message: error?.message,
      code: error?.code,
      response: error?.response
    });

    return res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Reset token is required" });
    }

    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const [rows] = await db.promise().query(
      `SELECT prt.user_id, prt.expires_at, prt.used
       FROM password_reset_tokens prt
       WHERE prt.token = ?
       ORDER BY prt.id DESC
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const resetRow = rows[0];

    if (resetRow.used) {
      return res.status(400).json({ message: "Reset token has already been used" });
    }

    const expiresAt = new Date(resetRow.expires_at);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.promise().query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, resetRow.user_id]
    );

    await db.promise().query(
      "UPDATE password_reset_tokens SET used = TRUE WHERE token = ?",
      [token]
    );

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // ✅ BLOCK CHECK (IMPORTANT)
    if (!user.is_active) {
      return res.status(403).json({
        message: "Your account has been blocked by admin"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

