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

    const studentsData = [
        { id: "SKEDU520001", name: "John Doe", course: "Mathematics", fees: "$100" },
        { id: "SKEDU520002", name: "Jane Smith", course: "Science", fees: "$120" },
        { id: "SKEDU520003", name: "Alice Johnson", course: "Physics", fees: "$110" },
        { id: "SKEDU520004", name: "Bob Brown", course: "Chemistry", fees: "$105" },
        { id: "SKEDU520005", name: "Charlie Green", course: "Biology", fees: "$115" },
    ];

    const coursesData = [
        { courseId: "C001", duration: "3 Months", fees: "$500", batch: "A" },
        { courseId: "C002", duration: "6 Months", fees: "$800", batch: "B" },
        { courseId: "C003", duration: "1 Year", fees: "$1200", batch: "C" },
        { courseId: "C004", duration: "2 Years", fees: "$2000", batch: "D" },
        { courseId: "C005", duration: "4 Months", fees: "$600", batch: "E" },
    ];

    // Active Tab State
    const [activeTab, setActiveTab] = useState("students");

    return (
        <div className="p-6 space-y-8">
            <Header />
           
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
