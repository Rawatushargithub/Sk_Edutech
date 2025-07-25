import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import API_BASE_URL from "../../config";

const Login = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to home if already logged in
  useEffect(() => {
    const storedStudent = localStorage.getItem("student");
    if (storedStudent) {
      navigate("/student"); // Redirect to homepage
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
        console.log("Sending login request with rollNumber:", rollNumber, password);

      const response = await fetch(`${API_BASE_URL}/api/v1/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful", data);

        if (!data.student) {
          throw new Error("Student data not found in response!");
        }

        const { 
          studentName, 
          dob, 
          courseInterested, 
          email, 
          studentMobile, 
          _id, 
          rollNumber: studentRollNumber, 
          franchiseId,
          admissionDate 
        } = data.student;

        const birthYear = dob ? new Date(dob).getFullYear() : null;
        const currentYear = new Date().getFullYear();
        const age = birthYear ? currentYear - birthYear : "N/A";

        localStorage.setItem(
          "student",
          JSON.stringify({
            name: studentName,
            age: age,
            courseName: courseInterested?.courseName || "N/A",
            courseCode: courseInterested?.courseCode || "N/A",
            admissionDate: admissionDate || "N/A",
            email: email,
            phone: studentMobile,
            studentId: _id,
            rollNumber: studentRollNumber,
            franchiseId: franchiseId,
          })
        );
        navigate("/student");
      } else {
        setError(data.message || "Login failed!");
      }
    } catch (err) {
      setError("Server error! Please try again.");
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          <h2 className="text-2xl font-bold">Student Login</h2>
          <p className="text-sky-100 mt-1">Enter your roll number and password</p>
        </div>

        {/* Form Section */}
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-700">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="rollNumber" className="block text-sm font-medium text-sky-800 mb-1">
                Roll Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-sky-400" />
                </div>
                <input
                  id="rollNumber"
                  type="text"
                  placeholder="Enter your roll number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sky-400 hover:text-sky-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-sky-600 mt-1">
                Default password is your mobile number
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
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
            <p onClick={() => navigate("/student/forgot-password")} className="text-sm text-sky-700">
              Forgot your password?{" "}
              <a href="#contact-support" className="text-sky-600 hover:text-sky-800 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-sky-600">
        © {new Date().getFullYear()} Student Learning Portal. All rights reserved.
      </div>
    </div>
  );
};

export default Login;