import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TabMenu from "./RecentlyAdded"
import StatsCard from "./StatsCard";
import { FaBell, FaUserCircle } from "react-icons/fa";

import Header from "./Header";


const Dashboard = () => {

    // Mock Data
    const totalStudents = 120; 
    const totalCourses = 15;
    const walletBalance = { paid: 5000, balance: 3000 };

    // Active Tab State
    const [activeTab, setActiveTab] = useState("students");

     const [showNotifications, setShowNotifications] = useState(false);
      const [showProfileMenu, setShowProfileMenu] = useState(false);
    
      const navigate = useNavigate();
    
      const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
        setShowProfileMenu(false); // Close profile menu when notifications are toggled
      };
    
      const toggleProfileMenu = () => {
        setShowProfileMenu((prev) => !prev);
        setShowNotifications(false); // Close notifications when profile menu is toggled
      }; 

    return ( 
        <div className="px-6 space-y-8">
          <div className=" text-black flex items-center justify-between top-0 px-4 py-2">
             {/* <Header /> */}
           {/* Welcome Text */}
                 <div className="text-lg font-semibold">
                   Welcome, <span className="text-blue-400">Owner Name</span>
                 </div>
           
                 {/* Right Section */}
                 <div className="relative flex items-center space-x-6">
                   {/* Notification Icon */}
                   <div className="relative">
                     <FaBell
                       className="text-2xl cursor-pointer hover:text-blue-400"
                       onClick={toggleNotifications}
                     />
                     {showNotifications && (
                       <div className="absolute right-0 mt-2 w-64 bg-white text-black shadow-lg rounded-lg p-4 z-20">
                         <h3 className="text-sm font-semibold mb-2">Notifications</h3>
                         <ul className="space-y-2">
                           <li className="text-sm border-b pb-1">New student registered.</li>
                           <li className="text-sm border-b pb-1">Exam schedule updated.</li>
                           <li className="text-sm">Fee payment received.</li>
                         </ul>
                       </div>
                     )}
                   </div>
           
                   {/* Profile Icon */}
                   <div className="relative">
                     <FaUserCircle
                       className="text-2xl cursor-pointer hover:text-blue-400"
                       onClick={toggleProfileMenu}
                     />
                     {showProfileMenu && (
                       <div className="absolute right-0 mt-2 w-40 bg-white text-black z-50 shadow-lg rounded-lg">
                         <ul className="space-y-2 p-2">
                           <li
                           onClick={() => { setShowProfileMenu((prev) => !prev);
                             navigate('/institute/profile')
                           }}
                            className="cursor-pointer hover:bg-gray-200 p-2 rounded">
                             Profile
                           </li>
                           <li className="cursor-pointer hover:bg-gray-200 p-2 rounded">
                             Log Out
                           </li>
                         </ul>
                       </div>
                     )}
                   </div>
                 </div>
          </div>
           
            {/* Top Boxes */}
            <StatsCard />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Add Student", link: "/institute/Registration" },
                    { label: "Fees Details", link: "/institute/fees" },
                    { label: "Batch Details", link: "/institute/Batch" },
                    { label: "Student Enquiry", link: "/institute/enquiry" },
                ].map((btn, index) => (
                    <button
                        key={index}
                        className="bg-gray-800 text-white py-3 rounded-lg shadow-lg hover:bg-gray-700 cursor-pointer transition"
                        onClick={() => navigate(btn.link)}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* Recently Added Students Section */}
            <TabMenu/>
        </div>
    );
};

export default Dashboard;
