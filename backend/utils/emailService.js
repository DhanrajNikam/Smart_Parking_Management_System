const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Smart Parking" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log("Email sent successfully to", to);

  } catch (error) {
    console.log("Email error:", error);
  }
};