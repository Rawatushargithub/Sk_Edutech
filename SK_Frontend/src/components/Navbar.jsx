import React, { useState } from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";
import {useNavigate} from 'react-router-dom';

const Navbar = () => { 
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
    <div className="bg-gray-800 text-white flex items-center justify-between px-6 pt-5 pb-3 shadow-lg">
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
            <div className="absolute right-0 mt-2 w-64 bg-white text-black shadow-lg rounded-lg p-4">
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
            <div className="absolute right-0 mt-2 w-40 bg-white text-black shadow-lg rounded-lg">
              <ul className="space-y-2 p-2">
                <li
                onClick={() => { setShowProfileMenu((prev) => !prev);
                  navigate('/profile')
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
  );
};

export default Navbar;
