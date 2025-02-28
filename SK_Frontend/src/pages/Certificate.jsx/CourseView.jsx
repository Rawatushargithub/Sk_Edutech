import React from 'react';
import { ChevronRight } from 'lucide-react';

const CourseView = ({ 
  courses, 
  students, 
  expandedCourses, 
  selectedStudents, 
  toggleCourseExpansion, 
  handleBulkSelect, 
  setSelectedStudents 
}) => (
  <div className="space-y-4">
    {courses.map(course => {
      const courseStudents = students.filter(s => s.course === course.name);
      const eligibleStudents = courseStudents.filter(
        s => s.result === 'pass' && !s.certificateRequested
      );
      const isExpanded = expandedCourses[course.id];

      return (
        <div key={course.id} className="border rounded-lg">
          <div 
            className="p-4 bg-gray-50 rounded-t-lg flex items-center justify-between cursor-pointer"
            onClick={() => toggleCourseExpansion(course.id)}
          >
            <div className="flex items-center gap-4">
              <ChevronRight 
                size={20} 
                className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
              <div>
                <h3 className="font-medium">{course.name}</h3>
                <p className="text-sm text-gray-500">
                  {courseStudents.length} students | {eligibleStudents.length} eligible for certificate
                </p>
              </div>
            </div>
            {eligibleStudents.length > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={eligibleStudents.every(s => selectedStudents.includes(s.id))}
                  onChange={(e) => handleBulkSelect(courseStudents, e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-600">Select All Eligible</span>
              </div>
            )}
          </div>
          
          {isExpanded && (
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-gray-500">
                    <th className="px-4 py-2 text-left">Student ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Percentage</th>
                    <th className="px-4 py-2 text-left">Grade</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStudents.map(student => (
                    <tr key={student.id} className="border-t">
                      <td className="px-4 py-2">{student.id}</td>
                      <td className="px-4 py-2">{student.name}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          {student.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {student.grade}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {student.certificateRequested ? (
                          <span className={`px-2 py-1 rounded-full ${
                            student.requestStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            student.requestStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.requestStatus?.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-gray-500">Not Requested</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {student.result === 'pass' && !student.certificateRequested && (
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents(prev => [...prev, student.id]);
                              } else {
                                setSelectedStudents(prev => prev.filter(id => id !== student.id));
                              }
                            }}
                            className="w-4 h-4 rounded"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    })}
  </div>
);

export default CourseView;