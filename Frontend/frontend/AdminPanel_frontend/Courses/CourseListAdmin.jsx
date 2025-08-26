import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, RefreshCw, Info, X as ModalCloseIcon } from 'lucide-react';
import API_BASE_URL from "../../config";
import { useNavigate } from "react-router-dom";

// Modal Component for Course Details
const CourseDetailsModal = ({ course, onClose }) => {
  // const navigate = useNavigate();
  if (!course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <ModalCloseIcon size={28} />
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 pr-8">{course.courseName}</h2>
        <p className="text-sm text-gray-500 mb-6">Code: {course.courseCode}</p>

        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1 border-b pb-1">Course Syllabus:</h3>
            <pre className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">{course.courseSyllabus || 'Not provided'}</pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1 border-b pb-1">Course Eligibility:</h3>
            <pre className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">{course.courseEligibility || 'Not provided'}</pre>
          </div>

          {course.courseVideoLinks && course.courseVideoLinks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1 border-b pb-1">Video Links:</h3>
              <ul className="list-disc list-inside bg-gray-50 p-3 rounded-md text-sm space-y-1 max-h-40 overflow-y-auto">
                {course.courseVideoLinks.map((video, index) => (
                  <li key={index}>
                    <strong className="font-medium">{video.title || 'Untitled Video'}:</strong> <a href={video.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{video.link}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.courseMaterials && course.courseMaterials.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1 border-b pb-1">Notes/Materials:</h3>
              <ul className="list-disc list-inside bg-gray-50 p-3 rounded-md text-sm space-y-1 max-h-40 overflow-y-auto">
                {course.courseMaterials.map((material, index) => (
                  <li key={index}>
                    <strong className="font-medium">{material.title || 'Untitled Material'}</strong> ({material.type}):
                    {material.type === 'file' && material.fileName && ` ${material.fileName} - `}
                    <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {material.type === 'file' ? 'View/Download' : 'Open Link'}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const CourseListAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(10);

  const openDetailsModal = (course) => {
    setSelectedCourseForDetails(course);
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedCourseForDetails(null);
  };

  const fetchCoursesAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/api/v1/admin_courses`;
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Error: ${response.status}`);
      }
      const data = await response.json();
      setCourses(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch courses for admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAdmin();
  }, [filterStatus]);


  const handleUpdateStatus = async (courseId, newStatus) => {
    if (!window.confirm(`Are you sure you want to set this course to "${newStatus}"?`)) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin_courses/${courseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminApprovalStatus: newStatus }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Error: ${response.status}`);
      }
      fetchCoursesAdmin();
      alert(`Course status updated to ${newStatus}.`);
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
      console.error("Failed to update course status:", err);
      alert(`Failed to update course status: ${err.message}`);
    }
  };

  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const inputStyle = "rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm";
  // Updated button base style for consistent padding and text size
  const buttonActionStyle = "w-24 h-10 px-3 py-2 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 flex items-center justify-center leading-4";

  // Filter courses by status and search term
  const filteredCourses = courses.filter(course =>
    (filterStatus === '' || course.adminApprovalStatus === filterStatus) &&
    Object.values(course).some(value =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const displayedCourses = filteredCourses.slice(0, displayCount);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-2">
            <h1 className="text-3xl font-bold text-slate-800 w-full">
              Admin Course Management
            </h1>
            <button
              onClick={() => navigate("/admin/courselist")}
              className="mt-4 sm:mt-0 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors duration-200 flex items-center font-medium"
            >
              {/* <Plus className="w-5 h-5 mr-2" /> */}
              Admin Course List
            </button>
            <button
              onClick={() => navigate("/admin/add-course")}
              className="mt-4 sm:mt-0 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors duration-200 flex items-center font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Course
            </button>
          </div>

          {/* Search and count controls above tabs */}
          <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show</label>
              <input
                type="number"
                min="1"
                max={filteredCourses.length}
                value={displayCount}
                onChange={e => setDisplayCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), filteredCourses.length))}
                className="w-16 rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
              />
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border rounded-md p-3 w-80 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>
          </div>

          {/* Tabs for filtering by status - now below the heading and full width */}
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

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">Error: {error}</div>}
          {loading && <div className="text-center py-4">Loading courses...</div>}

          {!loading && (
            <div className="overflow-x-auto overflow-y-auto h-[70vh]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FranchiseID</th>

                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institute Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Approval</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedCourses.length === 0 && !loading && (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-500">No courses found for the selected filter.</td>
                    </tr>
                  )}
                  {displayedCourses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50 group">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{course.courseCode}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{course.courseName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{course.franchiseId}</td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{course.courseSubject}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{course.courseDuration} months</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.instituteStatus === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                          {course.instituteStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(course.adminApprovalStatus)}`}>
                          {course.adminApprovalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l">
                        <div className="flex items-center space-x-2 justify-center">
                          <button
                            onClick={() => openDetailsModal(course)}
                            className={`${buttonActionStyle} bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500`}
                            title="View Details"
                          >
                            <Info size={14} className="mr-1 sm:mr-1.5" /> <span className="hidden sm:inline">Details</span>
                          </button>
                          {course.adminApprovalStatus !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(course._id, 'approved')}
                              className={`${buttonActionStyle} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500`}
                              title="Approve Course"
                            >
                              <CheckCircle size={14} className="mr-1 sm:mr-1.5" /> <span className="hidden sm:inline">Approve</span>
                            </button>
                          )}
                          {course.adminApprovalStatus !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(course._id, 'rejected')}
                              className={`${buttonActionStyle} bg-rose-700 text-white hover:bg-rose-800 focus:ring-rose-600`}
                              title="Reject Course"
                            >
                              <XCircle size={14} className="mr-1 sm:mr-1.5" /> <span className="hidden sm:inline">Reject</span>
                            </button>
                          )}
                          {course.adminApprovalStatus !== 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(course._id, 'pending')}
                              className={`${buttonActionStyle} bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500`}
                              title="Set to Pending"
                            >
                              <RefreshCw size={14} className="mr-1 sm:mr-1.5" /> <span className="hidden sm:inline">Pending</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && <CourseDetailsModal course={selectedCourseForDetails} onClose={closeDetailsModal} />}
      <style jsx global>{`
        @keyframes modalShow {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-modalShow {
          animation: modalShow 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CourseListAdmin;
