// Updated Admin StudentAdmissionList component with Excel and PDF export functionality

// First, install these packages:
// npm install xlsx jspdf jspdf-autotable

// Import necessary dependencies
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StudentProfile from "./StudentProfile"; // Import the new component
import FormView from "./FormView";
import IdCardView from "./IdCardView";
import API_BASE_URL from "../../config";
import { FaCircleCheck, FaPerson, FaPersonCirclePlus, FaPersonDotsFromLine, FaPersonRifle } from "react-icons/fa6";
import { FaArrowUp, FaUser, FaSearch, FaTimes } from "react-icons/fa";

// Import for Excel export
import * as XLSX from 'xlsx';
// Import for PDF export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import autoTable separately

const StudentAdmissionList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [showIdCardPopup, setShowIdCardPopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusToggleStudent, setStatusToggleStudent] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all"); // State for time filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState("active"); // State for active tab

  // New state for export dropdown
  const [showExportDropdown, setShowExportDropdown] = useState(false);


  // Then modify your useEffect fetch to ensure you're setting an array
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/admin_student/get_students`
        ); 
        console.log("students data 1 :: ", response.data);

        // Check if response.data is an array, if not, handle appropriately
        if (Array.isArray(response.data)) {
          setStudents(response.data);
          setFilteredStudents(response.data);
        } else if (response.data && typeof response.data === "object") {
          // If response.data is an object that contains the array (common API pattern)
          // For example, if your API returns {data: [...students]}
          const studentsArray =
            response.data.data || response.data.students || [];
          setStudents(studentsArray);
          setFilteredStudents(studentsArray);
        } else {
          console.error("Unexpected response format:", response.data);
          setStudents([]);
          setFilteredStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
        setFilteredStudents([]);
      }
    };

    fetchStudents();
  }, []);

  // Combined filter for search term and time
  useEffect(() => {
    let tempStudents = students;

    // 1. Filter by active tab status
    if (activeTab === 'active') {
      tempStudents = tempStudents.filter(student => student.status === 'active' || student.status === 'true' || student.status === true);
    } else if (activeTab === 'inactive') {
      tempStudents = tempStudents.filter(student => student.status === 'inactive' || student.status === 'false' || student.status === false);
    } else if (activeTab === 'certified') {
      tempStudents = tempStudents.filter(student => student.status === 'Certified');
    }


    // 1. Filter by search term
    if (searchTerm.trim() !== "") {
      tempStudents = tempStudents.filter(
        (student) =>
          student.franchiseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.courseInterested?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentMobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.courseInterested?.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) 
         
      );
    }

    // 2. Filter by time
    // 2. Filter by time
    const isDateInRange = (date, filter, start, end) => {
      if (!date) return true;
      const itemDate = new Date(date);
      if (isNaN(itemDate.getTime())) return false;

      if (filter === 'all') return true;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filter) {
        case 'today':
          return itemDate >= today;
        case 'yesterday': {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return itemDate >= yesterday && itemDate < today;
        }
        case 'last7days': {
          const last7days = new Date(today);
          last7days.setDate(today.getDate() - 7);
          return itemDate >= last7days;
        }
        case 'last30days': {
          const last30days = new Date(today);
          last30days.setDate(today.getDate() - 30);
          return itemDate >= last30days;
        }
        case 'custom':
          if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999); // Include the entire end day
            return itemDate >= startDate && itemDate <= endDate;
          }
          return true;
        default:
          return true;
      }
    };

    tempStudents = tempStudents.filter(student => 
      isDateInRange(student.admissionDate, timeFilter, startDate, endDate)
    );

    setFilteredStudents(tempStudents);
    setCurrentPage(1); // Reset to the first page whenever filters change
  }, [searchTerm, timeFilter, students, activeTab, startDate, endDate]);
 console.log("Filtered Students: ", filteredStudents);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  useEffect(() => {
    // Simulate fetching from backend
    console.log("updated Student data :: ", filteredStudents);
  }, []);

  const totalPages =
    filteredStudents && filteredStudents.length
      ? Math.ceil(filteredStudents.length / entriesPerPage)
      : 0;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = Array.isArray(filteredStudents)
    ? filteredStudents.slice(startIndex, startIndex + entriesPerPage)
    : [];

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const previousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // EXPORT FUNCTIONS - Adapted for Admin side
  const prepareExportData = (studentsData) => {
    return studentsData.map((student, index) => ({
      'S/N': index + 1,
      'Franchise ID': student.franchiseId || '',
      'Status': student.status === 'Certified' ? 'Certified' : (student.status === 'active' || student.status === 'true' || student.status === true) ? 'Active' : 'Inactive',
      'Student Name': student.studentName || '',
      'Student ID': student.rollNumber || '',
      'Course Name': student.courseInterested?.courseName || '',
      'Course ID': student.courseInterested?.courseCode || '',
      'Mobile': student.studentMobile || '',
      'Referral Code': student.referralCode || '',
      'Admission Date': student.admissionDate || '',
      // Additional fields that might be available
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
      'Abbreviation': student.abbreviation || '',
      'Photo URL': student.studentPhoto || '',
      'Signature URL': student.studentSignature || '',
    }));
  };

  const exportToExcel = async () => {
    try {
      // Show loading state
      setShowExportDropdown(false);
      alert('Preparing Excel file... This may take a moment.');

      // Use current filtered students or fetch detailed data if needed
      const dataToExport = filteredStudents.length > 0 ? filteredStudents : students;
      const exportData = prepareExportData(dataToExport);
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      
      // Set column widths
      const colWidths = [
        { wch: 5 },   // S/N
        { wch: 15 },  // Franchise ID
        { wch: 10 },  // Status
        { wch: 25 },  // Student Name
        { wch: 15 },  // Student ID
        { wch: 30 },  // Course Name
        { wch: 15 },  // Course ID
        { wch: 15 },  // Mobile
        { wch: 15 },  // Referral Code
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
        { wch: 15 },  // Abbreviation
        { wch: 30 },  // Photo URL
        { wch: 30 },  // Signature URL
      ];
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `Admin_Students_List_${currentDate}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      
      // Show success message
      alert(`Excel file "${fileName}" has been downloaded successfully with ${exportData.length} student records!`);
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

      // Use current filtered students or all students
      const dataToExport = filteredStudents.length > 0 ? filteredStudents : students;
      
      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      // Add title
      doc.setFontSize(16);
      doc.text('Admin - Students List', 14, 20);
      
      // Add date and record count
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate}`, 14, 28);
      doc.text(`Total Records: ${dataToExport.length}`, 14, 34);
      
      // Prepare data for PDF table
      const exportData = prepareExportData(dataToExport);
      
      // Define columns for PDF (selecting key columns to fit better)
      const columns = [
        'S/N',
        'Franchise ID',
        'Status', 
        'Student Name',
        'Student ID',
        'Course Name',
        'Mobile',
        'Referral Code',
        'Admission Date'
      ];
      
      const rows = exportData.map(student => [
        student['S/N'],
        student['Franchise ID'],
        student['Status'],
        student['Student Name'],
        student['Student ID'],
        student['Course Name'],
        student['Mobile'],
        student['Referral Code'],
        student['Admission Date']
      ]);

      // Add table using autoTable
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 40,
        styles: { fontSize: 8 }, // Smaller font for more columns
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 40, right: 14, bottom: 20, left: 14 },
        columnStyles: {
          3: { cellWidth: 30 }, // Student Name column wider
          5: { cellWidth: 35 }, // Course Name column wider
        }
      });

      // Generate filename with current date
      const currentDate2 = new Date().toISOString().split('T')[0];
      const fileName = `Admin_Students_List_${currentDate2}.pdf`;
      
      doc.save(fileName);
      
      // Show success message
      alert(`PDF file "${fileName}" has been downloaded successfully with ${dataToExport.length} student records!`);
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

  // Handle showing student profile popup
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
    if (!selectedStudent) return;
    const studentDetails = `
      Name: ${selectedStudent.studentName}
      Batch: ${selectedStudent.batch}
      Course: ${selectedStudent.courseInterested.courseName}
      Mobile: ${selectedStudent.studentMobile}
      Email: ${selectedStudent.email}
    `;
    navigator.clipboard.writeText(studentDetails.trim());
    alert('Student details copied to clipboard');
  };

  // Status toggle functions
  const handleStatusToggleClick = (student) => {
    setStatusToggleStudent(student);
    setShowStatusPopup(true);
  };

  const confirmStatusToggle = async () => {
    if (!statusToggleStudent) return;

    // Check if student is certified - prevent status changes
    if (statusToggleStudent.status === 'Certified') {
      alert('Certified students cannot have their status changed.');
      setShowStatusPopup(false);
      setStatusToggleStudent(null);
      return;
    }

    try {
      // Determine next status based on current status
      let newStatus;
      if (statusToggleStudent.status === 'active' || statusToggleStudent.status === 'true' || statusToggleStudent.status === true) {
        newStatus = 'inactive';
      } else {
        newStatus = 'active';
      }

      const response = await axios.patch(
        `${API_BASE_URL}/api/v1/admin_student/toggle_status/${statusToggleStudent._id}`,
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

  const closePopup = () => {
    setShowFormPopup(false);
    setShowIdCardPopup(false);
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
      // Navigate to edit page with student ID
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

        {/* Tabs for student status */}
        <div className="mb-4 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`inline-block p-4 rounded-t-lg border-b-2 ${activeTab === 'all' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}>
                All Students
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`inline-block p-4 rounded-t-lg border-b-2 ${activeTab === 'active' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}>
                Active Students
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('inactive')}
                className={`inline-block p-4 rounded-t-lg border-b-2 ${activeTab === 'inactive' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}>
                Inactive Students
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('certified')}
                className={`inline-block p-4 rounded-t-lg border-b-2 ${activeTab === 'certified' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}>
                Certified Students
              </button>
            </li>
          </ul>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center my-4 gap-4">
          {/* Left: Showing X of Y */}
          <div className="text-lg font-semibold text-gray-700">
            Showing {filteredStudents.length} of {students.length} students.
          </div>

          {/* Right: Search and Filter */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Box */}
            <div className="relative w-full md:w-[400px]">
              <input
                type="text"
                placeholder="Search by Name, ID, Course, Mobile..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="p-2 pl-8 border border-gray-300 rounded-md w-full"
              />
              <FaSearch className="w-5 h-5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
               {searchTerm && (
                <FaTimes
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={clearSearch}
                />
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
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
                    className="p-2 border border-gray-300 rounded-md"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredStudents.length > 0 ? (
              <span>Found {filteredStudents.length} student(s) with Franchise ID or Student Name containing "{searchTerm}"</span>
            ) : (
              <span className="text-red-600">No students found with Franchise ID or Student Name containing "{searchTerm}"</span>
            )}
          </div>
        )}

        <div className="w-full overflow-auto max-h-[550px] border border-gray-300 rounded-md">
          <table className="w-[1400px] border-collapse border-gray-300">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">S/N</th>
                <th className="border border-gray-300 px-4 py-2">FranchiseId</th>
                <th className="border border-gray-300 px-4 py-2">Action</th>
                <th className="border border-gray-300 px-4 py-2">Status</th> 
                <th className="border border-gray-300 px-4 py-2">
                  Student Name
                </th>
                <th className="border border-gray-300 px-4 py-2">Student ID</th>
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
                  Admission Date
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length > 0 ? (
                currentEntries.map((student, index) => (
                  <tr key={student._id} className="text-center border w-96">
                    <td className="border border-gray-300 px-4 py-2">
                      {startIndex + index + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.franchiseId}
                    </td>
                    <td className="border-gray-500 px-4 py-2 flex justify-center gap-2">
                      <button
                        className="bg-sky-800 text-white p-2 rounded-md text-sm font-medium"
                        onClick={() => handleViewProfile(student)}
                      >
                        <FaUser className="w-8 h-8 items-center"/>
                      </button>
                    </td>
                    
                    <td className="p-2 border">
                      <button 
                        {...(student.status !== 'Certified' && { onClick: () => handleStatusToggleClick(student) })}
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          student.status === 'Certified'
                            ? "bg-blue-200 text-blue-800 cursor-not-allowed opacity-75" 
                            : (student.status === 'active' || student.status === 'true' || student.status === true)
                              ? "bg-green-200 text-green-800 hover:bg-green-300" 
                              : "bg-red-200 text-red-800 hover:bg-red-300"
                        }`}
                        disabled={student.status === 'Certified'}
                      >
                        {student.status === 'Certified' ? "Certified" : (student.status === 'active' || student.status === 'true' || student.status === true) ? "Active" : "Inactive"}
                      </button>
                    </td>                
                    <td className="border border-gray-300 px-4 py-2">
                      {student.studentName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.rollNumber}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.courseInterested?.courseName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.courseInterested?.courseCode}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.studentMobile}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.referralCode}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.admissionDate}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                    {searchTerm ? "No students found matching your search." : "No students found."}
                  </td>
                </tr>
              )}
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Status Change</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to change the status of{" "}
              <strong>{statusToggleStudent.studentName}</strong> to{" "}
              <strong className={
                (statusToggleStudent.status === 'active' || statusToggleStudent.status === 'true' || statusToggleStudent.status === true)
                  ? "text-red-600" 
                  : "text-green-600"
              }>
                {(statusToggleStudent.status === 'active' || statusToggleStudent.status === 'true' || statusToggleStudent.status === true)
                  ? "Inactive" 
                  : "Active"}?
              </strong>
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
                  (statusToggleStudent.status === 'active' || statusToggleStudent.status === 'true' || statusToggleStudent.status === true)
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {(statusToggleStudent.status === 'active' || statusToggleStudent.status === 'true' || statusToggleStudent.status === true)
                  ? "Deactivate" 
                  : "Activate"}
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
        <FormView 
        student={selectedStudent} 
        onClose={closePopup} 
        />
      )}
      {showIdCardPopup && (
        <IdCardView 
        student={selectedStudent} 
        onClose={closePopup} 
        />
      )}
    </div>
  );
};

export default StudentAdmissionList;
// // Import necessary dependencies
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import StudentProfile from "./StudentProfile"; // Import the new component
// import FormView from "./FormView";
// import IdCardView from "./IdCardView";
// import SharePopup from "./SharePopup";
// import API_BASE_URL from "../../config";
// import { FaCircleCheck, FaPerson, FaPersonCirclePlus, FaPersonDotsFromLine, FaPersonRifle } from "react-icons/fa6";
// import { FaArrowUp, FaUser } from "react-icons/fa";

// const StudentAdmissionList = () => {
//   const navigate = useNavigate();
//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [showProfilePopup, setShowProfilePopup] = useState(false);
//   const [showFormPopup, setShowFormPopup] = useState(false);
//   const [showIdCardPopup, setShowIdCardPopup] = useState(false);
//   const [showSharePopup, setShowSharePopup] = useState(false);

//   // Then modify your useEffect fetch to ensure you're setting an array
//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/api/v1/admin_student/get_students`
//         );
//         console.log("students data 1 :: ", response.data);

//         // Check if response.data is an array, if not, handle appropriately
//         if (Array.isArray(response.data)) {
//           setStudents(response.data);
//         } else if (response.data && typeof response.data === "object") {
//           // If response.data is an object that contains the array (common API pattern)
//           // For example, if your API returns {data: [...students]}
//           const studentsArray =
//             response.data.data || response.data.students || [];
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

//   useEffect(() => {
//     // Simulate fetching from backend
//     console.log("updated Student data :: ", students);
//   }, []);

//   const totalPages =
//     students && students.length
//       ? Math.ceil(students.length / entriesPerPage)
//       : 0;
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentEntries = Array.isArray(students)
//     ? students.slice(startIndex, startIndex + entriesPerPage)
//     : [];

//   const nextPage = () => {
//     if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
//   };

//   const previousPage = () => {
//     if (currentPage > 1) setCurrentPage((prev) => prev - 1);
//   };

//   // toggle the state of student active or not
  
//   // Handle showing student profile popup
//   const handleViewProfile = (students) => {
//     setSelectedStudent(students);
//     setShowProfilePopup(true);
//   };

//   const handleViewForm = () => {
//     setShowFormPopup(true);
//     console.log("view form is working");
//   };

//   const handleViewIDCard = () => {
//     setShowIdCardPopup(true);
//     console.log("view idis working");
//   };

//   const handleShare = () => {
//     console.log("handleshare is working");
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
//     // Find selected student
//     const studentID = selectedStudent._id;
//     const studentToEdit = students.find((s) => s._id === studentID);

//     if (studentToEdit) {
//       // Store in localStorage for persistence
//       localStorage.setItem("editStudentData", JSON.stringify(studentToEdit));
//       // Navigate to edit page with student ID
//       navigate(`/institute/edit-student/${studentID}`);
//     } else {
//       console.error("Student not found with ID:", studentId);
//     }
//   };


//   return (
//     <div className="min-h-full bg-blue-50">
//       <div className="mx-auto bg-white p-6 rounded-2xl shadow">
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-bold">List Student Admission</h1>
//           <div >
//             <button className="bg-sky-900 flex text-white font-medium px-4 py-2 rounded-md cursor-pointer">
//               Export <span className="text-md ml-1">▲</span>
             
//             </button>
//           </div>
//         </div>

//         <div className="w-full overflow-auto max-h-[550px] border border-gray-300 rounded-md">
//           <table className="w-[1400px] border-collapse border-gray-300">
//             <thead className="sticky top-0 bg-gray-100">
//               <tr>
//                 <th className="border border-gray-300 px-4 py-2">S/N</th>
//                  <th className="border border-gray-300 px-4 py-2">FranchiseId</th>
//                 <th className="border border-gray-300 px-4 py-2">Action</th>
//                 <th className="border border-gray-300 px-4 py-2">Status</th> 
//                 <th className="border border-gray-300 px-4 py-2">
//                   Student Name
//                 </th>
//                  <th className="border border-gray-300 px-4 py-2">Student ID</th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Course Name
//                 </th>
//                  <th className="border border-gray-300 px-4 py-2">
//                   Course ID
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">Mobile</th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Referral Code
//                 </th>
                
