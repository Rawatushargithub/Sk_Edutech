import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../config";

const MarksheetApproval = () => {
  const [marksheets, setMarksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedFranchise, setSelectedFranchise] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("all"); // all, approved, pending, rejected
  const [searchStudentName, setSearchStudentName] = useState("");

  useEffect(() => {
    fetchMarksheets();
  }, []);

  // ✅ Fetch all marksheets
  const fetchMarksheets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/marksheet/marksheetlist`
      );
      setMarksheets(res.data);
    } catch (err) {
      toast.error("Failed to fetch marksheets");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update status
  const handleUpdateStatus = async (
    marksheetId,
    courseCode,
    studentId,
    approvalStatus
  ) => {
    try {
      const body =
        approvalStatus === "rejected"
          ? { approvalStatus, rejectionReason }
          : { approvalStatus };

      const res = await axios.put(
        `${API_BASE_URL}/api/v1/marksheet/adminside/${marksheetId}/${courseCode}/${studentId}`,
        body
      );

      toast.success(res.data.message);
      fetchMarksheets();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // ✅ Download Marksheet
  const handleDownload = async (franchiseId, rollNumber) => {
    try {
      setLoading(true); // Add loading state if you want

      const res = await axios.get(
        `${API_BASE_URL}/api/v1/marksheet/download?franchiseId=${encodeURIComponent(
          franchiseId
        )}&rollNumber=${encodeURIComponent(rollNumber)}`,
        {
          responseType: "blob",
          timeout: 30000, // 30 second timeout
        }
      );

      if (
        res.data.type === "application/pdf" ||
        res.headers["content-type"]?.includes("pdf")
      ) {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${rollNumber}_marksheet.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => window.URL.revokeObjectURL(url), 1000);

        toast.success("Marksheet downloaded successfully!");
      } else {
        const errorText = await new Blob([res.data]).text();
        const errorData = JSON.parse(errorText);
        toast.error(errorData.message || "Failed to download marksheet");
      }
    } catch (err) {
      console.error("Download error:", err);
      if (err.code === "ECONNABORTED") {
        toast.error("Download timeout - please try again");
      } else if (err.response?.status === 404) {
        toast.error("Marksheet not found or not approved");
      } else if (err.response?.status === 400) {
        toast.error("Invalid franchise ID or roll number");
      } else {
        toast.error("Failed to download marksheet");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Collect unique franchiseIds and courseCodes
  const franchiseOptions = ["all", ...new Set(marksheets.map((m) => m.franchiseId))];

  const courseOptions = [
    "all",
    ...new Set(
      marksheets.flatMap((m) => m.courses.map((c) => c.courseCode))
    ),
  ];

  if (loading) return <p className="text-center py-4">Loading...</p>;

  return (
    <div className="p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Marksheet Approvals</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Franchise</label>
          <select
            className="border px-3 py-2 rounded"
            value={selectedFranchise}
            onChange={(e) => setSelectedFranchise(e.target.value)}
          >
            {franchiseOptions.map((id) => (
              <option key={id} value={id}>
                {id === "all" ? "All Franchises" : id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Course</label>
          <select
            className="border px-3 py-2 rounded"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courseOptions.map((code) => (
              <option key={code} value={code}>
                {code === "all" ? "All Courses" : code}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Student Name</label>
          <input
            type="text"
            className="border px-3 py-2 rounded"
            placeholder="Search by student name"
            value={searchStudentName}
            onChange={(e) => setSearchStudentName(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["all", "approved", "pending", "rejected"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Filter + Tab + Search applied data */}
      {marksheets
        .filter(
          (m) =>
            selectedFranchise === "all" || m.franchiseId === selectedFranchise
        )
        .map((marksheet) => (
          <div
            key={marksheet._id}
            className="border rounded-xl p-4 mb-6 shadow-md"
          >
            <h2 className="text-xl font-semibold mb-2">
              Franchise: {marksheet.franchiseId}
            </h2>

            {marksheet.courses
              .filter(
                (c) => selectedCourse === "all" || c.courseCode === selectedCourse
              )
              .map((course) => {
                const filteredStudents = course.students.filter((s) => {
                  const matchesStatus =
                    activeTab === "all" ? true : s.approvalStatus === activeTab;
                  const matchesSearch = s.studentName
                    .toLowerCase()
                    .includes(searchStudentName.toLowerCase());
                  return matchesStatus && matchesSearch;
                });

                return (
                  <div key={course.courseCode} className="mb-4">
                    <h3 className="text-lg font-medium mb-2">
                      {course.courseName} ({course.courseCode})
                    </h3>

                    <table className="w-full border-collapse border">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border px-2 py-1">Name</th>
                          <th className="border px-2 py-1">Roll No</th>
                          <th className="border px-2 py-1">Total</th>
                          <th className="border px-2 py-1">Grade</th>
                          <th className="border px-2 py-1">Status</th>
                          <th className="border px-2 py-1">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student._id}>
                            <td className="border px-2 py-1">{student.studentName}</td>
                            <td className="border px-2 py-1">{student.rollNumber}</td>
                            <td className="border px-2 py-1">{student.overallTotalMarks}</td>
                            <td className="border px-2 py-1">{student.overallGrade}</td>
                            <td className="border px-2 py-1">
                              <span
                                className={`px-2 py-1 rounded text-white text-sm ${
                                  student.approvalStatus === "approved"
                                    ? "bg-green-500"
                                    : student.approvalStatus === "rejected"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                                }`}
                              >
                                {student.approvalStatus}
                              </span>
                            </td>
                            <td className="border px-2 py-1 flex gap-2">
                              <button
                                className="bg-green-500 text-white px-2 py-1 rounded"
                                onClick={() =>
                                  handleUpdateStatus(
                                    marksheet._id,
                                    course.courseCode,
                                    student._id,
                                    "approved"
                                  )
                                }
                              >
                                Approve
                              </button>

                              <button
                                className="bg-yellow-500 text-white px-2 py-1 rounded"
                                onClick={() =>
                                  handleUpdateStatus(
                                    marksheet._id,
                                    course.courseCode,
                                    student._id,
                                    "pending"
                                  )
                                }
                              >
                                Pending
                              </button>

                              <button
                                className="bg-red-500 text-white px-2 py-1 rounded"
                                onClick={() => {
                                  const reason = prompt(
                                    "Enter rejection reason:",
                                    "Not eligible"
                                  );
                                  if (reason) {
                                    setRejectionReason(reason);
                                    handleUpdateStatus(
                                      marksheet._id,
                                      course.courseCode,
                                      student._id,
                                      "rejected"
                                    );
                                  }
                                }}
                              >
                                Reject
                              </button>

                              {student.approvalStatus === "approved" && (
                                <button
                                  className="bg-blue-500 text-white px-2 py-1 rounded"
                                  onClick={() =>
                                    handleDownload(marksheet.franchiseId, student.rollNumber)
                                  }
                                >
                                  Download
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
          </div>
        ))}
    </div>
  );
};

export default MarksheetApproval;
