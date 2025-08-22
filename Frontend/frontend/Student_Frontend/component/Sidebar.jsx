import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import {
  FaTrophy,
  FaUser,
  FaMoneyBill,
  FaRegStickyNote,
  FaVideo,
  FaBook,
  FaGraduationCap
} from "react-icons/fa";
import API_BASE_URL from "../../config.js";
import { MdSupportAgent } from "react-icons/md";
import { MdFeedback } from "react-icons/md";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai"; // For Mobile Toggle
// import student from "../../../../Backend/backend/Admin_Backend/models/Student/Student_Details.model.js";

const Sidebar = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  const [logoUrl, setLogoUrl] = useState("");
  // const [Name, instituteName] = useState("");
  const [instituteName, setInstituteName] = useState("");


  useEffect(() => {
    // const studentData = JSON.parse(localStorage.getItem("student"));
    const studentData = localStorage.getItem("student");

    console.log("Student Data:", studentData);
    const student = studentData ? JSON.parse(studentData) : null;

    if (student && student?.franchiseId) {
      fetchLogo(student?.franchiseId);
    }
  }, []);
  // console.log(student.franchiseId);

  const fetchLogo = async (franchiseId) => {
    try {
      const encodedFranchiseId = encodeURIComponent(franchiseId);

      const response = await axios.get(`${API_BASE_URL}/api/v1/student/sidebar/logo/${encodedFranchiseId}`);
      setLogoUrl(response.data.logoUrl);
      // instituteName(response.data.Name);
      setInstituteName(response.data.Name);

    } catch (error) {
      console.error("Failed to fetch institute logo", error);
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: <FaTrophy /> },
    { name: "Manage Profile", icon: <FaUser /> },
    { name: "Fees", icon: <FaMoneyBill /> },
    { name: "Notes", icon: <FaRegStickyNote /> },
    { name: "Course Videos", icon: <FaVideo /> },
    { name: "Exam", icon: <FaBook /> },
    { name: "Certificate", icon: <FaGraduationCap /> },
    { name: "Feedback", icon: <MdFeedback /> },
    { name: "Help and Support", icon: <MdSupportAgent /> }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden p-3 fixed top-4 left-4 z-50 bg-gray-800 text-white rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen bg-gray-900 text-white p-4 w-64 
                      transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="text-center m-3 ">
          {logoUrl ? (
            <img src={logoUrl} alt="Institute Logo" className="mx-auto h-16 object-contain border-2 border-black" />
          ) : (
            <h2 className="text-2xl font-bold text-blue-400">SKEDUTEH</h2> // fallback text
          )}
        </div>
            {/* <h2 className="text-lg font-bold flex justify-center text-blue-400">{Name}</h2> */}

        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-700"
                onClick={() => onSelect(item.name)}
              >
                {item.icon} {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
