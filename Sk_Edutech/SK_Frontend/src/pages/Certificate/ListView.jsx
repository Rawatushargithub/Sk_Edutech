import React from 'react';
import { Eye } from 'lucide-react';

const ListView = ({ 
  activeTab, 
  setActiveTab, 
  filteredStudents, 
  handleRequestCertificate  
}) => (
  <div>
    <div className="flex border-b">
      {['all', 'pending', 'approved', 'rejected'].map((tab) => (
        <button
          key={tab}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === tab
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Student ID</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Course</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Enrollment Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Completion Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Percentage</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Grade</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredStudents.map(student => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 text-sm text-gray-900">{student.id}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{student.name}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{student.course}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{student.enrollmentDate}</td>
              <td className="px-4 py-4 text-sm text-gray-900">{student.completionDate}</td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                  {student.percentage}%
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {student.grade}
                </span>
              </td>
              <td className="px-4 py-4 text-sm">
                {student.certificateRequested ? (
                  <span className={`px-2 py-1 rounded-full ${
                    student.requestStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    student.requestStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.requestStatus.toUpperCase()}
                  </span>
                ) : (
                  <span className="text-gray-500">Not Requested</span>
                )}
              </td>
              <td className="px-4 py-4 text-sm">
                {!student.certificateRequested && student.result === 'pass' && (
                  <button
                    onClick={() => handleRequestCertificate(student.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Request Certificate
                  </button>
                )}
                {student.requestStatus === 'approved' && (
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 flex items-center gap-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View Certificate"
                    >
                      <Eye size={16} />
                      Certificate
                    </button>
                    <button
                      className="px-3 py-1 flex items-center gap-1 text-green-600 hover:bg-green-50 rounded-lg"
                      title="View Marksheet"
                    >
                      <Eye size={16} />
                      Marksheet
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ListView;