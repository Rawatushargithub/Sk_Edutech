import { LogOut } from "lucide-react";

import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import TabMenu from "./RecentlyAdded";
import StatsCard from "./StatsCard";
import { FaBell, FaUserCircle } from "react-icons/fa";
import Header from "./Header";
import NotificationMarqueeLine from "./NotificationMarqueeLine/NotificationMarqueeLine";
// import { getFranchiseById } from "../../services/franchiseService"; // <-- Add this import

const Dashboard = () => {
  const handleLogout = () => {
    // Clear stored center data
    localStorage.removeItem("centerToken");
    localStorage.removeItem("franchiseName");
    localStorage.removeItem("franchiseID");
    localStorage.removeItem("franchiseImage");

    // Redirect to login/home page
    navigate("/");
  };

  const [franchiseName, setFranchiseName] = useState("");
  const [franchiseImage, setFranchiseImage] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("franchiseName");
    const image = localStorage.getItem("franchiseImage");
    setFranchiseName(name);
    setFranchiseImage(image);
  }, []);

  // Active Tab State
  const [activeTab, setActiveTab] = useState("students");

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
    setShowNotifications(false); // Close notifications when profile menu is toggled
  };

  // Franchise (owner) state

  //     useEffect(() => {
  //         // Replace with actual logic to get franchiseId (from auth, context, or localStorage)
  //         const dummyy_franchiseId = "68283fdd42cd5a57ce8b8b8c"; // Replace with actual franchiseId logic
  //         const franchiseId = localStorage.getItem("franchiseId"); // Or get from JWT/context
  //         if (!dummyy_franchiseId) {
  //             setFranchiseLoading(false);
  //             return;
  //         }

  //         getFranchiseById(dummyy_franchiseId)
  //             .then(res => {
  //                 if (res && res.statusCode === 200) {
  //                   console.log("Franchise data fetched successfully:", res.data);
  //                     setFranchise(res.data);
  //                 }
  //             })
  //             .catch(() => setFranchise(null))
  //             .finally(() => setFranchiseLoading(false));
  //     }, []);
  // console.log("Franchise data:", franchise);
  return (
    <div className="px-6 space-y-8">
      <div className=" text-black flex items-center justify-between top-0 px-4 py-2">
        {/* Franchise Owner Info */}
        <div className="flex items-center space-x-4">
          <div className="text-lg font-semibold">
            Welcome, <span className="text-blue-400">{franchiseName}</span>
          </div>

        </div>
        <div className="w-full">
        <NotificationMarqueeLine/>

        </div>
        {/* Right Section */}
        <div className="relative flex items-center space-x-6">
          {/* Profile Icon */}
          <div className="relative ">
            {/* Franchise Image Profile */}

            <div
              className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-gray-300 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={toggleProfileMenu}
            >
              {franchiseImage ? (
                <img
                  src={franchiseImage}
                  alt="Franchise Profile"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FaUserCircle className="text-gray-400 text-2xl" />
                </div>
              )}
            </div>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black z-50 shadow-lg rounded-lg">
                <ul className="space-y-2 p-2">
                  <li
                    onClick={() => {
                      setShowProfileMenu((prev) => !prev);
                      navigate("/institute/profile");
                    }}
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded"
                  >
                    Profile
                  </li>
                  <li
                    onClick={handleLogout}
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded"
                  >
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
      <TabMenu />
    </div>
  );
};

export default Dashboard;
