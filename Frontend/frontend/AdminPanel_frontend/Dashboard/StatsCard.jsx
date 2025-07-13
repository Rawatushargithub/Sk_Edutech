import React, { useState, useEffect } from "react";
import { FaUserGraduate, FaBook } from "react-icons/fa";
import { FaHandshake } from "react-icons/fa6";
import axios from "axios";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary

const StatsCard = ({
  title,
  icon: Icon,
  apiEndpoint,
  bgColor = "#E4E8ED",
  textColor = "#09182a",
}) => {
  const API_URL = `${API_BASE_URL}/api/v1/${apiEndpoint}`; // Replace with actual API

  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await axios.get(API_URL);  

        if (response.data && response.data.count !== undefined) {
          setValue(response.data.count);
        } else {
          throw new Error("No count data available");
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_URL]);

  return (
    <div className="flex justify-center gap-2">
      <div className="relative rounded-lg p-1">
        {/* Animated Border Effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-400 via-gray-300 to-gray-200 opacity-50 blur-sm"></div>

        {/* Card Content */}
        <div
          className="relative rounded-lg stat_container p-8 text-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl w-64 h-64 "
          style={{ backgroundColor: bgColor }}
        >
          {Icon && (
            <Icon
              className="mx-auto mb-4 text-4xl"
              style={{ color: textColor }}
            />
          )}
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: textColor }}
          >
            {title}
          </h2>
          <hr className="border-b-2" style={{ borderColor: textColor }} />

          {/* Dynamic Value or Default Fallback */}
          {loading ? (
            <p
              className="text-5xl mt-3 font-extrabold animate-pulse"
              style={{ color: textColor }}
            >
              ...
            </p>
          ) : error ? (
            <p className="text-lg mt-3 font-extrabold text-gray-500">N/A</p>
          ) : (
            <div>
              <p
                className="text-5xl mt-3 font-extrabold"
                style={{ color: textColor }}
              >
                {value}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <StatsCard
        title="Total Students"
        icon={FaUserGraduate}
        apiEndpoint="admin_student/student/count" 
        bgColor="#E4E8ED"
        textColor="#09182a"
      />
      <StatsCard
        title="Total Courses"
        icon={FaBook}
        apiEndpoint="admin_courses/courses/count"
        bgColor="#E4E8ED"
        textColor="#09182a"
      />
      <StatsCard
        title="Total Franchises"
        icon={FaHandshake}
        apiEndpoint="franchises/count"
        bgColor="#E4E8ED"
        textColor="#09182a"
        isWallet={true} // Identify this as wallet card
      />
    </div>
  );
};

export default DashboardStats;