//                 <th className="border border-gray-300 px-4 py-2">
//                   Admission Date
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentEntries.map((student, index) => (
//                 <tr key={student._id} className="text-center border w-96">
//                   <td className="border border-gray-300 px-4 py-2">
//                     {startIndex + index + 1}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.franchiseId}
//                   </td>
//                   <td className="border-gray-500 px-4 py-2 flex justify-center gap-2">
//                     <button
//                       className="bg-sky-800 text-white p-2 rounded-md text-sm font-medium"
//                       onClick={() => handleViewProfile(student)}
//                     >
//                       <FaUser className="w-8 h-8 items-center"/>
//                     </button>
//                   </td>
                  
//                   <td className="p-2 border">
//                     <button 
                      
//                       className={`px-2 py-1 rounded-full text-sm font-medium  ${
//                         student.status ? "bg-green-200 text-green-800 " : "bg-red-200 text-red-800"
//                       }`}
//                     >
                      
//                       {student.status ? "Active" : "Inactive"}
//                     </button>
//                   </td>                
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.studentName}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.rollNumber}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.courseInterested.courseName}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.courseInterested.courseCode}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.studentMobile}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.referralCode}
//                   </td>
                  
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.admissionDate}
//                   </td>
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
//       {/* Student Profile Popup */}
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
//         <FormView 
//         student={selectedStudent} 
//         onClose={closePopup} 
//         />
//       )}
//       {showIdCardPopup && (
//         <IdCardView 
//         student={selectedStudent} 
//         onClose={closePopup} 
//         />
//       )}
//       {showSharePopup && (
//         <SharePopup 
//         student={selectedStudent} 
//         onClose={closePopup} 
//         />
//       )}
//     </div>
//   );
// };

// export default StudentAdmissionList;
