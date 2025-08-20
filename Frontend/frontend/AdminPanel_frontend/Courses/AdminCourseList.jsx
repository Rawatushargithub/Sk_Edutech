import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Search,
    Filter,
    BookOpen,
    Clock,
    Users,
    DollarSign,
    ImageIcon,
    ExternalLink,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary

const AdminCoursesList = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const navigate = useNavigate();

    // Fetch courses created by admin
    useEffect(() => {
        fetchAdminCourses();
    }, []);

    // Filter courses based on search and status
    useEffect(() => {
        let filtered = courses.filter(course => {
            const matchesSearch =
                course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.courseSubject.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "all" || course.instituteStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });

        setFilteredCourses(filtered);
    }, [courses, searchTerm, statusFilter]);

    const fetchAdminCourses = async () => {
        try {
            setLoading(true);
            //   const adminToken = localStorage.getItem("adminToken");

            const response = await fetch(`${API_BASE_URL}/api/v1/admin/courses/admin-courses`, {
                headers: {
                    //   Authorization: `Bearer ${adminToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch courses");
            }

            const json = await response.json();
            setCourses(json.data || []);
            setFilteredCourses(json.data || []);
        } catch (error) {
            toast.error("Error fetching courses: " + error.message);
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (courseId) => {
        navigate(`/admin/add-course/update/${courseId}`);
    };

    const handleDelete = async () => {
        if (!courseToDelete) return;

        try {
            setDeleteLoading(courseToDelete._id);
            const adminToken = localStorage.getItem("adminToken");

            const response = await fetch(
                `${API_BASE_URL}/api/v1/admin/courses/delete/${courseToDelete._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete course");
            }

            toast.success("Course deleted successfully!");
            fetchAdminCourses(); // Refresh the list
        } catch (error) {
            toast.error("Error deleting course: " + error.message);
        } finally {
            setDeleteLoading(null);
            setShowDeleteModal(false);
            setCourseToDelete(null);
        }
    };

    const openDeleteModal = (course) => {
        setCourseToDelete(course);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setCourseToDelete(null);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "active":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "inactive":
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
        switch (status) {
            case "active":
                return `${baseClasses} bg-green-100 text-green-800`;
            case "inactive":
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading courses...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                                    Admin Courses Management
                                </h1>
                                <p className="text-gray-600">
                                    Manage courses created by admin • {filteredCourses.length} courses found
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/admin/add-course")}
                                className="mt-4 sm:mt-0 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors duration-200 flex items-center font-medium"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add New Course
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by course name, code, or subject..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Filter className="text-gray-400 w-5 h-5" />
                                {/* <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select> */}
                            </div>
                        </div>
                    </div>

                    {/* Courses Grid */}
                    {filteredCourses.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                {searchTerm || statusFilter !== "all" ? "No courses match your filters" : "No courses found"}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || statusFilter !== "all"
                                    ? "Try adjusting your search terms or filters."
                                    : "Get started by creating your first course."}
                            </p>
                            {(!searchTerm && statusFilter === "all") && (
                                <button
                                    onClick={() => navigate("/admin/add-course")}
                                    className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors duration-200 inline-flex items-center"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add First Course
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <div
                                    key={course._id}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                                >
                                    {/* Course Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-slate-600 to-slate-800">
                                        {course.courseImage ? (
                                            <img
                                                src={course.courseImage}
                                                alt={course.courseName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <ImageIcon className="w-12 h-12 text-white opacity-50" />
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-4 left-4">
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(course.instituteStatus)}
                                                <span className={getStatusBadge(course.instituteStatus)}>
                                                    {course.instituteStatus?.charAt(0).toUpperCase() + course.instituteStatus?.slice(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Admin Badge */}
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                ADMIN
                                            </span>
                                        </div>
                                    </div>

                                    {/* Course Content */}
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {course.courseName}
                                            </h3>
                                            <p className="text-sm text-slate-600 font-medium mb-1">
                                                Code: {course.courseCode}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Subject: {course.courseSubject}
                                            </p>
                                        </div>

                                        {/* Course Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm text-gray-600">
                                                    {course.courseDuration} months
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <DollarSign className="w-4 h-4 text-green-500" />
                                                <span className="text-sm text-gray-600">
                                                    ₹{course.courseFees}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Course Features */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {course.courseVideoLinks && course.courseVideoLinks.length > 0 && (
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium flex items-center">
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    {course.courseVideoLinks.length} Videos
                                                </span>
                                            )}
                                            {course.courseMaterials && course.courseMaterials.length > 0 && (
                                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium flex items-center">
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    {course.courseMaterials.length} Materials
                                                </span>
                                            )}
                                        </div>

                                        {/* MRP vs Fees */}
                                        {course.courseMRP && course.courseMRP !== course.courseFees && (
                                            <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">MRP:</span>
                                                    <span className="text-sm line-through text-red-500">₹{course.courseMRP}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-800">Actual Price:</span>
                                                    <span className="text-sm font-bold text-green-600">₹{course.courseFees}</span>
                                                </div>
                                                <div className="text-xs text-green-600 mt-1">
                                                    Save ₹{course.courseMRP - course.courseFees}
                                                    ({Math.round(((course.courseMRP - course.courseFees) / course.courseMRP) * 100)}% off)
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(course._id)}
                                                className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors duration-200 flex items-center justify-center text-sm font-medium"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => openDeleteModal(course)}
                                                disabled={deleteLoading === course._id}
                                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deleteLoading === course._id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                ) : (
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                )}
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center mb-4">
                            <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                            <h3 className="text-lg font-bold text-gray-900">Delete Course</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>"{courseToDelete?.courseName}"</strong>?
                            This action cannot be undone and will permanently remove the course and all associated data.
                        </p>

                        <div className="flex space-x-3">
                            <button
                                onClick={closeDeleteModal}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {deleteLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Course"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminCoursesList;