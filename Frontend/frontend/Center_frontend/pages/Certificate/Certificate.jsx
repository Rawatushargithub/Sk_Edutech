import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config.js";

const CertificateRequest = () => {
  const [franchiseId, setFranchiseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState("");
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [approvedCertificates, setApprovedCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("request"); // "request" or "approved"

  useEffect(() => {
    const id = localStorage.getItem("franchiseID");
    if (id) setFranchiseId(id);
  }, []);

  useEffect(() => {
    if (franchiseId) fetchCourses();
  }, [franchiseId]);

  useEffect(() => {
    if (franchiseId && selectedCourseCode) fetchExamsByCourse();
  }, [franchiseId, selectedCourseCode]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/institute_certificates/courses/by-franchise/${franchiseId}`
      );
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching courses", err);
    }
  };

  const fetchExamsByCourse = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/institute_certificates/exams/by-course/${franchiseId}/${selectedCourseCode}`
      );
      setExams(Array.isArray(res.data) ? res.data : []);
      setSelectedExamId(""); // Reset exam selection when course changes
      setStudentResults([]); // Clear previous results
    } catch (err) {
      console.error("Error fetching exams by course", err);
    }
  };

  const fetchResults = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/institute_certificates/certificates/fetch?franchiseId=${franchiseId}&examId=${selectedExamId}`
      );
      const resultData = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setStudentResults(resultData);
      console.log("Fetched Results:", resultData);
    } catch (err) {
      console.error("Error fetching results", err);
      alert("Error fetching student results");
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedCertificates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/institute_certificates/certificates/approved?franchiseId=${franchiseId}`
      );
      setApprovedCertificates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching approved certificates", err);
      alert("Error fetching approved certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCertificate = async () => {
    if (requestLoading) return;
    
    try {
      setRequestLoading(true);
      console.log("Request Body:", studentResults);

      const courseCode = studentResults[0]?.courseCode;
      if (!courseCode) {
        alert("Course code not found");
        return;
      }

      // Only request for students who haven't been requested yet
      const studentsToRequest = studentResults.filter(
        (r) => r.requestedStatus !== "requested" && !r.isApproved
      );

      if (studentsToRequest.length === 0) {
        alert("No students available to request certificates for");
        return;
      }

      const body = {
        franchiseId,
        courseCode,
        examId: selectedExamId,
        results: studentsToRequest.map((r) => ({
          ...r,
          requestedStatus: "requested",
          isApproved: false,
        })),
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/institute_certificates/certificates/request`,
        body
      );

      if (response.data.success) {
        alert("Certificate requested successfully");
        
        // Update the local state
        const updated = studentResults.map((r) => {
          if (studentsToRequest.some(s => s.rollNumber === r.rollNumber)) {
            return {
              ...r,
              requestedStatus: "requested",
              isApproved: false,
            };
          }
          return r;
        });
        setStudentResults(updated);
      }
    } catch (err) {
      console.error("Certificate request error:", err);
      alert("Certificate request failed: " + (err.response?.data?.message || err.message));
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSingleRequest = async (index) => {
    if (requestLoading) return;
    
    try {
      setRequestLoading(true);
      const student = studentResults[index];
      const courseCode = studentResults[0]?.courseCode;

      if (!courseCode) {
        alert("Course code not found");
        return;
      }

      const body = {
        franchiseId,
        courseCode,
        examId: selectedExamId,
        results: [
          {
            ...student,
            requestedStatus: "requested",
            isApproved: false,
          },
        ],
      };

      console.log("Single Request Body:", body);
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/institute_certificates/certificates/request`,
        body
      );

      if (response.data.success) {
        alert("Certificate requested successfully");
        
        // Update the local state
        const updatedResults = [...studentResults];
        updatedResults[index] = {
          ...updatedResults[index],
          requestedStatus: "requested",
          isApproved: false,
        };
        setStudentResults(updatedResults);
      }
    } catch (err) {
      console.error("Single request failed:", err);
      alert("Failed to request certificate: " + (err.response?.data?.message || err.message));
    } finally {
      setRequestLoading(false);
    }
  };

  const getStatusDisplay = (student) => {
    if (student.isApproved || student.requestedStatus === "approved") {
      return <span className="text-green-600 font-semibold">Approved by Admin</span>;
    } else if (student.requestedStatus === "requested") {
      return <span className="text-yellow-600 font-semibold">Requested</span>;
    } else {
      return (
        <button
          onClick={() => handleSingleRequest(studentResults.indexOf(student))}
          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
          disabled={requestLoading}
        >
          {requestLoading ? "Requesting..." : "Request Certificate"}
        </button>
      );
    }
  };

  const canRequestAll = () => {
    return studentResults.some(
      (s) => s.requestedStatus !== "requested" && !s.isApproved
    );
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "approved") {
      fetchApprovedCertificates();
    }
  };

  const renderRequestTab = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Request Certificate</h2>

      <div className="mb-4">
        <label className="block mb-2">Select Course:</label>
        <select
          value={selectedCourseCode}
          onChange={(e) => setSelectedCourseCode(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">-- Select Course --</option>
          {Array.isArray(courses) &&
            courses.map((course) => (
              <option key={course.courseCode} value={course.courseCode}>
                {course.courseCode} - {course.courseName}
              </option>
            ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Select Exam:</label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          disabled={!selectedCourseCode}
        >
          <option value="">-- Select Exam --</option>
          {Array.isArray(exams) &&
            exams.map((exam) => (
              <option key={exam._id} value={exam.ExamID}>
                {exam.ExamID} ({exam.courseCode})
              </option>
            ))}
        </select>
      </div>

      <button
        onClick={fetchResults}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading || !selectedExamId}
      >
        {loading ? "Loading..." : "Load Student Results"}
      </button>

      {loading && <p className="mt-4">Loading results...</p>}

      {studentResults.length > 0 && (
        <>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">Roll No</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Father</th>
                  <th className="border px-4 py-2">Institute</th>
                  <th className="border px-4 py-2">% Marks</th>
                  <th className="border px-4 py-2">Grade</th>
                  <th className="border px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {studentResults.map((s, index) => (
                  <tr key={s.rollNumber}>
                    <td className="border px-4 py-2">{s.rollNumber}</td>
                    <td className="border px-4 py-2">{s.studentName}</td>
                    <td className="border px-4 py-2">{s.fatherName}</td>
                    <td className="border px-4 py-2">{s.instituteName}</td>
                    <td className="border px-4 py-2">{s.percentage}%</td>
                    <td className="border px-4 py-2">{s.grade}</td>
                    <td className="border px-4 py-2">
                      {getStatusDisplay(s)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            {canRequestAll() ? (
              <button
                onClick={handleRequestCertificate}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                disabled={requestLoading}
              >
                {requestLoading ? "Requesting..." : "Request All Certificates"}
              </button>
            ) : (
              <p className="text-yellow-600 font-semibold">
                All certificates have been requested or approved.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderApprovedTab = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Approved Certificates</h2>

      {loading && <p className="mt-4">Loading approved certificates...</p>}

      {approvedCertificates.length > 0 ? (
        <div className="space-y-6">
          {approvedCertificates.map((cert, certIndex) => (
            <div key={cert._id} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">
                Franchise ID: {cert.franchiseId}
              </h3>
              
              {cert.courses.map((course, courseIndex) => (
                <div key={courseIndex} className="mb-4">
                  <h4 className="text-md font-medium mb-2 text-blue-600">
                    Course: {course.courseCode} - {course.courseName} (Exam: {course.examId})
                  </h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border">
                      <thead>
                        <tr className="bg-green-100">
                          <th className="border px-4 py-2">Certificate ID</th>
                          <th className="border px-4 py-2">Roll No</th>
                          <th className="border px-4 py-2">Name</th>
                          <th className="border px-4 py-2">Father</th>
                          <th className="border px-4 py-2">Institute</th>
                          <th className="border px-4 py-2">% Marks</th>
                          <th className="border px-4 py-2">Grade</th>
                          <th className="border px-4 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.results.map((result, resultIndex) => (
                          <tr key={resultIndex}>
                            <td className="border px-4 py-2">{result.certificateId}</td>
                            <td className="border px-4 py-2">{result.rollNumber}</td>
                            <td className="border px-4 py-2">{result.studentName}</td>
                            <td className="border px-4 py-2">{result.fatherName}</td>
                            <td className="border px-4 py-2">{result.instituteName}</td>
                            <td className="border px-4 py-2">{result.percentage}%</td>
                            <td className="border px-4 py-2">{result.grade}</td>
                            <td className="border px-4 py-2">
                              <span className="text-green-600 font-semibold">
                                ✓ Approved
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-gray-600">No approved certificates found.</p>
        )
      )}
    </div>
  );

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => handleTabChange("request")}
          className={`px-4 py-2 font-medium ${
            activeTab === "request"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Request Certificate
        </button>
        <button
          onClick={() => handleTabChange("approved")}
          className={`px-4 py-2 font-medium ${
            activeTab === "approved"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Approved Certificates
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "request" ? renderRequestTab() : renderApprovedTab()}
    </div>
  );
};

export default CertificateRequest;
