import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react'; // Added RefreshCw for pending

const CourseListAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState(''); // '', 'pending', 'approved', 'rejected'

  const fetchCoursesAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = 'http://localhost:8000/api/v1/admin/courses';
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }
      const response = await fetch(url); // Assuming admin auth is handled (e.g., via cookies/headers)
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Error: ${response.status}`);
      }
      const data = await response.json();
      setCourses(data.data || []); // Assuming API response is { statusCode, data, message }
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
      const response = await fetch(`http://localhost:8000/api/v1/admin/courses/${courseId}/status`, {
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
      // Refresh course list
      fetchCoursesAdmin();
      alert(`Course status updated to ${newStatus}.`);
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
      console.error("Failed to update course status:", err);
      alert(`Failed to update course status: ${err.message}`);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const inputStyle = "rounded-md border-gray-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm";
  const buttonStyle = "px-3 py-1.5 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-1";


  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-slate-800">Admin Course Management</h1>
            <div className="flex items-center gap-4">
              <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`${inputStyle} py-2`}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">Error: {error}</div>}
          {loading && <div className="text-center py-4">Loading courses...</div>}

          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institute Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Approval</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.length === 0 && !loading && (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-500">No courses found for the selected filter.</td>
                    </tr>
                  )}
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{course.courseCode}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{course.courseName}</td>
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                        {course.adminApprovalStatus !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(course._id, 'approved')}
                            className={`${buttonStyle} bg-green-500 text-white hover:bg-green-600 focus:ring-green-400 flex items-center`}
                            title="Approve Course"
                          >
                            <CheckCircle size={14} className="mr-1" /> Approve
                          </button>
                        )}
                        {course.adminApprovalStatus !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(course._id, 'rejected')}
                            className={`${buttonStyle} bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 flex items-center`}
                            title="Reject Course"
                          >
                            <XCircle size={14} className="mr-1" /> Reject
                          </button>
                        )}
                         {course.adminApprovalStatus !== 'pending' && ( // Option to revert to pending
                          <button
                            onClick={() => handleUpdateStatus(course._id, 'pending')}
                            className={`${buttonStyle} bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 flex items-center`}
                            title="Set to Pending"
                          >
                            <RefreshCw size={14} className="mr-1" /> Pending
                          </button>
                        )}
                        {/* <button className={`${buttonStyle} bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 flex items-center`} title="View Details">
                           <Eye size={14} className="mr-1" /> View 
                        </button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseListAdmin;
