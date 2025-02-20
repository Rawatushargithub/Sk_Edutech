import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    // Simulating the data fetching with useState
    const [totalStudents, setTotalStudents] = useState(120);
    const [totalCourses, setTotalCourses] = useState(15);
    const [walletBalance, setWalletBalance] = useState({ paid: 5000, balance: 3000 });

    // Mock data for students
    const studentsData = [
        { id: "SKEDU520001", name: "John Doe", course: "Mathematics", fees: "$100" },
        { id: "SKEDU520002", name: "Jane Smith", course: "Science", fees: "$120" },
        { id: "SKEDU520003", name: "Alice Johnson", course: "Physics", fees: "$110" },
        { id: "SKEDU520004", name: "Bob Brown", course: "Chemistry", fees: "$105" },
        { id: "SKEDU520005", name: "Charlie Green", course: "Biology", fees: "$115" },
    ];

    // Mock data for courses
    const coursesData = [
        { courseId: "C001", duration: "3 Months", fees: "$500", batch: "A" },
        { courseId: "C002", duration: "6 Months", fees: "$800", batch: "B" },
        { courseId: "C003", duration: "1 Year", fees: "$1200", batch: "C" },
        { courseId: "C004", duration: "2 Years", fees: "$2000", batch: "D" },
        { courseId: "C005", duration: "4 Months", fees: "$600", batch: "E" },
    ];

    // State for active tab
    const [activeTab, setActiveTab] = useState("students");

    // Function to generate unique ID
    const generateUniqueID = () => {
        return `SKEDU52${Math.floor(Math.random() * 1000000000)}`;
    };

    const [students, setStudents] = useState(
        studentsData.map((student) => ({
            ...student,
            id: generateUniqueID(),
        }))
    );

    // Sorting function (you can choose to sort by price or name)
    const handleSort = () => {
        const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));
        setStudents(sortedStudents);
    };

    // Modal state for Student Enquiry
    const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

    // State for Student Enquiry Form
    const [enquiry, setEnquiry] = useState({
        name: "",
        age: "",
        class: "",
        number: "",
        course: "",
        description: "",
    });

    // Navigate hook from react-router-dom
    const navigate = useNavigate();



    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {/* Total Students Box */}
                <div className="bg-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
                    <h3 className="text-xl font-semibold mb-4">Total Students</h3>
                    <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
                </div>

                {/* Total Courses Box */}
                <div className="bg-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
                    <h3 className="text-xl font-semibold mb-4">Total Courses</h3>
                    <p className="text-3xl font-bold text-green-600">{totalCourses}</p>
                </div>

                {/* Wallet Box */}
                <div className="bg-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
                    <h3 className="text-xl font-semibold mb-4">Wallet</h3>
                    <p className="text-3xl font-bold text-purple-600">
                        Paid: ${walletBalance.paid}
                    </p>
                    <p className="text-xl text-gray-600">Balance: ${walletBalance.balance}</p>
                </div>
            </div>

            <div className="p-6">
                {/* Buttons Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {/* Add Student Button */}
                    <button
                        className="bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:scale-105 transition-all"
                        onClick={() => navigate("/Registration ")}
                    >
                        Add Student
                    </button>

                    {/* Fees Details Button */}
                    <button
                        className="bg-green-600 text-white py-3 rounded-lg shadow-lg hover:scale-105 transition-all"
                        onClick={() => navigate("/fees")}
                    >
                        Fees Details
                    </button>

                    {/* Batch Details Button */}
                    <button
                        className="bg-yellow-600 text-white py-3 rounded-lg shadow-lg hover:scale-105 transition-all"
                        onClick={() => navigate("/batch")}
                    >
                        Batch Details
                    </button>

                    {/* Student Enquiry Button */}
                    <button
                        className="bg-purple-600 text-white py-3 rounded-lg shadow-lg hover:scale-105 transition-all"
                        onClick={() => navigate("/enquiry")}
                    >
                        Student Enquiry
                    </button>
                </div>

            </div>


            {/* // Recently Added Student Section */}
            <div className="p-6">
                {/* Section Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Recently Added</h2>
                    <div className="flex space-x-4">
                        <button
                            className={`px-4 py-2 rounded-md font-medium ${activeTab === "students"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                            onClick={() => setActiveTab("students")}
                        >
                            Students
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md font-medium ${activeTab === "courses"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                            onClick={() => setActiveTab("courses")}
                        >
                            Courses
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto bg-white rounded-lg shadow-md border-2 border-blue-400">
                    <table className="table-auto w-full text-left border-collapse">
                        <thead className="bg-gray-200 border-2 border-blue-200">
                            <tr>
                                {activeTab === "students" ? (
                                    <>
                                        <th className="px-4 py-2">ID</th>
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2">Course</th>
                                        <th className="px-4 py-2">Fees</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-4 py-2">Course ID</th>
                                        <th className="px-4 py-2">Duration</th>
                                        <th className="px-4 py-2">Fees</th>
                                        <th className="px-4 py-2">Batch</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === "students"
                                ? studentsData.map((student, index) => (
                                    <tr
                                        key={student.id}
                                        className={index % 2 === 0 ? "bg-white" : "bg-gray-200"}
                                    >
                                        <td className="px-4 py-2">{student.id}</td>
                                        <td className="px-4 py-2">{student.name}</td>
                                        <td className="px-4 py-2">{student.course}</td>
                                        <td className="px-4 py-2">{student.fees}</td>
                                    </tr>
                                ))
                                : coursesData.map((course, index) => (
                                    <tr
                                        key={course.courseId}
                                        className={index % 2 === 0 ? "bg-white" : "bg-gray-200"}
                                    >
                                        <td className="px-4 py-2">{course.courseId}</td>
                                        <td className="px-4 py-2">{course.duration}</td>
                                        <td className="px-4 py-2">{course.fees}</td>
                                        <td className="px-4 py-2">{course.batch}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
