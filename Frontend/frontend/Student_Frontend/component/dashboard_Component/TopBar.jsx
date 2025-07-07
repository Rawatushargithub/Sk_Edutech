import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, User } from "lucide-react";

const TopBar = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  
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
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center">
        {/* Left Side - Welcome Message with Avatar */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User size={20} className="text-blue-600" />
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Welcome, {student?.name || "Student"} 👋
            </h1>
            <p className="text-sm text-gray-600">{student?.rollNumber || ""}</p>
          </div>
        </div>
        
        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <button className="relative bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition-colors">
            <Bell size={20} className="text-blue-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Logout Button */}
          <button 
            className="flex items-center gap-2 bg-red-100 text-blue px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;