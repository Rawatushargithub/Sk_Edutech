// src/pages/RequestedCertificates.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config.js";

const RequestedCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [selectedFranchise, setSelectedFranchise] = useState("");
  const [loading, setLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveFranchises();
    fetchRequestedCertificates();
  }, []);

  const fetchActiveFranchises = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/institute_certificates/franchises/active`);
      setFranchises(res.data || []);
    } catch (err) {
      console.error("Error fetching franchises", err);
    }
  };

  const fetchRequestedCertificates = async (franchiseId = "") => {
    setLoading(true);
    try {
      const url = franchiseId 
        ? `${API_BASE_URL}/api/v1/institute_certificates/certificates/requested?franchiseId=${franchiseId}`
        : `${API_BASE_URL}/api/v1/institute_certificates/certificates/requested`;
      
      const res = await axios.get(url);
      setCertificates(res.data || []);
      console.log("Requested certificates:", res.data);
    } catch (err) {
      console.error("Error fetching requested certificates", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFranchiseFilter = (franchiseId) => {
    setSelectedFranchise(franchiseId);
    fetchRequestedCertificates(franchiseId);
  };

  const handleStudentApprove = async (franchiseId, courseCode, examId, rollNumber) => {
    if (approveLoading) return;
    
    setApproveLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/institute_certificates/certificates/approve/student`, {
        franchiseId,
        courseCode,
        examId,
        rollNumber,
      });
      
      if (response.data.success) {
        alert("Student certificate approved successfully");
        fetchRequestedCertificates(selectedFranchise);
      }
    } catch (err) {
      console.error("Error approving student certificate", err);
      alert("Approval failed: " + (err.response?.data?.message || err.message));
    } finally {
      setApproveLoading(false);
    }
  };

  const navigateToApproved = () => {
    navigate('/admin/approved-certificates');
  };

  const getTotalRequestedCount = () => {
    return certificates.reduce((total, cert) => {
      return total + cert.courses.reduce((courseTotal, course) => {
        return courseTotal + course.results.length;
      }, 0);
    }, 0);
  };

  const getFranchiseName = (franchiseId) => {
    const franchise = franchises.find(f => f.franchiseId === franchiseId);
    return franchise ? franchise.franchiseName : franchiseId;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Requested Certificates (Admin View)</h2>
        <button
          onClick={navigateToApproved}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          View Approved Certificates
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <label className="font-medium">Filter by Franchise:</label>
          <select
            value={selectedFranchise}
            onChange={(e) => handleFranchiseFilter(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            <option value="">All Franchises</option>
            {franchises.map((franchise) => (
              <option key={franchise.franchiseId} value={franchise.franchiseId}>
                {franchise.franchiseName} ({franchise.franchiseId})
              </option>
            ))}
          </select>
          <div className="ml-auto">
            <span className="text-sm text-gray-600">
              Total Requested: <span className="font-semibold">{getTotalRequestedCount()}</span>
            </span>
          </div>
        </div>
      </div>

      {loading && <p className="text-center py-4">Loading certificates...</p>}

      {!loading && certificates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No requested certificates found.</p>
          {selectedFranchise && (
            <p className="text-sm text-gray-400 mt-2">
              Try selecting a different franchise or view all franchises.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {certificates.map((cert, idx) => (
            <div key={idx} className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-blue-600">
                Franchise: {getFranchiseName(cert.franchiseId)}
              </h3>
              {cert.courses.map((course, i) => (
                <div key={i} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700">
                      {course.courseName} ({course.courseCode}) - Exam ID: {course.examId}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {course.results.length} student(s) pending approval
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border px-2 py-1">Roll No</th>
                          <th className="border px-2 py-1">Name</th>
                          <th className="border px-2 py-1">Father</th>
                          <th className="border px-2 py-1">Institute</th>
                          <th className="border px-2 py-1">% Marks</th>
                          <th className="border px-2 py-1">Grade</th>
                          <th className="border px-2 py-1">Session</th>
                          <th className="border px-2 py-1">Status</th>
                          <th className="border px-2 py-1">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.results.map((r, j) => (
                          <tr key={j} className="hover:bg-gray-50">
                            <td className="border px-2 py-1">{r.rollNumber}</td>
                            <td className="border px-2 py-1">{r.studentName}</td>
                            <td className="border px-2 py-1">{r.fatherName}</td>
                            <td className="border px-2 py-1">{r.instituteName}</td>
                            <td className="border px-2 py-1">{r.percentage}%</td>
                            <td className="border px-2 py-1">{r.grade}</td>
                            <td className="border px-2 py-1">{r.session}</td>
                            <td className="border px-2 py-1 text-center">
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                Requested
                              </span>
                            </td>
                            <td className="border px-2 py-1 text-center">
                              <button
                                onClick={() =>
                                  handleStudentApprove(
                                    cert.franchiseId,
                                    course.courseCode,
                                    course.examId,
                                    r.rollNumber
                                  )
                                }
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                                disabled={approveLoading}
                              >
                                {approveLoading ? "Approving..." : "Approve"}
                              </button>
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
      )}
    </div>
  );
};

export default RequestedCertificates;