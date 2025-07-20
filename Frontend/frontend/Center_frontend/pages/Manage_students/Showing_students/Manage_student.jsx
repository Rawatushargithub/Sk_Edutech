// Updated StudentAdmissionList component with corrected field mappings

// First, install these packages:
// npm install xlsx jspdf jspdf-autotable

// Import necessary dependencies
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StudentProfile from "./StudentProfile";
import FormView from "./FormView";
import IdCardView from "./IdCardView";
import SharePopup from "./SharePopup";
import API_BASE_URL from "../../../../config";
import { FaUser } from "react-icons/fa";
// Import for Excel export
import * as XLSX from 'xlsx';
// Import for PDF export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import autoTable separately

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
  
  // New state for export dropdown
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  // State for detailed students data
  const [detailedStudents, setDetailedStudents] = useState([]);

  // Function to fetch detailed student data
  const fetchDetailedStudentData = async (studentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/institute_student/get_student/${studentId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching detailed data for student ${studentId}:`, error);
      return null;
    }
  };

  // Function to fetch all detailed student data
  const fetchAllDetailedData = async () => {
    try {
      const detailedData = await Promise.all(
        students.map(async (student) => {
          const detailedStudent = await fetchDetailedStudentData(student._id);
          return detailedStudent || student; // Fallback to basic data if detailed fetch fails
        })
      );
      setDetailedStudents(detailedData);
      return detailedData;
    } catch (error) {
      console.error('Error fetching detailed student data:', error);
      return students; // Fallback to basic data
    }
  };

  // Existing useEffect
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const franchiseId = localStorage.getItem('franchiseID');
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/institute_student/get_students?franchiseId=${franchiseId}`
        );
        console.log("data coming from franchise:-" , response.data); // Log the response data for debugging
        if (Array.isArray(response.data)) {
          setStudents(response.data);
        } else if (response.data && typeof response.data === "object") {
          const studentsArray = response.data.data || response.data.students || [];
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

  const totalPages = students && students.length ? Math.ceil(students.length / entriesPerPage) : 0;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = Array.isArray(students) ? students.slice(startIndex, startIndex + entriesPerPage) : [];

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const previousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // CORRECTED Export Functions with proper field mappings
  const prepareExportData = (studentsData) => {
    return studentsData.map((student, index) => ({
      'S/N': index + 1,
      'Status': student.status ? 'Active' : 'Inactive',
      'Batch': student.selectedBatch || '',
      'Student Name': student.studentName || '',
      'Student ID': student.rollNumber || '',
      'Course Name': student.courseInterested?.courseName || '',
      'Course ID': student.courseInterested?.courseCode || '',
      'Mobile': student.studentMobile || '',
      'Referral Code': student.referralCode || '',
      'Referral Name': student.referralName || '', // This might need to be fetched separately if it's a reference
      'Admission Date': student.admissionDate || '',
      // Corrected field mappings based on your backend fields
      'Email': student.email || '',
      'Date of Birth': student.dob || '',
      'Gender': student.gender || '',
      'City': student.city || '',
      'Post Code': student.postCode || '',
      'Permanent Address': student.permanentAddress || '',
      'Caste': student.caste || '',
      'Qualifications': student.qualifications || '',
      'Occupation': student.occupation || '',
      'Relation Type': student.relationType || '',
      'Mother Name': student.motherName || '',
      'Franchise ID': student.franchiseId || '',
      'Abbreviation': student.abbreviation || '',
      // Note: studentPhoto and studentSignature are likely file paths/URLs, 
      // so they might not be suitable for direct export to Excel/PDF
      'Photo URL': student.studentPhoto || '',
      'Signature URL': student.studentSignature || '',
    }));
  };

  const exportToExcel = async () => {
    try {
      // Show loading state
      setShowExportDropdown(false);
      alert('Preparing Excel file... This may take a moment.');

      // Fetch detailed data for all students
      const detailedData = await fetchAllDetailedData();
      const exportData = prepareExportData(detailedData);
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      
      // Set column widths
      const colWidths = [
        { wch: 5 },   // S/N
        { wch: 10 },  // Status
        { wch: 15 },  // Batch
        { wch: 25 },  // Student Name
        { wch: 15 },  // Student ID
        { wch: 30 },  // Course Name
        { wch: 15 },  // Course ID
        { wch: 15 },  // Mobile
        { wch: 15 },  // Referral Code
        { wch: 20 },  // Referral Name
        { wch: 15 },  // Admission Date
        { wch: 25 },  // Email
        { wch: 15 },  // Date of Birth
        { wch: 10 },  // Gender
        { wch: 20 },  // City
        { wch: 10 },  // Post Code
        { wch: 40 },  // Permanent Address
        { wch: 15 },  // Caste
        { wch: 25 },  // Qualifications
        { wch: 20 },  // Occupation
        { wch: 15 },  // Relation Type
        { wch: 20 },  // Mother Name
        { wch: 15 },  // Franchise ID
        { wch: 15 },  // Abbreviation
        { wch: 30 },  // Photo URL
        { wch: 30 },  // Signature URL
      ];
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `Students_List_${currentDate}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      
      // Show success message
      alert(`Excel file "${fileName}" has been downloaded successfully with all student details!`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  const exportToPDF = async () => {
    try {
      // Show loading state
      setShowExportDropdown(false);
      alert('Preparing PDF file... This may take a moment.');

      // Fetch detailed data for all students
      const detailedData = await fetchAllDetailedData();
      
      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      // Add title
      doc.setFontSize(16);
      doc.text('Students List', 14, 20);
      
      // Add date
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate}`, 14, 28);
      
      // Prepare data for PDF table
      const exportData = prepareExportData(detailedData);
      
      // Define columns for PDF (selecting key columns to fit better)
      const columns = [
        'S/N',
        'Status', 
        'Student Name',
        'Student ID',
        'Course Name',
        'Mobile',
        'Email',
        'City',
        'Batch',
        'Admission Date'
      ];
      
      const rows = exportData.map(student => [
        student['S/N'],
        student['Status'],
        student['Student Name'],
        student['Student ID'],
        student['Course Name'],
        student['Mobile'],
        student['Email'],
        student['City'],
        student['Batch'],
        student['Admission Date']
      ]);

      // Add table using autoTable
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 35,
        styles: { fontSize: 8 }, // Smaller font for more columns
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35, right: 14, bottom: 20, left: 14 },
        columnStyles: {
          2: { cellWidth: 30 }, // Student Name column wider
          4: { cellWidth: 35 }, // Course Name column wider
        }
      });

      // Generate filename with current date
      const currentDate2 = new Date().toISOString().split('T')[0];
      const fileName = `Students_List_${currentDate2}.pdf`;
      
      doc.save(fileName);
      
      // Show success message
      alert(`PDF file "${fileName}" has been downloaded successfully with student details!`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error exporting to PDF. Please try again.');
    }
  };

  // Toggle export dropdown
  const toggleExportDropdown = () => {
    setShowExportDropdown(!showExportDropdown);
  };

  // Close dropdown when clicking outside
  const closeDropdownOnOutsideClick = (e) => {
    if (showExportDropdown && !e.target.closest('.export-dropdown-container')) {
      setShowExportDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeDropdownOnOutsideClick);
    return () => {
      document.removeEventListener('click', closeDropdownOnOutsideClick);
    };
  }, [showExportDropdown]);

  // All other existing functions remain the same...
  const handleStatusToggleClick = (student) => {
    setStatusToggleStudent(student);
    setShowStatusPopup(true);
  };

  const confirmStatusToggle = async () => {
    if (!statusToggleStudent) return;

    try {
      const newStatus = !statusToggleStudent.status;
      
      const response = await axios.patch(
        `${API_BASE_URL}/api/v1/institute_student/toggle_status/${statusToggleStudent._id}`,
        { status: newStatus }
      );

      if (response.data.success) {
        const updatedStudents = students.map((student) => {
          if (student._id === statusToggleStudent._id) {
            return { ...student, status: newStatus };
          }
          return student;
        });

        setStudents(updatedStudents);
      } else {
        alert('Failed to update student status. Please try again.');
      }
    } catch (error) {
      console.error("Error updating status: ", error);
      alert('Error updating student status. Please try again.');
    }

    setShowStatusPopup(false);
    setStatusToggleStudent(null);
  };

  const cancelStatusToggle = () => {
    setShowStatusPopup(false);
    setStatusToggleStudent(null);
  };

  const handleViewProfile = (students) => {
    setSelectedStudent(students);
    setShowProfilePopup(true);
  };

  const handleViewForm = () => {
    setShowFormPopup(true);
  };

  const handleViewIDCard = () => {
    setShowIdCardPopup(true);
  };

  const handleShare = () => {
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
    const studentID = selectedStudent._id;
    const studentToEdit = students.find((s) => s._id === studentID);

    if (studentToEdit) {
      console.log("Editing student with ID:", studentToEdit); 
      localStorage.setItem("editStudentData", JSON.stringify(studentToEdit));
      setShowProfilePopup(false);
      setSelectedStudent(null);
      navigate(`/institute/edit-student/${studentID}`);
    } else {
      console.error("Student not found with ID:", studentID);
    }
  };

  return (
    <div className="min-h-full bg-blue-50">
      <div className="mx-auto bg-white p-6 rounded-2xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">List Student Admission</h1>
          <div className="flex gap-2">
            <button
              className="bg-sky-900 text-white px-4 py-2 rounded-md"
              onClick={() => navigate("/institute/Registration")}
            >
              Add New Student
            </button>
            
            {/* Updated Export Button with Dropdown */}
            <div className="relative export-dropdown-container">
              <button 
                className="bg-sky-900 text-white font-medium px-4 py-2 rounded-md cursor-pointer flex items-center"
                onClick={toggleExportDropdown}
              >
                Export 
                <span className={`text-md ml-1 transition-transform duration-200 ${
                  showExportDropdown ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              </button>
              
              {/* Export Dropdown Menu */}
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={exportToExcel}
                    >
                      📊 Export to Excel
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={exportToPDF}
                    >
                      📄 Export to PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Updated table to use correct field names */}
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
                <th className="border border-gray-300 px-4 py-2">Course Name</th>
                <th className="border border-gray-300 px-4 py-2">Course ID</th>
                <th className="border border-gray-300 px-4 py-2">Mobile</th>
                <th className="border border-gray-300 px-4 py-2">Referral Code</th>
                <th className="border border-gray-300 px-4 py-2">Referral Name</th>
                <th className="border border-gray-300 px-4 py-2">Admission Date</th>
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
                  <td className="border border-gray-300 px-4 py-2">{student.selectedBatch || student.batch}</td>
                  <td className="border border-gray-300 px-4 py-2">{student.studentName}</td>
                  <td className="border border-gray-300 px-4 py-2">{student.rollNumber}</td>
                  <td className="border border-gray-300 px-4 py-2">{student.courseInterested?.courseName}</td>
                  <td className="border border-gray-300 px-4 py-2">{student.courseInterested?.courseCode}</td>
                  <td className="border border-gray-300 px-4 py-2">{student.studentMobile}</td>
                  <td className="border border-gray-300 px-4 py-2">{student.referralCode}</td>
                  <td className="border border-gray-300 px-4 py-2">{student.referralName}</td>
                  <td className="border border-gray-300 px-4 py-2">{student.admissionDate}</td>
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

      {/* All existing popups remain the same... */}
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
//pdf button is not working and excel doesn't contain proper data.
// // Updated StudentAdmissionList component with export functionality

// // First, install these packages:
// // npm install xlsx jspdf jspdf-autotable

// // Import necessary dependencies
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import StudentProfile from "./StudentProfile";
// import FormView from "./FormView";
// import IdCardView from "./IdCardView";
// import SharePopup from "./SharePopup";
// import API_BASE_URL from "../../../../config";
// import { FaUser } from "react-icons/fa";
// // Import for Excel export
// import * as XLSX from 'xlsx';
// // Import for PDF export
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// const StudentAdmissionList = () => {
//   const navigate = useNavigate();
//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [showProfilePopup, setShowProfilePopup] = useState(false);
//   const [showFormPopup, setShowFormPopup] = useState(false);
//   const [showIdCardPopup, setShowIdCardPopup] = useState(false);
//   const [showSharePopup, setShowSharePopup] = useState(false);
//   const [showStatusPopup, setShowStatusPopup] = useState(false);
//   const [statusToggleStudent, setStatusToggleStudent] = useState(null);
  
//   // New state for export dropdown
//   const [showExportDropdown, setShowExportDropdown] = useState(false);

//   // Existing useEffect and other functions remain the same...
//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const franchiseId = localStorage.getItem('franchiseID');
//         const response = await axios.get(
//           `${API_BASE_URL}/api/v1/institute_student/get_students?franchiseId=${franchiseId}`
//         );
        
//         if (Array.isArray(response.data)) {
//           setStudents(response.data);
//         } else if (response.data && typeof response.data === "object") {
//           const studentsArray = response.data.data || response.data.students || [];
//           setStudents(studentsArray);
//         } else {
//           console.error("Unexpected response format:", response.data);
//           setStudents([]);
//         }
//       } catch (error) {
//         console.error("Error fetching students:", error);
//         setStudents([]);
//       }
//     };

//     fetchStudents();
//   }, []);

//   const [currentPage, setCurrentPage] = useState(1);
//   const entriesPerPage = 10;

//   const totalPages = students && students.length ? Math.ceil(students.length / entriesPerPage) : 0;
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentEntries = Array.isArray(students) ? students.slice(startIndex, startIndex + entriesPerPage) : [];

//   const nextPage = () => {
//     if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
//   };

//   const previousPage = () => {
//     if (currentPage > 1) setCurrentPage((prev) => prev - 1);
//   };

//   // Export Functions
//   const prepareExportData = () => {
//     return students.map((student, index) => ({
//       'S/N': index + 1,
//       'Status': student.status ? 'Active' : 'Inactive',
//       'Batch': student.batch || '',
//       'Student Name': student.studentName || '',
//       'Student ID': student.rollNumber || '',
//       'Course Name': student.courseInterested?.courseName || '',
//       'Course ID': student.courseInterested?.courseCode || '',
//       'Mobile': student.studentMobile || '',
//       'Referral Code': student.referralCode || '',
//       'Referral Name': student.referralName || '',
//       'Admission Date': student.admissionDate || '',
//       // Add any additional fields from backend that you want to export
//       'Email': student.email || '',
//       'Address': student.address || '',
//       'Father Name': student.fatherName || '',
//       'Mother Name': student.motherName || '',
//       'Date of Birth': student.dateOfBirth || '',
//       'Gender': student.gender || '',
//       'Category': student.category || '',
//       'Qualification': student.qualification || '',
//     }));
//   };

//   const exportToExcel = () => {
//     try {
//       const exportData = prepareExportData();
//       const ws = XLSX.utils.json_to_sheet(exportData);
//       const wb = XLSX.utils.book_new();
      
//       // Set column widths
//       const colWidths = [
//         { wch: 5 },   // S/N
//         { wch: 10 },  // Status
//         { wch: 15 },  // Batch
//         { wch: 25 },  // Student Name
//         { wch: 15 },  // Student ID
//         { wch: 30 },  // Course Name
//         { wch: 15 },  // Course ID
//         { wch: 15 },  // Mobile
//         { wch: 15 },  // Referral Code
//         { wch: 20 },  // Referral Name
//         { wch: 15 },  // Admission Date
//         { wch: 25 },  // Email
//         { wch: 30 },  // Address
//         { wch: 20 },  // Father Name
//         { wch: 20 },  // Mother Name
//         { wch: 15 },  // Date of Birth
//         { wch: 10 },  // Gender
//         { wch: 15 },  // Category
//         { wch: 20 },  // Qualification
//       ];
//       ws['!cols'] = colWidths;
      
//       XLSX.utils.book_append_sheet(wb, ws, "Students");
      
//       // Generate filename with current date
//       const currentDate = new Date().toISOString().split('T')[0];
//       const fileName = `Students_List_${currentDate}.xlsx`;
      
//       XLSX.writeFile(wb, fileName);
//       setShowExportDropdown(false);
      
//       // Optional: Show success message
//       alert(`Excel file "${fileName}" has been downloaded successfully!`);
//     } catch (error) {
//       console.error('Error exporting to Excel:', error);
//       alert('Error exporting to Excel. Please try again.');
//     }
//   };

//   const exportToPDF = () => {
//     try {
//       const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
//       // Add title
//       doc.setFontSize(16);
//       doc.text('Students List', 14, 20);
      
//       // Add date
//       const currentDate = new Date().toLocaleDateString();
//       doc.setFontSize(10);
//       doc.text(`Generated on: ${currentDate}`, 14, 28);
      
//       // Prepare data for PDF table
//       const exportData = prepareExportData();
      
//       // Define columns for PDF (selecting key columns to fit better)
//       const columns = [
//         'S/N',
//         'Status', 
//         'Student Name',
//         'Student ID',
//         'Course Name',
//         'Mobile',
//         'Batch',
//         'Admission Date'
//       ];
      
//       const rows = exportData.map(student => [
//         student['S/N'],
//         student['Status'],
//         student['Student Name'],
//         student['Student ID'],
//         student['Course Name'],
//         student['Mobile'],
//         student['Batch'],
//         student['Admission Date']
//       ]);

//       // Add table
//       doc.autoTable({
//         head: [columns],
//         body: rows,
//         startY: 35,
//         styles: { fontSize: 8 },
//         headStyles: { fillColor: [41, 128, 185] },
//         alternateRowStyles: { fillColor: [245, 245, 245] },
//         margin: { top: 35, right: 14, bottom: 20, left: 14 },
//       });

//       // Generate filename with current date
//       const currentDate2 = new Date().toISOString().split('T')[0];
//       const fileName = `Students_List_${currentDate2}.pdf`;
      
//       doc.save(fileName);
//       setShowExportDropdown(false);
      
//       // Optional: Show success message
//       alert(`PDF file "${fileName}" has been downloaded successfully!`);
//     } catch (error) {
//       console.error('Error exporting to PDF:', error);
//       alert('Error exporting to PDF. Please try again.');
//     }
//   };

//   // Toggle export dropdown
//   const toggleExportDropdown = () => {
//     setShowExportDropdown(!showExportDropdown);
//   };

//   // Close dropdown when clicking outside
//   const closeDropdownOnOutsideClick = (e) => {
//     if (showExportDropdown && !e.target.closest('.export-dropdown-container')) {
//       setShowExportDropdown(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener('click', closeDropdownOnOutsideClick);
//     return () => {
//       document.removeEventListener('click', closeDropdownOnOutsideClick);
//     };
//   }, [showExportDropdown]);

//   // All other existing functions remain the same...
//   const handleStatusToggleClick = (student) => {
//     setStatusToggleStudent(student);
//     setShowStatusPopup(true);
//   };

//   const confirmStatusToggle = async () => {
//     if (!statusToggleStudent) return;

//     try {
//       const newStatus = !statusToggleStudent.status;
      
//       const response = await axios.patch(
//         `${API_BASE_URL}/api/v1/institute_student/toggle_status/${statusToggleStudent._id}`,
//         { status: newStatus }
//       );

//       if (response.data.success) {
//         const updatedStudents = students.map((student) => {
//           if (student._id === statusToggleStudent._id) {
//             return { ...student, status: newStatus };
//           }
//           return student;
//         });

//         setStudents(updatedStudents);
//       } else {
//         alert('Failed to update student status. Please try again.');
//       }
//     } catch (error) {
//       console.error("Error updating status: ", error);
//       alert('Error updating student status. Please try again.');
//     }

//     setShowStatusPopup(false);
//     setStatusToggleStudent(null);
//   };

//   const cancelStatusToggle = () => {
//     setShowStatusPopup(false);
//     setStatusToggleStudent(null);
//   };

//   const handleViewProfile = (students) => {
//     setSelectedStudent(students);
//     setShowProfilePopup(true);
//   };

//   const handleViewForm = () => {
//     setShowFormPopup(true);
//   };

//   const handleViewIDCard = () => {
//     setShowIdCardPopup(true);
//   };

//   const handleShare = () => {
//     setShowSharePopup(true);
//   };

//   const closePopup = () => {
//     setShowFormPopup(false);
//     setShowIdCardPopup(false);
//     setShowSharePopup(false);
//     setShowProfilePopup(false);
//     setSelectedStudent(null);
//   };

//   const handleEditProfileNavigate = () => {
//     const studentID = selectedStudent._id;
//     const studentToEdit = students.find((s) => s._id === studentID);

//     if (studentToEdit) {
//       localStorage.setItem("editStudentData", JSON.stringify(studentToEdit));
//       setShowProfilePopup(false);
//       setSelectedStudent(null);
//       navigate(`/institute/edit-student/${studentID}`);
//     } else {
//       console.error("Student not found with ID:", studentID);
//     }
//   };

//   return (
//     <div className="min-h-full bg-blue-50">
//       <div className="mx-auto bg-white p-6 rounded-2xl shadow">
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-bold">List Student Admission</h1>
//           <div className="flex gap-2">
//             <button
//               className="bg-sky-900 text-white px-4 py-2 rounded-md"
//               onClick={() => navigate("/institute/Registration")}
//             >
//               Add New Student
//             </button>
            
//             {/* Updated Export Button with Dropdown */}
//             <div className="relative export-dropdown-container">
//               <button 
//                 className="bg-sky-900 text-white font-medium px-4 py-2 rounded-md cursor-pointer flex items-center"
//                 onClick={toggleExportDropdown}
//               >
//                 Export 
//                 <span className={`text-md ml-1 transition-transform duration-200 ${
//                   showExportDropdown ? 'rotate-180' : ''
//                 }`}>
//                   ▼
//                 </span>
//               </button>
              
//               {/* Export Dropdown Menu */}
//               {showExportDropdown && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
//                   <div className="py-1">
//                     <button
//                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
//                       onClick={exportToExcel}
//                     >
//                       📊 Export to Excel
//                     </button>
//                     <button
//                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
//                       onClick={exportToPDF}
//                     >
//                       📄 Export to PDF
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Rest of the component remains the same... */}
//         <div className="w-full overflow-auto max-h-[550px] border border-gray-300 rounded-md">
//           <table className="w-[1400px] border-collapse border-gray-300">
//             <thead className="sticky top-0 bg-gray-100">
//               <tr>
//                 <th className="border border-gray-300 px-4 py-2">S/N</th>
//                 <th className="border border-gray-300 px-4 py-2">Action</th>
//                 <th className="border border-gray-300 px-4 py-2">Status</th>
//                 <th className="border border-gray-300 px-4 py-2">Batch</th>
//                 <th className="border border-gray-300 px-4 py-2">Student Name</th>
//                 <th className="border border-gray-300 px-4 py-2">StudentID</th>
//                 <th className="border border-gray-300 px-4 py-2">Course Name</th>
//                 <th className="border border-gray-300 px-4 py-2">Course ID</th>
//                 <th className="border border-gray-300 px-4 py-2">Mobile</th>
//                 <th className="border border-gray-300 px-4 py-2">Referral Code</th>
//                 <th className="border border-gray-300 px-4 py-2">Referral Name</th>
//                 <th className="border border-gray-300 px-4 py-2">Admission Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentEntries.map((student, index) => (
//                 <tr key={student._id} className="text-center border w-96">
//                   <td className="border border-gray-300 px-4 py-2">
//                     {startIndex + index + 1}
//                   </td>
//                   <td className="border-gray-500 px-4 py-2 flex justify-center gap-2">
//                     <button
//                       className="bg-sky-800 text-white p-2 rounded-md text-sm font-medium"
//                       onClick={() => handleViewProfile(student)}
//                     >
//                       <FaUser className="w-8 h-8 items-center" />
//                     </button>
//                   </td>
//                   <td className="p-2 border">
//                     <button 
//                       onClick={() => handleStatusToggleClick(student)}
//                       className={`px-2 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
//                         student.status ? "bg-green-200 text-green-800 hover:bg-green-300" : "bg-red-200 text-red-800 hover:bg-red-300"
//                       }`}
//                     >
//                       {student.status ? "Active" : "Inactive"}
//                     </button>
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">{student.batch}</td>
//                   <td className="border border-gray-300 px-4 py-2">{student.studentName}</td>
//                   <td className="border border-gray-300 px-4 py-2">{student.rollNumber}</td>
//                   <td className="border border-gray-300 px-4 py-2">{student.courseInterested.courseName}</td>
//                   <td className="border border-gray-300 px-4 py-2">{student.courseInterested.courseCode}</td>
//                   <td className="border border-gray-300 px-4 py-2">{student.studentMobile}</td>
//                   <td className="border border-gray-300 px-4 py-2">{student.referralCode}</td>
//                   <td className="border border-gray-300 px-4 py-2">{student.referralName}</td>
//                   <td className="border border-gray-300 px-4 py-2">{student.admissionDate}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Controls */}
//         <div className="flex justify-between items-center mt-4">
//           <button
//             onClick={previousPage}
//             disabled={currentPage === 1}
//             className={`p-2 rounded ${
//               currentPage === 1
//                 ? "bg-gray-300 cursor-not-allowed"
//                 : "bg-blue-500 text-white"
//             }`}
//           >
//             Previous
//           </button>
//           <span className="text-gray-700">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={nextPage}
//             disabled={currentPage === totalPages}
//             className={`p-2 rounded ${
//               currentPage === totalPages
//                 ? "bg-gray-300 cursor-not-allowed"
//                 : "bg-blue-500 text-white"
//             }`}
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* All existing popups remain the same... */}
//       {showStatusPopup && statusToggleStudent && (
//         <div className="fixed inset-0 bg-grey bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
//             <h3 className="text-lg font-semibold mb-4">Confirm Status Change</h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to change the status of{" "}
//               <strong>{statusToggleStudent.studentName}</strong> to{" "}
//               <strong className={statusToggleStudent.status ? "text-red-600" : "text-green-600"}>
//                 {statusToggleStudent.status ? "Inactive" : "Active"}
//               </strong>?
//             </p>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={cancelStatusToggle}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmStatusToggle}
//                 className={`px-4 py-2 rounded text-white transition-colors ${
//                   statusToggleStudent.status
//                     ? "bg-red-500 hover:bg-red-600"
//                     : "bg-green-500 hover:bg-green-600"
//                 }`}
//               >
//                 {statusToggleStudent.status ? "Deactivate" : "Activate"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showProfilePopup && selectedStudent && (
//         <StudentProfile
//           student={selectedStudent}
//           onClose={closePopup}
//           onViewForm={handleViewForm}
//           onViewIDCard={handleViewIDCard}
//           onShare={handleShare}
//           onEdit={handleEditProfileNavigate}
//         />
//       )}

//       {showFormPopup && (
//         <FormView student={selectedStudent} onClose={closePopup} />
//       )}
//       {showIdCardPopup && (
//         <IdCardView student={selectedStudent} onClose={closePopup} />
//       )}
//       {showSharePopup && (
//         <SharePopup student={selectedStudent} onClose={closePopup} />
//       )}
//     </div>
//   );
// };

// export default StudentAdmissionList;

