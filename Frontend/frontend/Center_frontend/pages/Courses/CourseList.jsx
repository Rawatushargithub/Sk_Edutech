import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus, Eye, X, ExternalLink, FileText, Clock, DollarSign, BookOpen } from 'lucide-react';
import API_BASE_URL from "../../../config";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState(''); // New filter for course source
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const franchiseId = localStorage.getItem('franchiseID');
        
        // Fetch both institute courses and admin courses
        const [instituteCourseResponse, adminCourseResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/institute_courses/getCourses?franchiseId=${franchiseId}`),
          fetch(`${API_BASE_URL}/api/v1/admin/courses/admin-courses`)
        ]);
        
        if (!instituteCourseResponse.ok) {
          throw new Error(`Institute courses error: ${instituteCourseResponse.status} ${instituteCourseResponse.statusText}`);
        }
        
        const instituteCourses = await instituteCourseResponse.json();
        let adminCourses = [];
        
        // Admin courses fetch might fail, so handle it gracefully
        if (adminCourseResponse.ok) {
          const adminData = await adminCourseResponse.json();
          adminCourses = adminData.data || [];
        } else {
          console.warn("Failed to fetch admin courses:", adminCourseResponse.statusText);
        }
        
        // Combine both course arrays
        const allCourses = [...instituteCourses, ...adminCourses];
        console.log("Combined courses:", allCourses);
        
        setCourses(allCourses);
        
        // Update the local storage with fetched courses (if needed)
        localStorage.setItem('courses', JSON.stringify(allCourses));
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch courses:", err);
        
        // Fallback to local storage if fetch fails
        const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        if (storedCourses.length > 0) {
          setCourses(storedCourses);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses(); 
  }, []);

  const handleEdit = (courseId) => {
    // We'll pass the courseId to the route, the form will fetch the course data
    navigate(`/institute/updatecourse/${courseId}`);
  };

  const handleViewCourse = async (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
    setModalLoading(true);
    
    try {
      // Fetch detailed course information
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/courses/admin-course/${course._id}`);
      if (response.ok) {
        const data = await response.json();
        setCourseDetails(data.data);
      } else {
        // Fallback to the course data we already have
        setCourseDetails(course);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      // Fallback to the course data we already have
      setCourseDetails(course);
    } finally {
      setModalLoading(false);
    }
  };

  const closeCourseModal = () => {
    setShowCourseModal(false);
    setSelectedCourse(null);
    setCourseDetails(null);
  };
 
  // const handleDelete = (index) => { // Delete functionality removed
  //   if (window.confirm('Are you sure you want to delete this course?')) {
  //     const updatedCourses = courses.filter((_, i) => i !== index);
  //     localStorage.setItem('courses', JSON.stringify(updatedCourses));
  //     setCourses(updatedCourses);
  //   }
  // };
 
  const filteredCourses = courses.filter(course => {
    const matchesStatus = filterStatus === '' || course.adminApprovalStatus === filterStatus;
    const matchesSearch = Object.values(course).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Filter by course source
    const isAdminCourse = course.byAdmin === true || course.franchiseId === "Admin";
    const matchesSource = filterSource === '' || 
      (filterSource === 'admin' && isAdminCourse) ||
      (filterSource === 'institute' && !isAdminCourse);
    
    return matchesStatus && matchesSearch && matchesSource;
  });

  const displayedCourses = filteredCourses.slice(0, displayCount);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Course List</h1>
              <p className="text-sm text-gray-600 mt-1">Institute courses and Admin courses</p>
            </div>
            <button
              className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
              onClick={() => navigate("/institute/CourseForm")}
            >
              <Plus className="w-5 h-5" />
              Add Course
            </button>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Show</label>
                <input
                  type="number"
                  min="1"
                  max={courses.length}
                  value={displayCount}
                  onChange={(e) => setDisplayCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), courses.length))}
                  className="w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">entries</span>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Source:</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Sources</option>
                  <option value="institute">Institute</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-md  p-3 w-80"
              />
            </div>
          </div>

          {/* Tabs for filtering by status - below search, above table */}
          <div className="w-full mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-0 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              <button
                className={`w-full px-4 py-3 text-md font-bold transition-colors duration-150 focus:outline-none border-b-2 sm:border-b-0 sm:border-r-3 border-gray-200 last:border-r-0
                  ${filterStatus === ''
                    ? 'bg-gray-300 text-gray-700  border-b-4 sm:border-b-0 sm:border-r-4 border-slate-600 shadow font-bold z-10'
                    : 'text-slate-700 hover:bg-black-100 hover:text-slate-900 bg-gray-50'}
                `}
                onClick={() => setFilterStatus('')}
                type="button"
              >
                All Courses
              </button>
              <button
                className={`w-full px-4 py-3 text-md font-bold transition-colors duration-150 focus:outline-none border-b-2 sm:border-b-0 sm:border-r-2 border-gray-200 last:border-r-0
                  ${filterStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 border-b-4 sm:border-b-0 sm:border-r-4 border-yellow-500 shadow font-bold z-10'
                    : 'text-slate-700 hover:bg-yellow-50 hover:text-yellow-700 bg-gray-50'}
                `}
                onClick={() => setFilterStatus('pending')}
                type="button"
              >
                Pending Courses
              </button>
              <button
                className={`w-full px-4 py-3 text-md font-bold transition-colors duration-150 focus:outline-none border-b-2 sm:border-b-0 sm:border-r-2 border-gray-200 last:border-r-0
                  ${filterStatus === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border-b-4 sm:border-b-0 sm:border-r-4 border-green-700 shadow font-bold z-10'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 bg-gray-50'}
                `}
                onClick={() => setFilterStatus('approved')}
                type="button"
              >
                Approved Courses
              </button>
              <button
                className={`w-full px-4 py-3 text-md font-bold transition-colors duration-150 focus:outline-none border-b-2 sm:border-b-0 border-gray-200
                  ${filterStatus === 'rejected'
                    ? 'bg-red-100 text-red-800 border-b-4 sm:border-b-0 sm:border-r-4 border-rose-700 shadow font-bold z-10'
                    : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700 bg-gray-50'}
                `}
                onClick={() => setFilterStatus('rejected')}
                type="button"
              >
                Rejected Courses
              </button>
            </div>
          </div>

   
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (Months)</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Status</th> */}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QB Status</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Approval</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedCourses.map((course, index) => {
                  // Determine if this is an admin course
                  const isAdminCourse = course.byAdmin === true || course.franchiseId === "Admin";
                  
                  return (
                    <tr key={course._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.courseCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.courseName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isAdminCourse 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isAdminCourse ? 'Admin' : 'Institute'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.courseFees}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.courseMRP}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.courseDuration}</td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.examStatus || 'N/A'}</td> */}
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.questionBankStatus || 'N/A'}</td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          course.adminApprovalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          course.adminApprovalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800' // for 'pending'
                        }`}>
                          {course.adminApprovalStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {!isAdminCourse ? (
                            <button
                              onClick={() => handleEdit(course._id)} // Pass course._id
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Course"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleViewCourse(course)}
                                className="text-green-600 hover:text-green-900"
                                title="View Course Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <span className="text-gray-400 text-sm ml-2">Admin Course</span>
                            </>
                          )}
                        </div>
                        {/* Delete button removed */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table> 
          </div>

          {/* Empty State */}
          {displayedCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No courses found</p>
            </div>
          )}
        </div>
      </div>

      {/* Course Details Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Course Details</h3>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  Admin Course
                </span>
              </div>
              <button
                onClick={closeCourseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">Loading course details...</span>
                </div>
              ) : courseDetails ? (
                <div className="space-y-6">
                  {/* Course Image */}
                  {courseDetails.courseImage && (
                    <div className="flex justify-center">
                      <img
                        src={courseDetails.courseImage}
                        alt={courseDetails.courseName}
                        className="w-48 h-32 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                        <p className="text-lg font-semibold text-gray-900">{courseDetails.courseName}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                        <p className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{courseDetails.courseCode}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <p className="text-gray-900">{courseDetails.courseSubject}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          courseDetails.adminApprovalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          courseDetails.adminApprovalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {courseDetails.adminApprovalStatus}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Duration</label>
                          <p className="text-gray-900">{courseDetails.courseDuration} months</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Fees</label>
                          <p className="text-gray-900">₹{courseDetails.courseFees}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <div>
                          <label className="block text-sm font-medium text-gray-700">MRP</label>
                          <p className="text-gray-900">₹{courseDetails.courseMRP}</p>
                        </div>
                      </div>

                      {courseDetails.courseMRP && courseDetails.courseMRP !== courseDetails.courseFees && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Discount:</strong> ₹{courseDetails.courseMRP - courseDetails.courseFees} 
                            ({Math.round(((courseDetails.courseMRP - courseDetails.courseFees) / courseDetails.courseMRP) * 100)}% off)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course Description */}
                  {courseDetails.courseSyllabus && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Syllabus</label>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{courseDetails.courseSyllabus}</p>
                      </div>
                    </div>
                  )}

                  {/* Eligibility */}
                  {courseDetails.courseEligibility && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria</label>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800">{courseDetails.courseEligibility}</p>
                      </div>
                    </div>
                  )}

                  {/* Video Links */}
                  {courseDetails.courseVideoLinks && courseDetails.courseVideoLinks.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Videos</label>
                      <div className="space-y-2">
                        {courseDetails.courseVideoLinks.map((video, index) => (
                          <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <ExternalLink className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-800 font-medium">{video.title}</span>
                            </div>
                            <a
                              href={video.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Video
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Materials */}
                  {courseDetails.courseMaterials && courseDetails.courseMaterials.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Materials</label>
                      <div className="space-y-2">
                        {courseDetails.courseMaterials.map((material, index) => (
                          <div key={index} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-purple-600" />
                              <span className="text-purple-800 font-medium">{material.title}</span>
                              {material.fileType && (
                                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                  {material.fileType}
                                </span>
                              )}
                            </div>
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 text-sm"
                            >
                              {material.type === 'link' ? 'Open Link' : 'Download'}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Failed to load course details</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeCourseModal}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
