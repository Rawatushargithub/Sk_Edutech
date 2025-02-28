import React, { useState, useEffect } from "react";
import { MdHomeWork } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";
import { BiSortAlt2 } from "react-icons/bi";

const TabMenu = () => {
  const tabs = [
    { name: "Franchise", icon: <MdHomeWork /> },
    { name: "Student", icon: <IoPerson /> },
    { name: "Courses", icon: <FaBookOpen /> },
  ];

  const API_URL = "https://your-api.com/students"; // Replace with actual API
  const [selectedTab, setSelectedTab] = useState("Franchise");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch students only when clicking "Student" tab
  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    setStudents([]); // Reset students before fetching new data

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("No students fetched.");

      const data = await response.json();
      if (data.length === 0) throw new Error("No students available.");

      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab switching with animation
  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);

    if (tabName === "Student") {
      fetchStudents();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-2xl text-regal-voilet mb-6 mt-14">
        <h1>Recently Added</h1>
      </div>

      {/* Tab Buttons */}
      <div className="flex mb-1 transition-all duration-300">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => handleTabClick(tab.name)}
            className={`px-6 py-2 w-5/12 rounded-md flex justify-center items-center transition-all duration-300 ease-in-out ${
              selectedTab === tab.name
                ? "bg-gray-200 text-regal-voilet border-b-4 border-[#09182a] shadow-md scale-105"
                : "bg-white text-regal-voilet hover:bg-gray-100"
            }`}
          >
            <div className="text-xl">{tab.icon}</div>
            <span className="ml-2">{tab.name}</span>
          </button>
        ))}
        <div className="w-full flex items-center justify-end">
          <div className="w-3/12 flex justify-center items-center gap-1">
            <p>Sort by</p>
            <BiSortAlt2 />
          </div>
        </div>
      </div>

      {/* Tab Content Section */}
      <div className="mt-4 p-4 bg-white rounded-lg shadow-md transition-all duration-500 ease-in-out">
        {selectedTab === "Franchise" && <p className="text-gray-600">Franchise Content Here...</p>}

        {selectedTab === "Courses" && <p className="text-gray-600">Courses Content Here...</p>}

        {selectedTab === "Student" && (
          <div>
            <h2 className="text-xl font-semibold text-regal-voilet mb-3">Recently Added Students</h2>

            {loading ? (
              <p className="text-gray-600 animate-pulse">Loading students...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : students.length > 0 ? (
              <ul className="divide-y divide-gray-300">
                {students.map((student) => (
                  <li key={student.id} className="py-2">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600">Course: {student.course}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No students found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabMenu;
