import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus } from 'lucide-react';

 
const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [displayCount, setDisplayCount] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem('courses')) || [];
    setCourses(storedCourses);
  }, []);

  const handleEdit = (index) => {
    localStorage.setItem('editCourseIndex', index);
    localStorage.setItem('editCourseData', JSON.stringify(courses[index]));
    navigate('/updatecourse');
  };
 
  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const updatedCourses = courses.filter((_, i) => i !== index);
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      setCourses(updatedCourses);
    }
  };

  const filteredCourses = courses.filter(course =>
    Object.values(course).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const displayedCourses = filteredCourses.slice(0, displayCount);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Course List</h1>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => navigate("/CourseForm")}
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Fees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QB Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedCourses.map((course, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.courseCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.courseName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.courseFees}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.courseMRP}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.minimumFees}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.examStatus}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.questionBankStatus}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        course.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
};

export default CourseList;