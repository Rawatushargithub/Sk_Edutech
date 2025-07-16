// Import necessary dependencies
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StudentProfile from "./StudentProfile"; // Import the new component
import FormView from "./FormView";
import IdCardView from "./IdCardView";
import SharePopup from "./SharePopup";
import API_BASE_URL from "../../../../config";
import { FaUser } from "react-icons/fa"; // Importing icon for user profile

const StudentAdmissionList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [showIdCardPopup, setShowIdCardPopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusToggleStudent, setStatusToggleStudent] = useState(null);

  // Then modify your useEffect fetch to ensure you're setting an array
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Get franchiseID from localStorage
        const franchiseId = localStorage.getItem('franchiseID');

        const response = await axios.get(
          `${API_BASE_URL}/api/v1/institute_student/get_students?franchiseId=${franchiseId}`
        );
        console.log("students data :: ", response.data);

        // Check if response.data is an array, if not, handle appropriately
        if (Array.isArray(response.data)) {
          setStudents(response.data);
        } else if (response.data && typeof response.data === "object") {
          // If response.data is an object that contains the array (common API pattern)
          // For example, if your API returns {data: [...students]}
          const studentsArray =
            response.data.data || response.data.students || [];
          setStudents(studentsArray);
        } else {
          console.error("Unexpected response format:", response.data);
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      }
    };

    fetchStudents();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  useEffect(() => {
    // Simulate fetching from backend
    console.log("updated Student data :: ", students);
  }, []);

  const totalPages =
    students && students.length
      ? Math.ceil(students.length / entriesPerPage)
      : 0;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = Array.isArray(students)
    ? students.slice(startIndex, startIndex + entriesPerPage)
    : [];

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const previousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Handle status toggle with popup
  const handleStatusToggleClick = (student) => {
    setStatusToggleStudent(student);
    setShowStatusPopup(true);
  };

  // Confirm status toggle
  const confirmStatusToggle = async () => {
    if (!statusToggleStudent) return;

    try {
      const newStatus = !statusToggleStudent.status;
      
      // Update status in backend
      const response = await axios.patch(
        `${API_BASE_URL}/api/v1/institute_student/toggle_status/${statusToggleStudent._id}`,
        { status: newStatus }
      );

      if (response.data.success) {
        // Update status locally
        const updatedStudents = students.map((student) => {
          if (student._id === statusToggleStudent._id) {
            return { ...student, status: newStatus };
          }
          return student;
        });

        setStudents(updatedStudents);
        
        // // Show success message
        // alert(`Student status updated to ${newStatus ? 'Active' : 'Inactive'} successfully!`);
      } else {
        alert('Failed to update student status. Please try again.');
      }
    } catch (error) {
      console.error("Error updating status: ", error);
      alert('Error updating student status. Please try again.');
    }

    // Close popup
    setShowStatusPopup(false);
    setStatusToggleStudent(null);
  };

  // Cancel status toggle
  const cancelStatusToggle = () => {
    setShowStatusPopup(false);
    setStatusToggleStudent(null);
  };

  // Handle showing student profile popup
  const handleViewProfile = (students) => {
    setSelectedStudent(students);
    setShowProfilePopup(true);
  };

  const handleViewForm = () => {
    setShowFormPopup(true);
    console.log("view form is working");
  };

  const handleViewIDCard = () => {
    setShowIdCardPopup(true);
    console.log("view idis working");
  };

  const handleShare = () => {
    console.log("handleshare is working");
    setShowSharePopup(true);
  };

  const closePopup = () => {
    setShowFormPopup(false);
    setShowIdCardPopup(false);
    setShowSharePopup(false);
    setShowProfilePopup(false);
    setSelectedStudent(null);
  };

  const handleEditProfileNavigate = () => {
    // Find selected student
    const studentID = selectedStudent._id;
    const studentToEdit = students.find((s) => s._id === studentID);

    if (studentToEdit) {
      // Store in localStorage for persistence
      localStorage.setItem("editStudentData", JSON.stringify(studentToEdit));
      // Close the profile popup first
      setShowProfilePopup(false);
      setSelectedStudent(null);
      
      // Navigate to edit page with student ID
      navigate(`/institute/edit-student/${studentID}`);
    } else {
      console.error("Student not found with ID:", studentId);
    }
  };

  return (
    <div className="min-h-full bg-blue-50">
      <div className="mx-auto bg-white p-6 rounded-2xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">List Student Admission</h1>
          <div>
            <button
              className="bg-sky-900 text-white px-4 py-2 rounded-md mr-2"
              onClick={() => navigate("/institute/Registration")}
            >
              Add New Student
            </button>
            <button className="bg-sky-900 flex-col text-white font-medium px-4 py-2 rounded-md cursor-pointer">
              Export <span className="text-md ml-1">▲</span>
            </button>
          </div>
        </div>

        <div className="w-full overflow-auto max-h-[550px] border border-gray-300 rounded-md">
          <table className="w-[1400px] border-collapse border-gray-300">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">S/N</th>
                <th className="border border-gray-300 px-4 py-2">Action</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Batch</th>
                <th className="border border-gray-300 px-4 py-2">Student Name</th>
                <th className="border border-gray-300 px-4 py-2">StudentID</th>
                <th className="border border-gray-300 px-4 py-2">
                  Course Name
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Course ID
                </th>
                <th className="border border-gray-300 px-4 py-2">Mobile</th>
                <th className="border border-gray-300 px-4 py-2">
                  Referral Code
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Referral Name
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Admission Date
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((student, index) => (
                <tr key={student._id} className="text-center border w-96">
                  <td className="border border-gray-300 px-4 py-2">
                    {startIndex + index + 1}
                  </td>
                  <td className="border-gray-500 px-4 py-2 flex justify-center gap-2">
                    <button
                      className="bg-sky-800 text-white p-2 rounded-md text-sm font-medium"
                      onClick={() => handleViewProfile(student)}
                    >
                      <FaUser className="w-8 h-8 items-center" />
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button 
                      onClick={() => handleStatusToggleClick(student)}
                      className={`px-2 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                        student.status ? "bg-green-200 text-green-800 hover:bg-green-300" : "bg-red-200 text-red-800 hover:bg-red-300"
                      }`}
                    >
                      {student.status ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.batch}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.studentName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.rollNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.courseInterested.courseName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.courseInterested.courseCode}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.studentMobile}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.referralCode}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.referralName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.admissionDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={previousPage}
            disabled={currentPage === 1}
            className={`p-2 rounded ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Status Toggle Confirmation Popup */}
      {showStatusPopup && statusToggleStudent && (
        <div className="fixed inset-0 bg-grey bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Status Change</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to change the status of{" "}
              <strong>{statusToggleStudent.studentName}</strong> to{" "}
              <strong className={statusToggleStudent.status ? "text-red-600" : "text-green-600"}>
                {statusToggleStudent.status ? "Inactive" : "Active"}
              </strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelStatusToggle}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusToggle}
                className={`px-4 py-2 rounded text-white transition-colors ${
                  statusToggleStudent.status
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {statusToggleStudent.status ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Popup */}
      {showProfilePopup && selectedStudent && (
        <StudentProfile
          student={selectedStudent}
          onClose={closePopup}
          onViewForm={handleViewForm}
          onViewIDCard={handleViewIDCard}
          onShare={handleShare}
          onEdit={handleEditProfileNavigate}
        />
      )}

      {showFormPopup && (
        <FormView student={selectedStudent} onClose={closePopup} />
      )}
      {showIdCardPopup && (
        <IdCardView student={selectedStudent} onClose={closePopup} />
      )}
      {showSharePopup && (
        <SharePopup student={selectedStudent} onClose={closePopup} />
      )}
    </div>
  );
};

export default StudentAdmissionList;

