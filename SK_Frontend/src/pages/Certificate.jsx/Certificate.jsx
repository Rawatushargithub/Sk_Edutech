import React, { useState } from 'react';
import { Search, Filter, ChevronDown, LayoutGrid, List } from 'lucide-react';
import CourseView from './CourseView';
import ListView from './ListView';

const CertificateManagement = () => {
  // State management
  const [view, setView] = useState('list');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showFilters, setShowFilters] = useState(false); 
  const [expandedCourses, setExpandedCourses] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [studentToRequest, setStudentToRequest] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Sample data
  const courses = [
    { 
      id: 1, 
      name: "Diploma in Computer Course",
      totalStudents: 25,
      pendingRequests: 5,
      approvedRequests: 15
    },
    { 
      id: 2, 
      name: "Basic Course in Advance Excel",
      totalStudents: 30,
      pendingRequests: 8,
      approvedRequests: 18
    },
    { 
      id: 3, 
      name: "BASIC COURSE IN MS-OFFICE",
      totalStudents: 20,
      pendingRequests: 3,
      approvedRequests: 12
    }
  ];

  const [students, setStudents] = useState([
    {
      id: "STD001",
      name: "Tushar Rawat",
      course: "BASIC COURSE IN MS-OFFICE",
      enrollmentDate: "2024-01-15",
      completionDate: "2024-06-15",
      result: "pass",
      percentage: "85.5",
      grade: "A",
      certificateRequested: false,
      requestStatus: null,
      requestDate: null
    },
    {
        id: "STD320",
        name: "Aashish Thakur",
        course: "Diploma in Computer Course",
        enrollmentDate: "2024-01-20",
        completionDate: "2024-09-08",
        result: "pass",
        percentage: "87",
        grade: "A",
        certificateRequested: false,
        requestStatus: null,
        requestDate: null
    },
    {
        id: "STD329",
        name: "Anil Kumar",
        course: "Diploma in Computer Course",
        enrollmentDate: "2024-01-20",
        completionDate: "2024-09-08",
        result: "pass",
        percentage: "92",
        grade: "A",
        certificateRequested: false,
        requestStatus: null,
        requestDate: null
    },
    {
        id: "STD388",
        name: "Ankur Kushwaha",
        course: "Diploma in Computer Course",
        enrollmentDate: "2024-01-22",
        completionDate: "2024-09-08",
        result: "pass",
        percentage: "90.5",
        grade: "B",
        certificateRequested: false,
        requestStatus: null,
        requestDate: null
    },
    {
      id: "STD002",
      name: "Pawan Kumar",
      course: "BASIC COURSE IN MS-OFFICE",
      enrollmentDate: "2024-02-01",
      completionDate: "2024-07-01",
      result: "pass",
      percentage: "78.3",
      grade: "B+",
      certificateRequested: true,
      requestStatus: "approved",
      requestDate: "2024-07-02"
    }
  ]);

  // Event handlers
  const handleRequestCertificate = (studentId) => {
    setStudentToRequest(studentId);
    setShowConfirmDialog(true);
  };

  const confirmRequestCertificate = () => {
    setStudents(students.map(student => {
      if (student.id === studentToRequest) {
        return {
          ...student,
          certificateRequested: true,
          requestStatus: 'pending',
          requestDate: new Date().toISOString().split('T')[0]
        };
      }
      return student;
    }));
    setShowConfirmDialog(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const toggleCourseExpansion = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleBulkSelect = (courseStudents, isSelected) => {
    const studentIds = courseStudents
      .filter(student => student.result === 'pass' && !student.certificateRequested)
      .map(student => student.id);
    
    if (isSelected) {
      setSelectedStudents(prev => [...new Set([...prev, ...studentIds])]);
    } else {
      setSelectedStudents(prev => prev.filter(id => !studentIds.includes(id)));
    }
  };

  const handleBulkRequest = () => {
    setShowConfirmDialog(true);
  };

  const confirmBulkRequest = () => {
    setStudents(students.map(student => {
      if (selectedStudents.includes(student.id)) {
        return {
          ...student,
          certificateRequested: true,
          requestStatus: 'pending',
          requestDate: new Date().toISOString().split('T')[0]
        };
      }
      return student;
    }));
    setSelectedStudents([]);
    setShowConfirmDialog(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || student.course === selectedCourse;
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'pending' && student.requestStatus === 'pending') ||
                      (activeTab === 'approved' && student.requestStatus === 'approved') ||
                      (activeTab === 'rejected' && student.requestStatus === 'rejected');
    
    return matchesSearch && matchesCourse && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Certificate Management</h1>
            <div className="flex gap-2">
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    view === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <List size={20} />
                  List View
                </button>
                <button
                  onClick={() => setView('course')}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    view === 'course' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <LayoutGrid size={20} />
                  Course View
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Filter size={20} />
                Filters
              </button>
            </div>
          </div>

          {/* Warning Note */}
          <div className="text-red-600 font-medium text-sm bg-red-50 p-4 rounded-lg">
            Note: Only after Applying For Approval of Certificates, you will able to view Student Certificates and Marksheets.
          </div>

          {/* Bulk Selection Banner */}
          {selectedStudents.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
              <span className="text-blue-600">
                {selectedStudents.length} students selected for certificate request
              </span>
              <button
                onClick={handleBulkRequest}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Request Certificates for Selected Students
              </button>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by student name or ID..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {view === 'list' && (
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border rounded-lg px-4 py-2 pr-10"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                      <option value="all">All Courses</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.name}>{course.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          {view === 'course' ? (
            <CourseView
              courses={courses}
              students={students}
              expandedCourses={expandedCourses}
              selectedStudents={selectedStudents}
              toggleCourseExpansion={toggleCourseExpansion}
              handleBulkSelect={handleBulkSelect}
              setSelectedStudents={setSelectedStudents}
            />
          ) : (
            <ListView
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredStudents={filteredStudents}
              handleRequestCertificate={handleRequestCertificate}
            />
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <h3 className="text-lg font-medium mb-4">Confirm Certificate Request</h3>
              <p className="text-gray-600 mb-6">
                {selectedStudents.length > 0 
                  ? `Are you sure you want to request certificates for ${selectedStudents.length} students?`
                  : 'Are you sure you want to request a certificate?'
                }
              </p>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={selectedStudents.length > 0 ? confirmBulkRequest : confirmRequestCertificate}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message Toast */}
        {showSuccessMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            Certificate request submitted successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateManagement;