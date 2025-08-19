import React, { useState, useEffect } from "react";
import { FaTrash, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentEnquiry = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const franchiseId = localStorage.getItem("franchiseID");
        const response = await axios.get(`${API_BASE_URL}/api/v1/institute_enquiry?franchiseId=${franchiseId}`);
        setStudents(response.data.data);
      } catch (error) {
        console.error("Error fetching enquiries:", error);
        toast.error("Failed to fetch enquiries");
      }
    };
    fetchEnquiries();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      try {
        const franchiseId = localStorage.getItem("franchiseID");
        await axios.delete(`${API_BASE_URL}/api/v1/institute_enquiry/${id}?franchiseId=${franchiseId}`);
        setStudents(students.filter((student) => student._id !== id));
        toast.success("Enquiry deleted successfully");
      } catch (error) {
        console.error("Error deleting enquiry:", error);
        toast.error("Failed to delete enquiry");
      }
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
  };

  const formatDOB = (dob) => {
    if (!dob) return "N/A";
    const date = new Date(dob);
    return date.toLocaleDateString("en-GB");
  };

  const filteredStudents = students.filter(student =>
    Object.values(student).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#457B9D]">Student Enquiry List</h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-64 px-3 py-2 border rounded-md"
            />
            <button className="px-4 py-2 bg-[#457B9D] text-white rounded-md">Search</button>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Total Enquiries: {filteredStudents.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y">
            <thead className="bg-[#457B9D]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">DOB</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{student.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.studentMobile}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDOB(student.dob)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button onClick={() => handleViewDetails(student)} className="text-blue-500 hover:text-blue-700"><FaEye /></button>
                      <button onClick={() => handleDelete(student._id)} className="text-red-500 hover:text-red-70al"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedStudent && (
          <div className="mt-8 p-6 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-bold mb-4">Full Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><p><strong>Name:</strong> {selectedStudent.studentName}</p></div>
              <div><p><strong>Email:</strong> {selectedStudent.email}</p></div>
              <div><p><strong>Phone:</strong> {selectedStudent.studentMobile}</p></div>
              <div><p><strong>Date of Birth:</strong> {formatDOB(selectedStudent.dob)}</p></div>
              <div><p><strong>Gender:</strong> {selectedStudent.gender}</p></div>
              <div><p><strong>City:</strong> {selectedStudent.city}</p></div>
              <div><p><strong>Permanent Address:</strong> {selectedStudent.permanentAddress}</p></div>
              <div><p><strong>Enquiry Date:</strong> {formatDOB(selectedStudent.enquiryDate)}</p></div>
              <div><p><strong>Course Interested:</strong> {selectedStudent.courseInterested.courseName}</p></div>
              <div><p><strong>Total Fees:</strong> {selectedStudent.totalFees}</p></div>
              <div><p><strong>Fees Received:</strong> {selectedStudent.feesReceived}</p></div>
              <div><p><strong>Balance:</strong> {selectedStudent.balance}</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEnquiry;
