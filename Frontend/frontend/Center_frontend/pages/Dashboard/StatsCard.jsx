import React, { useState, useEffect } from "react";
import { FaUserGraduate, FaBook, FaWallet } from "react-icons/fa";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../config"; // Adjust the import path as necessary

const StatsCard = ({ title, icon: Icon, apiEndpoint, bgColor = "#E4E8ED", textColor = "#09182a" , isWallet=false, isCourseCard=false }) => {
  const franchiseId = localStorage.getItem("franchiseID");
  const API_URL = `${API_BASE_URL}/api/v1/${apiEndpoint}?franchiseId=${franchiseId}`; // Replace with actual API
  const navigate = useNavigate();

  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(false);
      try {
        
        // Special handling for course count - fetch both institute and admin courses
        if (isCourseCard) {
          const [instituteCourses, adminCourses] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/v1/institute_courses/getCourses?franchiseId=${franchiseId}`),
            axios.get(`${API_BASE_URL}/api/v1/admin/courses/admin-courses`).catch(err => {
              console.warn('Failed to fetch admin courses:', err);
              return { data: [] };
            })
          ]);

          console.log("Institute courses fetching :: ", instituteCourses);
          console.log("Admin courses fetching :: ", adminCourses);

          // Safely extract course data with fallback
          const instituteCourseData = Array.isArray(instituteCourses.data) ? instituteCourses.data : [];
          const adminCourseData = Array.isArray(adminCourses.data.data) ? adminCourses.data.data : [];

          // Calculate combined count
          const totalCourseCount = instituteCourseData.length + adminCourseData.length;
          setValue(totalCourseCount);
          
        } else {
          // Regular API call for other stats
          const response = await axios.get(API_URL);
          
          // Axios already throws an error for non-2xx responses
          console.log("Response data:", response.data);
          
         // For wallet, we expect balance instead of count
          if (isWallet) {
            if (response.data && response.data.balance !== undefined) {
              setValue(response.data.balance);
            } else {
              throw new Error("No balance data available");
            }
          } else {
            // For other stats cards
            if (response.data && response.data.count !== undefined) {
              setValue(response.data.count);
            } else {
              throw new Error("No count data available");
            }
          }
        }

      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_URL , isWallet, isCourseCard, franchiseId]);

  // Handler for wallet card click
  const handleWalletClick = () => {
    if (isWallet) {
      navigate("/institute/wallet"); // Navigate to wallet management page
    }
  };


  return (
    <div className="flex justify-center gap-2">
      <div className="relative rounded-lg p-1">
        {/* Animated Border Effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-400 via-gray-300 to-gray-200 opacity-50 blur-sm"></div>

        {/* Card Content */}
        <div
          className=" cursor-pointer relative rounded-lg stat_container p-8 text-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl w-64 h-64 "
          style={{ backgroundColor: bgColor }}
          onClick={handleWalletClick}
        >
          {Icon && <Icon className="mx-auto mb-4 text-4xl" style={{ color: textColor }} />}
          {/* {isWallet && <FaPlus className=" ml-5 text-2xl" style={{ color: textColor }} />} */}
          <h2 className="text-2xl font-semibold mb-2" style={{ color: textColor }}>
            {title}
          </h2>
          <hr className="border-b-2" style={{ borderColor: textColor }} />

          {/* Dynamic Value or Default Fallback */}
          {loading ? (
            <p className="text-5xl mt-3 font-extrabold animate-pulse" style={{ color: textColor }}>
              ...
            </p>
          ) : error ? (
            <p className="text-lg mt-3 font-extrabold text-gray-500">N/A</p>
          ) : (
            <div>
              <p className="text-5xl mt-3 font-extrabold" style={{ color: textColor }}>
                {isWallet ? `₹${value}` : value}
              </p>
              {isWallet && (
                <p className="mt-2 text-sm font-medium" style={{ color: textColor }}>
                  Click to manage wallet
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 ">
      {/* Default Fallback Boxes */}
      <StatsCard 
      title="Total Students"
      icon={FaUserGraduate} 
      apiEndpoint="institute_student/count"
      bgColor="#E4E8ED"
      textColor = "#09182a"
      />
      <StatsCard 
      title="Total Courses" 
      icon={FaBook}
      apiEndpoint="institute_courses/count"
      bgColor="#E4E8ED"
      textColor = "#09182a"
      isCourseCard={true}
      /> 
      <StatsCard 
      title="Wallet" 
      icon={FaWallet} 
      apiEndpoint="institute_wallet/balance"
      bgColor="#E4E8ED"
      textColor = "#09182a"
      isWallet = {true} // Identify this as wallet card
       />
    </div>
  );
};

export default DashboardStats;
