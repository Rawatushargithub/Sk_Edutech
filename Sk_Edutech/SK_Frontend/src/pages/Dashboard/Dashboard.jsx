import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TabMenu from "./RecentlyAdded"
import StatsCard from "./StatsCard";
import Header from "./Header";

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
           
            {/* Top Boxes */}
            <StatsCard />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Add Student", link: "/Registration" },
                    { label: "Fees Details", link: "/fees" },
                    { label: "Batch Details", link: "/batch" },
                    { label: "Student Enquiry", link: "/enquiry" },
                ].map((btn, index) => (
                    <button
                        key={index}
                        className="bg-gray-800 text-white py-3 rounded-lg shadow-lg hover:bg-gray-700 transition"
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
