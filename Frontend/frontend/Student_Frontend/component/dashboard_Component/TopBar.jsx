import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, User } from "lucide-react";
import axios from "axios";
import StudentRating from "../studentrating.jsx";
import API_BASE_URL from "../../../config.js";

const TopBar = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const studentData = JSON.parse(localStorage.getItem("student"));
  const rollNumber = studentData ? studentData.rollNumber : null;
  const encodedRoll = encodeURIComponent(rollNumber);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    // const storedStudent = JSON.parse(localStorage.getItem("student"));
    // const rollNumber = storedStudent ? storedStudent.rollNumber : null;
    axios.get(`${API_BASE_URL}/api/v1/student/profile/image/${encodedRoll}`)
      .then(res => {
        setImageUrl(res.data.imageUrl);
        // Use imageUrl to show the student image
      })
      .catch(err => console.error("Error fetching student image:", err));

  })
  // console.log(imageUrl);

  useEffect(() => {
    // Fetch student data from localStorage (or backend if using JWT)
    const storedStudent = JSON.parse(localStorage.getItem("student"));
    if (!storedStudent) {
      navigate("/"); // Redirect to login if no student data
    } else {
      setStudent(storedStudent);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("student"); // Clear student data
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-4 mt-12 md:mt-0">
      {/* Mobile layout */}
      <div className="md:hidden space-y-3 -mt-10">
        <div className="flex justify-center">
          <StudentRating />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-blue-300">
              <img src={imageUrl} alt="Student" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                Welcome, {student?.name || "Student"} 👋
              </h1>
              <p className="text-xs text-gray-600">{student?.rollNumber || ""}</p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 bg-red-100 text-blue px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-blue-300">
            <img src={imageUrl} alt="Student" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Welcome, {student?.name || "Student"} 👋
            </h1>
            <p className="text-sm text-gray-600">{student?.rollNumber || ""}</p>
          </div>
        </div>
        <div className="flex justify-center">
          <StudentRating />
        </div>
        <button
          className="flex items-center gap-2 bg-red-100 text-blue px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
