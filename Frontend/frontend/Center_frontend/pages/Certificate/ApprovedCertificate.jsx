import React, { useEffect, useState } from "react";
import axios from "axios";
import { Download } from 'lucide-react';
import API_BASE_URL from "../../../config.js";

const ApprovedCertificates = () => {
  const [franchiseId, setFranchiseId] = useState("");
  const [approvedCertificates, setApprovedCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [certificateId, setCertificateId] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("franchiseID");
    if (id) {
      setFranchiseId(id);
    }
  }, []);

  useEffect(() => {
    if (franchiseId) fetchApprovedCertificates();
  }, [franchiseId]);

  const fetchApprovedCertificates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/institute_certificates/certificates/approved?franchiseId=${franchiseId}`
      );
      const data = Array.isArray(res.data) ? res.data : [];
      setApprovedCertificates(data);
      setFilteredCertificates(data);
      console.log("Approved Certificates:", data);
    } catch (err) {
      console.error("Error fetching approved certificates", err);
      alert("Error fetching approved certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setFilteredCertificates(approvedCertificates);
      return;
    }

    const filtered = approvedCertificates.map((cert) => {
      const filteredCourses = cert.courses.map((course) => {
        const filteredResults = course.results.filter((result) => {
          return (
            // setCertificateId(result.certificateId) ||
            result.certificateId?.toLowerCase().includes(query) ||
            result.studentName?.toLowerCase().includes(query)
          );
        });
        return { ...course, results: filteredResults };
      }).filter((course) => course.results.length > 0);

      return { ...cert, courses: filteredCourses };
    }).filter((cert) => cert.courses.length > 0);

    setFilteredCertificates(filtered);
  };

  // console.log("ID :" , result.certificateId);
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Approved Certificates</h2>

      <div className="flex mb-6">
        <input
          type="text"
          placeholder="Search by Name or Certificate ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-4 py-2 rounded-l w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading approved certificates...</p>}

      {filteredCertificates.length > 0 ? (
        <div className="space-y-6">
          {filteredCertificates.map((cert) => (
            <div key={cert._id} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">
                Franchise ID: {cert.franchiseId}
              </h3>

              {cert.courses.map((course, i) => (
                <div key={i} className="mb-4">
                  <h4 className="text-md font-medium mb-2 text-blue-600">
                    Course: {course.courseCode} - {course.courseName} (Exam: {course.examId})
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead>
                        <tr className="bg-green-100">
                          <th className="border px-3 py-2">Certificate ID</th>
                          <th className="border px-3 py-2">Roll No</th>
                          <th className="border px-3 py-2">Name</th>
                          <th className="border px-3 py-2">Father</th>
                          <th className="border px-3 py-2">Institute</th>
                          <th className="border px-3 py-2">% Marks</th>
                          <th className="border px-3 py-2">Grade</th>
                          <th className="border px-3 py-2">Status</th>
                          <th className="border px-3 py-2">Action</th>

                        </tr>
                      </thead>
                      <tbody>
                        {course.results.map((result, ri) => (
                          <tr key={ri}>
                            <td className="border px-3 py-2">{result.certificateId}</td>
                            <td className="border px-3 py-2">{result.rollNumber}</td>
                            <td className="border px-3 py-2">{result.studentName}</td>
                            <td className="border px-3 py-2">{result.fatherName}</td>
                            <td className="border px-3 py-2">{result.instituteName}</td>
                            <td className="border px-3 py-2">{result.percentage}%</td>
                            <td className="border px-3 py-2">{result.grade}</td>
                            <td className="border px-3 py-2 text-green-700 font-semibold">✓ Approved</td>
                            <td className="border px-3 py-2">
                              <button
                                className="flex items-center justify-center gap-2 rounded-lg border-2 border-blue-900 bg-blue-900 px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                                onClick={() =>
                                  window.open(
                                    `${API_BASE_URL}/api/v1/institute_certificates/download/${result.certificateId}`,
                                    "_blank"
                                  )
                                }
                                aria-label="Download certificate"
                              >
                                <Download className="w-4 h-4" />
                                Download
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
      ) : (
        !loading && (
          <p className="text-gray-600">No approved certificates found.</p>
        )
      )}
    </div>
  );
};

export default ApprovedCertificates;