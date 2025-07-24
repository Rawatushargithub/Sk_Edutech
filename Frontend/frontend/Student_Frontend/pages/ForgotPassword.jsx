import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config.js";
import { FiMail, FiKey, FiShield, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const notifySuccess = (msg) =>
    toast.success(
      <span className="flex items-center gap-2">
        <FiCheckCircle /> {msg}
      </span>
    );

  const notifyError = (msg) =>
    toast.error(
      <span className="flex items-center gap-2">
        <FiAlertCircle /> {msg}
      </span>
    );

  const handleSendOtp = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/v1/student/send-otp`, { email });
      notifySuccess("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/v1/student/verify-otp`, { email, otp });
      notifySuccess("OTP verified. Set a new password.");
      setStep(3);
    } catch (err) {
      notifyError(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      notifyError("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/v1/student/reset-password`, {
        email,
        newPassword,
      });
      notifySuccess("Password reset successfully.");
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      notifyError(err.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-xl border-2 border-blue-900 rounded-xl animate-fade-in-top">
      <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">Forgot Password</h2>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in-top">
          <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">
            <FiMail className="text-blue-900" /> Enter your Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border-2 border-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />
          <button
            onClick={handleSendOtp}
            className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Send OTP
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in-top">
          <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">
            <FiShield className="text-blue-900" /> Enter OTP
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-2 border-2 border-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="6-digit code"
          />
          <button
            onClick={handleVerifyOtp}
            className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Verify OTP
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in-top">
          <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">
            <FiKey className="text-blue-900" /> New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border-2 border-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />

          <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">
            <FiKey className="text-blue-900" /> Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border-2 border-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />

          <button
            onClick={handleResetPassword}
            className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Reset Password
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
