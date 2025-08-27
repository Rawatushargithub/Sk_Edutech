import React, { useEffect, useState } from "react";
import axios from "axios";
import { Download, ChevronDown, ChevronRight } from 'lucide-react';
import API_BASE_URL from "../../../config.js";

const ApprovedCertificates = () => {
  const [franchiseId, setFranchiseId] = useState("");
  const [approvedCertificates, setApprovedCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [openCourses, setOpenCourses] = useState({});

  useEffect(() => {
    const id = localStorage.getItem("franchiseID");
    if (id) {
      setFranchiseId(id);
    }
  }, []);

  useEffect(() => {
    if (franchiseId) {
      fetchApprovedCertificates();
    }
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

  const toggleCourse = (courseIdentifier) => {
    setOpenCourses(prev => ({
      ...prev,
      [courseIdentifier]: !prev[courseIdentifier]
    }));
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-6">Approved Certificates</h2>

      <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by Name or Certificate ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-3 rounded-lg shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          <button
            onClick={handleSearch}
            className="bg-slate-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {loading && <p className="text-center text-gray-500 py-8">Loading approved certificates...</p>}

      {!loading && filteredCertificates.length > 0 ? (
        <div className="space-y-8">
          {filteredCertificates.map((cert) => (
            <div key={cert._id} className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
                Franchise: <span className="font-medium">{cert.franchiseId}</span>
              </h3>

              <div className="space-y-4">
                {cert.courses.map((course, i) => {
                  const courseIdentifier = `${cert._id}-${course.courseCode}-${i}`;
                  const isCourseOpen = openCourses[courseIdentifier];
                  return (
                    <div key={courseIdentifier} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCourse(courseIdentifier)}
                        className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none"
                      >
                        <div className="text-left">
                          <h4 className="text-lg font-semibold text-slate-700">
                            {course.courseName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Course Code: {course.courseCode} | Exam: {course.examId}
                          </p>
                        </div>
                        {
                          isCourseOpen ? 
                          <ChevronDown className="w-6 h-6 text-slate-600" /> : 
                          <ChevronRight className="w-6 h-6 text-slate-500" />
                        }
                      </button>

                      {isCourseOpen && (
                        <div className="p-4 bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-4 py-3">Certificate ID</th>
                                  <th scope="col" className="px-4 py-3">Roll No</th>
                                  <th scope="col" className="px-4 py-3">Name</th>
                                  <th scope="col" className="px-4 py-3">Father's Name</th>
                                  <th scope="col" className="px-4 py-3">Institute</th>
                                  <th scope="col" className="px-4 py-3">% Marks</th>
                                  <th scope="col" className="px-4 py-3">Grade</th>
                                  <th scope="col" className="px-4 py-3">Status</th>
                                  <th scope="col" className="px-4 py-3">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {course.results.map((result, ri) => (
                                  <tr key={ri} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{result.certificateId}</td>
                                    <td className="px-4 py-3">{result.rollNumber}</td>
                                    <td className="px-4 py-3">{result.studentName}</td>
                                    <td className="px-4 py-3">{result.fatherName}</td>
                                    <td className="px-4 py-3">{result.instituteName}</td>
                                    <td className="px-4 py-3">{result.percentage}%</td>
                                    <td className="px-4 py-3">{result.grade}</td>
                                    <td className="px-4 py-3 text-green-600 font-semibold">✓ Approved</td>
                                    <td className="px-4 py-3">
                                      <button
                                        className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                                        onClick={() =>
                                          window.open(
                                            `${API_BASE_URL}/api/v1/institute_certificates/download/${encodeURIComponent(result.certificateId)}`,
                                            "_blank"
                                          )
                                        }
                                        aria-label="Download certificate"
                                      >
                                        <Download className="w-4 h-4" />
                                        <span>Download</span>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-10 bg-white rounded-lg shadow p-6">
             <p className="text-gray-500">No approved certificates found.</p>
          </div>
        )
      )}
    </div>
  );
};

export default ApprovedCertificates;