import Admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// LOGIN ADMIN
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });

  try {
    const admin = await Admin.findOne({ username });

    if (!admin || admin.password !== password)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        name: admin.name,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// FORGOT PASSWORD - SEND OTP
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "No admin found with this email" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // console.log("otp code:", otpCode);
    admin.otp = {
      code: otpCode,
      expiresAt: otpExpiry,
    };
    await admin.save();

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,          // e.g., mail.yourdomain.com
      port: Number(process.env.MAIL_PORT),  // e.g., 587 or 465
      secure: process.env.MAIL_SECURE === "true", // true for port 465 (SSL), false for 587 (TLS)
      auth: {
        user: process.env.MAIL_USERNAME,       // e.g., admin@yourdomain.com
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Optional, helpful for self-signed certs
      },
    });

    const mailOptions = {
      from: `"SK-EDUTECH" <${process.env.MAIL_USERNAME}>`,
      to: email,
      subject: "SK-EDUTECH Admin Password Reset OTP",
      text: `Your OTP is ${otpCode}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);


    res.status(200).json({ message: "OTP sent to email successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

// RESET PASSWORD WITH OTP
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "Email, OTP, and new password are required" });

  try {
    const admin = await Admin.findOne({ email });

    if (
      !admin ||
      !admin.otp ||
      admin.otp.code !== otp ||
      new Date(admin.otp.expiresAt) < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    admin.password = newPassword;
    admin.otp = undefined;
    await admin.save();

    res.status(200).json({ message: "Password reset successful. Please login again." });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};
