import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, LogIn, AlertCircle } from "lucide-react";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary
const Login = () => {
  const [email, setEmail] = useState("");
  const [studentMobile, setStudentMobile] = useState("");
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
      const response = await fetch(`${API_BASE_URL}/api/v1/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, studentMobile }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful", data);

        if (!data.student) {
          throw new Error("Student data not found in response!");
        }

        const { studentName, dob, courseInterested, email, studentMobile, _id, rollNumber } = data.student;

        const birthYear = dob ? new Date(dob).getFullYear() : null;
        const currentYear = new Date().getFullYear();
        const age = birthYear ? currentYear - birthYear : "N/A";

        localStorage.setItem(
          "student",
          JSON.stringify({
            name: studentName,
            age: age,
            course: courseInterested,
            email: email,
            phone: studentMobile,
            studentId: _id,
            rollNumber: rollNumber,
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-sky-100">
          {/* Header */}
          <div className="bg-sky-500 p-6 text-white text-center">
            <div className="flex justify-center mb-3">
              <div className="rounded-full bg-white/20 p-3">
                <LogIn size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Student Login</h2>
            <p className="text-sky-100 mt-1">Please enter your credentials to continue</p>
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
                <label htmlFor="email" className="block text-sm font-medium text-sky-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-sky-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="mobile" className="block text-sm font-medium text-sky-800 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-sky-400" />
                  </div>
                  <input
                    id="mobile"
                    type="text"
                    placeholder="Enter your mobile number"
                    value={studentMobile}
                    onChange={(e) => setStudentMobile(e.target.value)}
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
                Having trouble logging in?{" "}
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
    </div>
  );
};

export default Login;