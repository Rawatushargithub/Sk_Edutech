import { useState, useEffect } from "react";
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
import { MdSupportAgent, MdFeedback } from "react-icons/md";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

const Sidebar = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [logoUrl, setLogoUrl] = useState("");
  const [instituteName, setInstituteName] = useState("");

  useEffect(() => {
    const studentData = localStorage.getItem("student");
    const student = studentData ? JSON.parse(studentData) : null;

    if (student && student?.franchiseId) {
      fetchLogo(student?.franchiseId);
    }
  }, []);

  const fetchLogo = async (franchiseId) => {
    try {
      const encodedFranchiseId = encodeURIComponent(franchiseId);
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/student/sidebar/logo/${encodedFranchiseId}`
      );
      setLogoUrl(response.data.logoUrl);
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

  const handleSelect = (name) => {
    onSelect(name);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden p-3 fixed top-2 left-2 z-50 bg-gray-800 text-white rounded-lg shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-gray-900 text-white p-4 w-64 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo + Institute Name */}
        <div className="text-center mb-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Institute Logo"
              className="mx-auto h-16 object-contain border-2 border-black mb-2"
            />
          ) : (
            <h2 className="text-2xl font-bold text-blue-400">SKEDUTEH</h2>
          )}
          {instituteName && (
            <h2 className="text-lg font-semibold text-blue-300">
              {instituteName}
            </h2>
          )}
        </div>

        {/* Menu */}
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-700"
                onClick={() => handleSelect(item.name)}
              >
                {item.icon} {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Click-outside overlay (mobile only) */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsOpen(false)}
      />
    </>
  );
};

export default Sidebar;
