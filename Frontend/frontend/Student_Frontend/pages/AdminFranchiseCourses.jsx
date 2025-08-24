import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config"; // your backend URL

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

const AdminFranchiseCourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [franchiseId, setFranchiseId] = useState("");

    useEffect(() => {
        const studentDataString = localStorage.getItem("student");
        if (!studentDataString) {
            setError("No student data found in localStorage");
            return;
        }

        try {
            const studentData = JSON.parse(studentDataString);
            if (!studentData?.franchiseId) {
                setError("Franchise ID not found in student data");
                return;
            }
            setFranchiseId(studentData.franchiseId);
        } catch {
            setError("Failed to parse student data");
        }
    }, []);

    useEffect(() => {
        if (!franchiseId) return;

        const fetchCourses = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/v1/coursedetails/list/${encodeURIComponent(franchiseId)}`
                );

                if (response.data.success) {
                    setCourses(response.data.data);
                } else {
                    setError(response.data.message || "Failed to fetch courses");
                }
            } catch (err) {
                setError(err.message || "Server error");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [franchiseId]);

    if (loading)
        return <div className="py-10 text-center text-sky-600">Loading courses...</div>;

    if (error)
        return <div className="py-10 text-center text-red-600">Error: {error}</div>;

    if (courses.length === 0)
        return <div className="py-10 text-center text-gray-500">No courses found for this franchise.</div>;

    return (
        <div className="py-10">
            <div className="space-y-6">
                {courses.map((course) => {
                    const discount = course.courseMRP - course.courseFees;
                    const discountPercentage = Math.round((discount / course.courseMRP) * 100);

                    return (
                        <div
                            key={course._id}
                            className="bg-white border rounded-lg shadow p-4 flex items-start gap-4"
                        >
                            {/* Thumbnail */}
                            <div className="w-32 h-28 rounded-md overflow-hidden bg-sky-50 flex items-center justify-center flex-shrink-0">
                                {course.courseImage ? (
                                    <img
                                        src={course.courseImage}
                                        alt={course.courseName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <BookOpen className="w-10 h-10 text-sky-400" />
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <h2 className="text-lg font-semibold text-gray-800">{course.courseName}</h2>

                                    {course.byAdmin ? (
                                        <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full">
                                            By Admin
                                        </span>
                                    ) : (
                                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                            By Institute
                                        </span>
                                    )}
                                </div>

                                <div className="flex justify-between gap-10">
                                    <div className="text-sm text-gray-600 mb-2">
                                        <p><span className="font-medium">Eligibility:</span> {course.courseEligibility || "N/A"}</p>
                                        <p><span className="font-medium">Duration:</span> {course.courseDuration || "N/A"}</p>
                                        <p><span className="font-medium">Course Subject:</span> {course.courseSubject || "N/A"}</p>

                                    </div>

                                    {/* Pricing */}
                                    <div className="text-sm">
                                        <p>
                                            <span className="text-gray-500">Actual Price: </span>
                                            <span className="line-through text-red-500">
                                                {formatCurrency(course.courseMRP)}
                                            </span>
                                        </p>
                                        <p>
                                            <span className="text-gray-700 font-medium">Course Fee: </span>
                                            <span className="text-green-600 font-semibold">
                                                {formatCurrency(course.courseFees)}
                                            </span>
                                        </p>
                                        <p>
                                            <span className="text-gray-500">You Save: </span>
                                            <span className="text-emerald-600 font-bold">
                                                {formatCurrency(discount)} ({discountPercentage}%)
                                            </span>
                                        </p>
                                    </div>

                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminFranchiseCourseList;
