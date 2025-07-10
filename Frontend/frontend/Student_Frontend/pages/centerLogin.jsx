// src/components/CenterLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, LogIn, AlertCircle } from "lucide-react";
import { loginFranchise } from "../../AdminPanel_frontend/services/centerService";

const CenterLoginModal = () => {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("centerToken");
    if (token) navigate("/institute");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const { token, franchise } = await loginFranchise(identifier, password);
      localStorage.setItem("centerToken", token);
      localStorage.setItem("franchiseName", franchise.franchiseName);
      localStorage.setItem("franchiseId", franchise.franchiseId);
      navigate("/institute");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md pb-1">
      <div className="bg-white rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-sky-500 p-6 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-white/20 p-3">
              <LogIn size={24} />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Center Login</h2>
          <p className="text-sky-100 mt-1">Login to access your dashboard</p>
        </div>

        {/* Form Section */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-700">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <p className="text-sm">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="identifier" className="block text-sm font-medium text-sky-800 mb-1">
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-sky-400" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  placeholder="Enter email or phone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-sky-800 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-sky-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={18} className="mr-2" />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-sky-700">
              Need help?{" "}
              <a href="#support" className="text-sky-600 hover:text-sky-800 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-sky-600">
        © {new Date().getFullYear()} Center Panel. All rights reserved.
      </div>

      
    </div>
  );
};

export default CenterLoginModal;
