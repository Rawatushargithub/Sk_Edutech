import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Globe,
  Book,
  Plus,
  Upload,
  Sliders,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../config";

const ExamManagement = () => {
  const navigate = useNavigate();

  // State management
  const [mode, setMode] = useState("online");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New states for upload marks page
  const [showUploadPage, setShowUploadPage] = useState(false);
  const [students, setStudents] = useState([]);
  const [uploadingMarks, setUploadingMarks] = useState(false);

  // Exam data from API
  const [exams, setExams] = useState([]);

  // Function to update exam status to inactive
  const updateExamStatus = async (examId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/exams/${examId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Inactive" }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Exam status updated:", result);

      return result;
    } catch (err) {
      console.error("Error updating exam status:", err);
      throw err;
    }
  };
 
  // Fetch exams from API with automatic status update
  const fetchExams = async (examMode = mode) => {
    try {
      setLoading(true);
      setError(null);
 const franchiseId = localStorage.getItem('franchiseID');
 console.log("Fetching exams for franchise:", franchiseId);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/exams?examMode=${examMode === 'online' ? 'Online' : 'Offline'}&franchiseId=${franchiseId}`, 
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform API data and check for expired exams
      const transformedExams = await Promise.all(
        data.exams.map(async (exam) => {
          const daysLeft = getDaysLeft(exam.examDate);

          // If exam date has passed and status is still Active, update it to Inactive
          if (daysLeft <= 0 && exam.status === "Active") {
            try {
              await updateExamStatus(exam.ExamID);
            } catch (err) {
              console.error(
                `Failed to update status for exam ${exam.ExamID}:`,
                err
              );
            }
          }

          return {
            id: exam.ExamID,
            courseCode: exam.courseCode,
            batch: exam.batch || [],
            examDate: exam.examDate,
            examDurationMinutes: exam.examDurationMinutes,
            totalQuestions: exam.totalQuestions,
            totalMarks: exam.totalMarks,
            passingMarks: exam.passingMarks,
            modeOnline: exam.examMode === "Online",
            modeOffline: exam.examMode === "Offline",
            displayResult: "Yes",
            status: exam.status,
            createdAt: formatDate(exam.createdAt),
            marksUploaded: exam.results && exam.results.length > 0,
            results: exam.results || [],
            daysLeft: daysLeft,
          };
        })
      );

      setExams(transformedExams);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError("Failed to fetch exams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for a specific exam
  const fetchStudentsForExam = async (examId) => {
    try {
      const exam = exams.find((e) => e.id === examId);
      if (!exam) return;

      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/students?courseCode=${exam.courseCode}&batch=${exam.batch.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const studentsData = await response.json();
      console.log("Fetched students for exam:", studentsData);
      // Transform student data and add marks field
      const transformedStudents = studentsData.students.map((student) => ({
        rollNumber: student.rollNumber,
        studentName: student.studentName,
        marks: "", // Empty field for input
        existingMarks:
          exam.results?.find((r) => r.rollNumber === student.rollNumber)
            ?.marksObtained || "",
      }));

      setStudents(transformedStudents);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students. Please try again.");
    }
  };

  // Handle upload marks button click
  const handleUploadMarks = async (examId) => {
    setSelectedExam(examId);
    setShowUploadPage(true);
    await fetchStudentsForExam(examId);
  };

  // Handle marks input change
  const handleMarksChange = (rollNumber, marks) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.rollNumber === rollNumber
          ? { ...student, marks: marks }
          : student
      )
    );
  };

  // Upload marks to database
  const uploadMarks = async () => {
    try {
      setUploadingMarks(true);

      // Prepare marks data (only students with marks entered)
      const marksData = students
        .filter((student) => student.marks !== "" && student.marks !== null)
        .map((student) => ({
          rollNumber: student.rollNumber,
          marksObtained: parseInt(student.marks),
        }));

      if (marksData.length === 0) {
        alert("Please enter marks for at least one student.");
        return;
      }
console.log("Marks data to upload:", marksData);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/exams/${selectedExam}/marks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ results: marksData }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Marks uploaded successfully:", result);

      setSuccessMessage(
        `Marks uploaded successfully for ${marksData.length} students!`
      );
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // Go back to main page and refresh data
      setShowUploadPage(false);
      fetchExams();
    } catch (err) {
      console.error("Error uploading marks:", err);
      alert("Failed to upload marks. Please try again.");
    } finally {
      setUploadingMarks(false);
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
  }, [mode]);

  function getDaysLeft(targetDateStr) {
    const today = new Date();
    const targetDate = new Date(targetDateStr);
    const timeDiff = targetDate - today;
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil(timeDiff / msPerDay);
    return daysLeft;
  }

  // Get exams for current mode (for calculating tab counts)
  const modeFilteredExams = exams.filter((exam) => {
    return mode === "online" ? exam.modeOnline : exam.modeOffline;
  });

  // Calculate tab counts based on current mode
  const tabCounts = {
    all: modeFilteredExams.length,
    active: modeFilteredExams.filter((exam) => exam.status === "Active").length,
    inactive: modeFilteredExams.filter((exam) => exam.status === "Inactive")
      .length,
  };

  // Filter exams based on mode, search term, course and tab
  const filteredExams = exams.filter((exam) => {
    const matchesMode = mode === "online" ? exam.modeOnline : exam.modeOffline;
    const matchesSearch =
      exam.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse =
      selectedCourse === "all" || exam.courseName === selectedCourse;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && exam.status === "Active") ||
      (activeTab === "inactive" && exam.status === "Inactive");

    return matchesMode && matchesSearch && matchesCourse && matchesTab;
  });

  // Retry function for error state
  const handleRetry = () => {
    fetchExams();
  };

  // Loading state
  if (loading && !showUploadPage) {
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
  if (error && !showUploadPage) {
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

  // Upload Marks Page
  if (showUploadPage) {
    const currentExam = exams.find((e) => e.id === selectedExam);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowUploadPage(false);
                    navigate("/institute/Exam");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-red-500">
                    Upload Student Marks
                  </h1>
                  <p className="text-gray-600">
                    Exam ID: {selectedExam} | Course: {currentExam?.courseCode}{" Code"}
                    | Batch: {currentExam?.batch.timings}
                  </p>
                </div>
              </div>
              <button
                onClick={uploadMarks}
                disabled={uploadingMarks}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={20} />
                {uploadingMarks ? "Uploading..." : "Upload Marks"}
              </button>
            </div>

            {/* Exam Details */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Total Marks:</strong> {currentExam?.totalMarks}
                </div>
                <div>
                  <strong>Passing Marks:</strong> {currentExam?.passingMarks}
                </div>
                <div>
                  <strong>Total Questions:</strong>{" "}
                  {currentExam?.totalQuestions}
                </div>
                <div>
                  <strong>Duration:</strong> {currentExam?.examDurationMinutes}{" "}
                  mins
                </div>
              </div>
            </div>

            {/* Students Marks Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks (out of {currentExam?.totalMarks})
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.rollNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          min="0"
                          max={currentExam?.totalMarks}
                          value={student.marks}
                          onChange={(e) =>
                            handleMarksChange(
                              student.rollNumber,
                              e.target.value
                            )
                          }
                          className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={
                            student.existingMarks
                              ? student.existingMarks.toString()
                              : "0"
                          }
                        />
                        {student.existingMarks && (
                          <span className="ml-2 text-xs text-green-600">
                            (Previously: {student.existingMarks})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.marks &&
                        parseInt(student.marks) >= currentExam?.passingMarks ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Pass
                          </span>
                        ) : student.marks &&
                          parseInt(student.marks) <
                            currentExam?.passingMarks ? (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Fail
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {students.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No students found for this course and batch.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  // Main Exam Management Page
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-red-500">Exam Management</h1>
            <div className="flex gap-2">
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setMode("online")}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    mode === "online"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <Globe size={20} />
                  Online Exams
                </button>
                <button
                  onClick={() => setMode("offline")}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    mode === "offline"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600"
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
                className="px-4 py-2 flex items-center gap-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() => navigate("/institute/AddExam")}
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
            {mode === "online"
              ? "Online exams are conducted through the digital platform. Students can take exams remotely."
              : "Offline exams require physical presence. Upload marks after evaluation for inactive exams."}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
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
                    {courses.map((course) => (
                      <option
                        key={course.id}
                        value={course.id === 1 ? "BCA12H" : "MCA34P"}
                      >
                        {course.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-2 px-1 ${
                  activeTab === "all"
                    ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All Exams ({tabCounts.all})
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`py-2 px-1 ${
                  activeTab === "active"
                    ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Active ({tabCounts.active})
              </button>
              <button
                onClick={() => setActiveTab("inactive")}
                className={`py-2 px-1 ${
                  activeTab === "inactive"
                    ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Inactive ({tabCounts.inactive})
              </button>
            </div>
          </div>

          {/* Exams Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Exam ID 
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Course Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Batch
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Questions
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total/Passing Marks
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  {/* Conditionally render Actions column for offline exams */}
                  {mode === "offline" && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  )}
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
                        {exam.batch.timings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exam.examDate}
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
                      {/* Status cell: show green "Active" if active, else tick icon if inactive */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {exam.status === "Active" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-green-600 text-lg">
                            {/* Unicode tick icon */}
                            &#10003;
                          </span>
                        )}
                      </td>
                      {/* Only show Actions column for offline exams */}
                      {mode === "offline" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              Edit
                            </button>
                            {exam.status === "Inactive" && (
                              <button
                                onClick={() => handleUploadMarks(exam.id)}
                                className="text-green-600 hover:text-green-900 flex items-center gap-1"
                              >
                                <Upload size={16} /> Upload Marks
                              </button>
                            )}
                            {exam.marksUploaded && (
                              <span className="text-green-600 flex items-center gap-1">
                                ✓ Marks Uploaded ({exam.results?.length || 0})
                              </span>
                            )}
                            {/* Remove View Results for online exams from Actions */}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={
                        7 +
                        (filteredExams.some(exam => exam.status === "Active") ? 1 : 0) +
                        (mode === "offline" ? 1 : 0)
                      }
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No exams found matching the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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

// // having fetch working
// import React, { useState, useEffect } from 'react';
// import { Search, Filter, ChevronDown, Globe, Book, Plus, Upload, Sliders } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const ExamManagement = () => {
//   const navigate = useNavigate();
//   // State management
//   const [mode, setMode] = useState('online');
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCourse, setSelectedCourse] = useState('all');
//   const [showFilters, setShowFilters] = useState(false);
//   const [showUploadDialog, setShowUploadDialog] = useState(false);
//   const [selectedExam, setSelectedExam] = useState(null);
//   const [showSuccessMessage, setShowSuccessMessage] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Sample data for courses (you might want to fetch this from API too)
//   const courses = [
//     { id: 1, name: "BCA12H (Bachelor of Computer Application)" },
//     { id: 2, name: "MCA34P (Master of Computer Application)" }
//   ];

//   // Exam data from API
//   const [exams, setExams] = useState([]);

//   // File upload state
//   const [selectedFile, setSelectedFile] = useState(null);

//     // Function to update exam status to inactive
//   const updateExamStatus = async (examId) => {
//     try {
//       const response = await fetch(`http://localhost:8000/api/v1/institute_exam/exams/${examId}/status`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ status: 'Inactive' }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log('Exam status updated:', result);

//       return result;
//     } catch (err) {
//       console.error('Error updating exam status:', err);
//       throw err;
//     }
//   };

//   // Fetch exams from API with automatic status update
//   const fetchExams = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch('http://localhost:8000/api/v1/institute_exam/exams', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("Fetched exams:", data);

//       // Transform API data and check for expired exams
//       const transformedExams = await Promise.all(
//         data.map(async (exam) => {
//           const daysLeft = getDaysLeft(exam.examDate);

//           // If exam date has passed and status is still Active, update it to Inactive
//           if (daysLeft <= 0 && exam.status === 'Active') {
//             try {
//               await updateExamStatus(exam.ExamID);
//               // exam.status = 'Inactive'; // Update local data
//             } catch (err) {
//               console.error(`Failed to update status for exam ${exam.ExamID}:`, err);
//             }
//           }

//           return {
//             id: exam.ExamID,
//             courseCode: exam.courseCode,
//             batch: exam.batch,
//             examDate: exam.examDate,
//             examDurationMinutes: exam.examDurationMinutes,
//             totalQuestions: exam.totalQuestions,
//             totalMarks: exam.totalMarks,
//             passingMarks: exam.passingMarks,
//             modeOnline: exam.examMode === 'Online',
//             modeOffline: exam.examMode === 'Offline',
//             displayResult: "Yes",
//             status: exam.status,
//             createdAt: formatDate(exam.createdAt),
//             marksUploaded: exam.results && exam.results.length > 0,
//             results: exam.results || [],
//             daysLeft: daysLeft
//           };
//         })
//       );

//       setExams(transformedExams);
//     } catch (err) {
//       console.error('Error fetching exams:', err);
//       setError('Failed to fetch exams. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper function to format date
//   const formatDate = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleString();
//     } catch {
//       return dateString;
//     }
//   };

//   // Fetch exams on component mount
//   useEffect(() => {
//     fetchExams();
//   }, []);
// console.log("Exams:", exams);
//   // Handle file selection
//   const handleFileChange = (e) => {
//     setSelectedFile(e.target.files[0]);
//   };

//   // Handle upload marks
//   const handleUploadMarks = (examId) => {
//     setSelectedExam(examId);
//     setShowUploadDialog(true);
//   };

//   function getDaysLeft(targetDateStr) {
//   const today = new Date(); // current date
//   const targetDate = new Date(targetDateStr); // target date (e.g. "2025-12-31")

//   // Get time difference in milliseconds
//   const timeDiff = targetDate - today;

//   // Convert milliseconds to days
//   const msPerDay = 1000 * 60 * 60 * 24;
//   const daysLeft = Math.ceil(timeDiff / msPerDay); // ceil rounds up

//   return daysLeft;
// }

//   // Get exams for current mode (for calculating tab counts)
//   const modeFilteredExams = exams.filter(exam => {
//     return mode === 'online' ? exam.modeOnline : exam.modeOffline;
//   });

//   // Calculate tab counts based on current mode
//   const tabCounts = {
//     all: modeFilteredExams.length,
//     active: modeFilteredExams.filter(exam => exam.status === 'Active').length,
//     inactive: modeFilteredExams.filter(exam => exam.status === 'Inactive').length
//   };

//   // Filter exams based on mode, search term, course and tab
//   const filteredExams = exams.filter(exam => {
//     const matchesMode = mode === 'online' ? exam.modeOnline : exam.modeOffline;
//     const matchesSearch = exam.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          exam.id.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCourse = selectedCourse === 'all' || exam.courseCode === selectedCourse;
//     const matchesTab = activeTab === 'all' ||
//                       (activeTab === 'active' && exam.status === 'Active') ||
//                       (activeTab === 'inactive' && exam.status === 'Inactive');

//     return matchesMode && matchesSearch && matchesCourse && matchesTab;
//   });
//   console.log("Filtered Exams:", filteredExams);

//   // Retry function for error state
//   const handleRetry = () => {
//     fetchExams();
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
//           <div className="p-6 flex justify-center items-center h-64">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//               <p className="text-gray-600">Loading exams...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
//           <div className="p-6 flex justify-center items-center h-64">
//             <div className="text-center">
//               <div className="text-red-500 text-4xl mb-4">⚠️</div>
//               <p className="text-gray-600 mb-4">{error}</p>
//               <button
//                 onClick={handleRetry}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">

//         {/* Success Message */}
//         {showSuccessMessage && (
//           <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
//             <span className="block sm:inline">{successMessage}</span>
//           </div>
//         )}

//         <div className="p-6 space-y-6">
//           {/* Header */}
//           <div className="flex justify-between items-center">
//             <h1 className="text-4xl font-bold text-red-500">Exam Management</h1>
//             <div className="flex gap-2">
//               <div className="flex border rounded-lg overflow-hidden">
//                 <button
//                   onClick={() => setMode('online')}
//                   className={`px-4 py-2 flex items-center gap-2 ${
//                     mode === 'online' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
//                   }`}
//                 >
//                   <Globe size={20} />
//                   Online Exams
//                 </button>
//                 <button
//                   onClick={() => setMode('offline')}
//                   className={`px-4 py-2 flex items-center gap-2 ${
//                     mode === 'offline' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
//                   }`}
//                 >
//                   <Book size={20} />
//                   Offline Exams
//                 </button>
//               </div>
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="px-4 py-2 flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg"
//               >
//                 <Filter size={20} />
//                 Filters
//               </button>
//               <button
//                 onClick={() => navigate("/institute/AddExam")}
//                 className="px-4 py-2 flex items-center gap-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//               >
//                 <Plus size={20} />
//                 Add Exam
//               </button>
//               <button
//                 onClick={handleRetry}
//                 className="px-4 py-2 flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg"
//                 title="Refresh exams"
//               >
//                 <Sliders size={20} />
//                 Refresh
//               </button>
//             </div>
//           </div>

//           {/* Mode specific note */}
//           <div className="text-blue-600 font-medium text-sm bg-blue-50 p-4 rounded-lg">
//             {mode === 'online'
//               ? "Online exams are conducted through the digital platform. Students can take exams remotely."
//               : "Offline exams require physical presence. Don't forget to upload marks after evaluation."
//             }
//           </div>

//           {/* Filters */}
//           {showFilters && (
//             <div className="bg-gray-50 p-4 rounded-lg space-y-4">
//               <div className="flex gap-4 items-center">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="text"
//                     placeholder="Search by exam ID or course code..."
//                     className="w-full pl-10 pr-4 py-2 border rounded-lg"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//                 <div className="relative">
//                   <select
//                     className="appearance-none bg-white border rounded-lg px-4 py-2 pr-10"
//                     value={selectedCourse}
//                     onChange={(e) => setSelectedCourse(e.target.value)}
//                   >
//                     <option value="all">All Courses</option>
//                     {courses.map(course => (
//                       <option key={course.id} value={course.id === 1 ? "BCA12H" : "MCA34P"}>{course.name}</option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Tabs */}
//           <div className="border-b">
//             <div className="flex space-x-8">
//               <button
//                 onClick={() => setActiveTab('all')}
//                 className={`py-2 px-1 ${
//                   activeTab === 'all'
//                     ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 All Exams ({tabCounts.all})
//               </button>
//               <button
//                 onClick={() => setActiveTab('active')}
//                 className={`py-2 px-1 ${
//                   activeTab === 'active'
//                     ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Active ({tabCounts.active})
//               </button>
//               <button
//                 onClick={() => setActiveTab('inactive')}
//                 className={`py-2 px-1 ${
//                   activeTab === 'inactive'
//                     ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
//                     : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Inactive ({tabCounts.inactive})
//               </button>
//             </div>
//           </div>

//           {/* Exams Table */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Exam ID
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Course
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Batch
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Date & Time
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Duration
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Questions
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Total/Passing Marks
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredExams.length > 0 ? (
//                   filteredExams.map((exam) => (
//                     <tr key={exam.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {exam.id}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {exam.courseCode}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {exam.batch}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {exam.examDate}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {exam.examDurationMinutes} mins
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {exam.totalQuestions}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {exam.totalMarks}/{exam.passingMarks}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           getDaysLeft(exam.examDate) === 0 ? 'bg-red-100 text-red-800'  :  'bg-green-100 text-green-800'
//                         }`}>
//                         {getDaysLeft(exam.examDate)} Days Left
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <div className="flex space-x-2">
//                           <button
//                             onClick={() => navigate(`/institute/Exam/EditExam/${exam.id}`)}
//                             className="text-blue-600 hover:text-blue-900"
//                           >
//                             Edit
//                           </button>
//                           {mode === 'offline' && !exam.marksUploaded && (
//                             <button
//                               onClick={() => handleUploadMarks(exam.id)}
//                               className="text-green-600 hover:text-green-900 flex items-center gap-1"
//                             >
//                               <Upload size={16} /> Upload Marks
//                             </button>
//                           )}
//                           {mode === 'offline' && exam.marksUploaded && (
//                             <span className="text-green-600 flex items-center gap-1">
//                               ✓ Marks Uploaded ({exam.results?.length || 0})
//                             </span>
//                           )}
//                           {mode === 'online' && (
//                             <button
//                               onClick={() => navigate(`/institute/Exam/ViewResults/${exam.id}`)}
//                               className="text-purple-600 hover:text-purple-900"
//                             >
//                               View Results ({exam.results?.length || 0})
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
//                       No exams found matching the current filters
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Upload Marks Dialog */}
//         {showUploadDialog && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//             <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
//               <h3 className="text-lg font-medium mb-4">Upload Student Marks</h3>
//               <p className="text-gray-600 mb-4">
//                 Please upload an Excel or CSV file containing student marks for exam: {selectedExam}
//               </p>
//               <div className="mb-6">
//                 <label className="block text-gray-700 mb-2">Select File</label>
//                 <input
//                   type="file"
//                   accept=".xlsx,.xls,.csv"
//                   onChange={handleFileChange}
//                   className="w-full p-2 border rounded-lg"
//                 />
//                 {selectedFile && (
//                   <p className="mt-2 text-sm text-green-600">
//                     Selected: {selectedFile.name}
//                   </p>
//                 )}
//               </div>
//               <div className="flex justify-end gap-4">
//                 <button
//                   onClick={() => {
//                     setShowUploadDialog(false);
//                     setSelectedFile(null);
//                   }}
//                   className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmUpload}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                   disabled={!selectedFile}
//                 >
//                   Upload
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Success Message Toast */}
//         {showSuccessMessage && (
//           <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
//             {successMessage}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ExamManagement;
