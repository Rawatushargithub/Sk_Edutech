// src/pages/ApprovedCertificates.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";

const ApprovedCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [selectedFranchise, setSelectedFranchise] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveFranchises();
    fetchApprovedCertificates();
  }, []);

  const fetchActiveFranchises = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/institute_certificates/franchises/active`);
      setFranchises(res.data || []);
    } catch (err) {
      console.error("Error fetching franchises", err);
    }
  };

  const fetchApprovedCertificates = async (franchiseId = "") => {
    setLoading(true);
    try {
      const url = franchiseId
        ? `${API_BASE_URL}/api/v1/institute_certificates/certificates/approved?franchiseId=${franchiseId}`
        : `${API_BASE_URL}/api/v1/institute_certificates/certificates/approved`;

      const res = await axios.get(url);
      setCertificates(res.data || []);
      console.log("Approved certificates:", res.data);
    } catch (err) {
      console.error("Error fetching approved certificates", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFranchiseFilter = (franchiseId) => {
    setSelectedFranchise(franchiseId);
    fetchApprovedCertificates(franchiseId);
  };

  const navigateToRequested = () => {
    navigate('/admin/Certificates');
  };

  const getTotalApprovedCount = () => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownloadCertificate = (student) => {
    // This function can be implemented to generate/download certificate
    console.log("Download certificate for:", student);
    alert(`Download certificate for ${student.studentName} (${student.rollNumber})`);
  };

  const handlePrintCertificate = (student) => {
    // This function can be implemented to print certificate
    console.log("Print certificate for:", student);
    alert(`Print certificate for ${student.studentName} (${student.rollNumber})`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Approved Certificates (Admin View)</h2>
        <button
          onClick={navigateToRequested}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
        >
          View Requested Certificates
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
              Total Approved: <span className="font-semibold text-green-600">{getTotalApprovedCount()}</span>
            </span>
          </div>
        </div>
      </div>

      {loading && <p className="text-center py-4">Loading certificates...</p>}

      {!loading && certificates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No approved certificates found.</p>
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
              <h3 className="text-lg font-semibold mb-2 text-green-600">
                Franchise: {getFranchiseName(cert.franchiseId)}
              </h3>
              {cert.courses.map((course, i) => (
                <div key={i} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700">
                      {course.courseName} ({course.courseCode}) - Exam ID: {course.examId}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {course.results.length} approved certificate(s)
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
                          <th className="border px-2 py-1">Certificate ID</th>
                          <th className="border px-2 py-1">Grade</th>
                          <th className="border px-2 py-1">Session</th>
                          <th className="border px-2 py-1">Status</th>
                          {/* <th className="border px-2 py-1">Actions</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {course.results.map((r, j) => (
                          <tr key={j} className="hover:bg-gray-50">
                            <td className="border px-2 py-1">{r.rollNumber}</td>
                            <td className="border px-2 py-1">{r.studentName}</td>
                            <td className="border px-2 py-1">{r.fatherName}</td>
                            <td className="border px-2 py-1">{r.instituteName}</td>
                            <td className="border px-2 py-1">{r.certificateId}</td>
                            <td className="border px-2 py-1">{r.grade}</td>
                            <td className="border px-2 py-1">{r.session}</td>
                            <td className="border px-2 py-1 text-center">
  <div className="flex flex-col items-center justify-center gap-2">
    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
      Approved
    </span>

    <button
      type="button"
      className="flex items-center justify-center gap-1 rounded-md border border-blue-900 bg-blue-900 px-3 py-1 text-xs text-white hover:bg-blue-800 transition-colors"
      onClick={() =>
        window.open(
          `${API_BASE_URL}/api/v1/institute_certificates/download/${encodeURIComponent(r.certificateId)}`,
          "_blank"
        )
      }
      aria-label="Download certificate"
    >
      <Download className="w-4 h-4" />
      <span>Download</span>
    </button>
  </div>
</td>


                            {/* <td className="border px-2 py-1 text-center">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleDownloadCertificate(r)}
                                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                                  title="Download Certificate"
                                >
                                  Download
                                </button>
                                <button
                                  onClick={() => handlePrintCertificate(r)}
                                  className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                                  title="Print Certificate"
                                >
                                  Print
                                </button>
                              </div>
                            </td> */}
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

export default ApprovedCertificates;