import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TabMenu from "./RecentlyAdded"
import StatsCard from "./StatsCard";
import AdminHeader from "./AdminHeader";

const Dashboard = () => {
    const navigate = useNavigate();

    // Mock Data
    const totalStudents = 120; 
    const totalCourses = 15;
    const walletBalance = { paid: 5000, balance: 3000 };

    // Active Tab State
    const [activeTab, setActiveTab] = useState("students");

    return ( 
        <div className="p-6 space-y-8">
            {/* <Header /> */}
            <AdminHeader/>

            {/* Dashboard Title */}
           
            {/* Top Boxes */}
            <StatsCard/>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Franshises", link: "/admin/franchises" },
                    { label: "Certificates", link: "/admin/Certificates" },
                    { label: "Wallet Approval", link: "/admin/wallet" },
                    { label: "Main Slider", link: "/admin/mainslider" },
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
