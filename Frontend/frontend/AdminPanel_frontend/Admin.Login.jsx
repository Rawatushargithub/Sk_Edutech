import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Lock, User, Loader2, ShieldCheck, Mail, Key, Eye } from "lucide-react";
import API_BASE_URL from "../config";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showResetSection, setShowResetSection] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        } else {
          navigate("/admin/dashboard");
        }
      } catch {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || "Login failed!");
      } else {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminName", data.admin.name);
        localStorage.setItem("adminUsername", data.admin.username);
        localStorage.setItem("adminEmail", data.admin.email);
        navigate("/admin/dashboard");
      }
    } catch {
      setErrorMsg("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        alert("OTP sent to your email.");
      } else {
        alert(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      alert("Server error.");
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password reset successfully!");
        setShowForgotModal(false);
      } else {
        alert(data.message || "Failed to reset password.");
      }
    } catch (err) {
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-blue-200 relative animate-fade-in">
        <div className="flex justify-center mb-6">
          <ShieldCheck className="text-blue-600" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-2">Admin Login</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Welcome back, Admin</p>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-md text-sm flex items-center gap-2">
            <Lock size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Username</label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-gray-300 px-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 px-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all duration-200 shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative border-blue-900 border-2">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Reset Password</h3>
            <label className="block text-sm text-gray-600 mb-1">Enter your email</label>
            <div className="relative mb-3">
              <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                className="w-full border border-gray-300 pl-10 py-2 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!otpSent && (
              <button
                onClick={sendOtp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md mt-2"
              >
                Send OTP
              </button>
            )}

            {otpSent && (
              <>
                <label className="block text-sm text-gray-600 mt-4">Enter OTP</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 py-2 px-3 rounded-md mt-1 mb-3"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <label className="block text-sm text-gray-600">New Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 py-2 px-3 rounded-md mt-1"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <button
                  onClick={handleResetPassword}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md mt-4"
                >
                  Reset Password
                </button>
              </>
            )}

            <button
              className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl"
              onClick={() => setShowForgotModal(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
