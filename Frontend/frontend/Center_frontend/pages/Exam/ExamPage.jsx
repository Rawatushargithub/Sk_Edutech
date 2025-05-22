// having fetch working
import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Globe, Book, Plus, Upload, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExamManagement = () => {
  const navigate = useNavigate();
  // State management
  const [mode, setMode] = useState('online');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample data for courses (you might want to fetch this from API too)
  const courses = [
    { id: 1, name: "BCA12H (Bachelor of Computer Application)" },
    { id: 2, name: "MCA34P (Master of Computer Application)" }
  ];

  // Exam data from API
  const [exams, setExams] = useState([]);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch exams from API
  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/api/v1/institute_exam/exams', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
console.log("Fetched exams:", response);
      const data = await response.json();
      
      // Transform API data to match component structure
      const transformedExams = data.map(exam => ({
        id: exam.ExamID,
        courseCode: exam.courseCode,
        batch: exam.batch,
        examDate: exam.examDate,
        examTime: exam.examTime || extractTimeFromDate(exam.examDate), // Extract time if stored in date
        examDurationMinutes: exam.examDurationMinutes,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        modeOnline: exam.examMode === 'Online',
        modeOffline: exam.examMode === 'Offline',
        displayResult: "Yes", // Default value, adjust based on your needs
        status: exam.status,
        createdAt: formatDate(exam.createdAt),
        marksUploaded: exam.results && exam.results.length > 0, // Check if results exist
        results: exam.results || []
      }));

      setExams(transformedExams);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to fetch exams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract time from date string
  const extractTimeFromDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '09:00'; // Default time
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Fetch exams on component mount
  useEffect(() => {
    fetchExams();
  }, []);
console.log("Exams:", exams);
  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle upload marks
  const handleUploadMarks = (examId) => {
    setSelectedExam(examId);
    setShowUploadDialog(true);
  };

  // Confirm file upload
  const confirmUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('marksFile', selectedFile);
      formData.append('examId', selectedExam);

      // Replace with your actual API endpoint for uploading marks
      const response = await fetch(`/api/exams/${selectedExam}/upload-marks`, {
        method: 'POST',
        body: formData,
        // Add authorization header if needed
        // headers: {
        //   'Authorization': `Bearer ${token}`
        // }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update local state
      setExams(exams.map(exam => {
        if (exam.id === selectedExam) {
          return {
            ...exam,
            marksUploaded: true,
            results: result.results || []
          };
        }
        return exam;
      }));

      setShowUploadDialog(false);
      setSelectedFile(null);
      setSuccessMessage("Marks uploaded successfully!");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

    } catch (err) {
      console.error('Error uploading marks:', err);
      alert('Failed to upload marks. Please try again.');
    }
  };

  // Filter exams based on mode, search term, course and tab
  const filteredExams = exams.filter(exam => {
    const matchesMode = mode === 'online' ? exam.modeOnline : exam.modeOffline;
    const matchesSearch = exam.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || exam.courseCode === selectedCourse;
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'active' && exam.status === 'Active') ||
                      (activeTab === 'inactive' && exam.status === 'Inactive');
    
    return matchesMode && matchesSearch && matchesCourse && matchesTab;
  });

  // Retry function for error state
  const handleRetry = () => {
    fetchExams();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
          <div className="p-6 flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading exams...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
          <div className="p-6 flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-red-500">Exam Management</h1>
            <div className="flex gap-2">
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setMode('online')}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    mode === 'online' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <Globe size={20} />
                  Online Exams
                </button>
                <button
                  onClick={() => setMode('offline')}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    mode === 'offline' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                  }`}
                > 
                  <Book size={20} />
                  Offline Exams
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Filter size={20} />
                Filters
              </button>
              <button
                onClick={() => navigate("/institute/AddExam")}
                className="px-4 py-2 flex items-center gap-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus size={20} />
                Add Exam
              </button>
              <button
                onClick={handleRetry}
                className="px-4 py-2 flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Refresh exams"
              >
                <Sliders size={20} />
                Refresh
              </button>
            </div>
          </div>

          {/* Mode specific note */}
          <div className="text-blue-600 font-medium text-sm bg-blue-50 p-4 rounded-lg">
            {mode === 'online' 
              ? "Online exams are conducted through the digital platform. Students can take exams remotely."
              : "Offline exams require physical presence. Don't forget to upload marks after evaluation."
            }
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by exam ID or course code..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <select
                    className="appearance-none bg-white border rounded-lg px-4 py-2 pr-10"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="all">All Courses</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id === 1 ? "BCA12H" : "MCA34P"}>{course.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 ${
                  activeTab === 'all'
                    ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Exams ({filteredExams.length})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 ${
                  activeTab === 'active'
                    ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Active ({filteredExams.filter(e => e.status === 'Active').length})
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`py-2 px-1 ${
                  activeTab === 'inactive'
                    ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Inactive ({filteredExams.filter(e => e.status === 'Inactive').length})
              </button>
            </div>
          </div>

          {/* Exams Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total/Passing Marks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {exam.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exam.courseCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exam.batch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exam.examDate}
                        {exam.examTime && <><br />{exam.examTime}</>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exam.examDurationMinutes} mins
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exam.totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exam.totalMarks}/{exam.passingMarks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          exam.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/institute/Exam/EditExam/${exam.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          {mode === 'offline' && !exam.marksUploaded && (
                            <button
                              onClick={() => handleUploadMarks(exam.id)}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            >
                              <Upload size={16} /> Upload Marks
                            </button>
                          )}
                          {mode === 'offline' && exam.marksUploaded && (
                            <span className="text-green-600 flex items-center gap-1">
                              ✓ Marks Uploaded ({exam.results?.length || 0})
                            </span>
                          )}
                          {mode === 'online' && (
                            <button
                              onClick={() => navigate(`/institute/Exam/ViewResults/${exam.id}`)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              View Results ({exam.results?.length || 0})
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      No exams found matching the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Marks Dialog */}
        {showUploadDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Upload Student Marks</h3>
              <p className="text-gray-600 mb-4">
                Please upload an Excel or CSV file containing student marks for exam: {selectedExam}
              </p>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Select File</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-lg"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => {
                    setShowUploadDialog(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmUpload}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  disabled={!selectedFile}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message Toast */}
        {showSuccessMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;