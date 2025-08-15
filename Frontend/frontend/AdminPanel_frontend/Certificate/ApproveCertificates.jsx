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
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

  const isDateInRange = (date, timeFilter, startDate, endDate) => {
    if (!date) return true;

    const itemDate = new Date(date);
    if (isNaN(itemDate.getTime())) return false;

    if (timeFilter === 'all') {
      return true;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (timeFilter) {
      case 'today':
        return itemDate >= today;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return itemDate >= yesterday && itemDate < today;
      case 'last7days':
        const last7days = new Date(today);
        last7days.setDate(today.getDate() - 7);
        return itemDate >= last7days;
      case 'last30days':
        const last30days = new Date(today);
        last30days.setDate(today.getDate() - 30);
        return itemDate >= last30days;
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return itemDate >= start && itemDate <= end;
        }
        return true;
      default:
        return true;
    }
  };

  const filteredCertificates = certificates.map(cert => ({
    ...cert,
    courses: cert.courses.map(course => ({
        ...course,
        results: course.results.filter(r => {
            const searchLower = searchQuery.toLowerCase();
            // TODO: Replace 'r.approvedAt' with the actual date field for time filtering
            const matchesTime = isDateInRange(r.approvedAt, timeFilter, startDate, endDate);
            const matchesSearch = !searchQuery || (
                r.rollNumber?.toLowerCase().includes(searchLower) ||
                r.studentName?.toLowerCase().includes(searchLower) ||
                r.fatherName?.toLowerCase().includes(searchLower) ||
                r.instituteName?.toLowerCase().includes(searchLower) ||
                r.certificateId?.toLowerCase().includes(searchLower) ||
                r.grade?.toLowerCase().includes(searchLower)
            );
            return matchesSearch && matchesTime;
        })
    })).filter(course => course.results.length > 0)
})).filter(cert => cert.courses.length > 0);

  const navigateToRequested = () => {
    navigate('/admin/Certificates');
  };

  const getTotalApprovedCount = () => {
    return filteredCertificates.reduce((total, cert) => {
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
        <div className="flex items-end gap-4 flex-wrap">
          <label className="font-medium">Filter by Franchise:</label>
          <select
            value={selectedFranchise}
            onChange={(e) => handleFranchiseFilter(e.target.value)}
            className="border px-3 py-2 rounded-md w-56"
          >
            <option value="">All Franchises</option>
            {franchises.map((franchise) => (
              <option key={franchise.franchiseId} value={franchise.franchiseId}>
                {franchise.franchiseName} ({franchise.franchiseId})
              </option>
            ))}
          </select>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Filter by Time:</label>
            <div className="flex items-center gap-4">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
              {timeFilter === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Search:</label>
            <input
              type="text"
              className="px-3 py-2 border rounded-md w-56"
              placeholder="Name, roll no, cert ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ml-auto">
            <span className="text-sm text-gray-600">
              Total Approved: <span className="font-semibold text-green-600">{getTotalApprovedCount()}</span>
            </span>
          </div>
        </div>
      </div>

      {loading && <p className="text-center py-4">Loading certificates...</p>}

      {!loading && filteredCertificates.length === 0 ? (
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
          {filteredCertificates.map((cert, idx) => (
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
          `${API_BASE_URL}/api/v1/institute_certificates/download/${r.certificateId}`,
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