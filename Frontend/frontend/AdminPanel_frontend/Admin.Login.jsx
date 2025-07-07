import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Lock, User, Loader2, ShieldCheck } from "lucide-react";

import API_BASE_URL from "../config";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
        navigate("/admin/dashboard");
      }
    } catch {
      setErrorMsg("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-blue-200 relative animate-fade-in">
        <div className="flex justify-center mb-6">
          <ShieldCheck className="text-blue-600" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-2">
          Admin Login
        </h2>
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
    </div>
  );
};

export default AdminLogin;
