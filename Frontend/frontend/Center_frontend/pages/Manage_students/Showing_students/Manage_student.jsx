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

  // Filter and Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
        console.log("data coming from franchise:-", response.data); // Log the response data for debugging
        if (Array.isArray(response.data)) {
          const merged = await mergeFeesIntoStudents(response.data);
          setStudents(merged);
        } else if (response.data && typeof response.data === "object") {
          const studentsArray = response.data.data || response.data.students || [];
          const merged = await mergeFeesIntoStudents(studentsArray);
          setStudents(merged);
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

  useEffect(() => {
    let tempStudents = students;

    // 1. Filter by active tab status
    if (activeTab === 'active') {
      tempStudents = tempStudents.filter(student => student.status === 'active' || student.status === 'true');
    } else if (activeTab === 'inactive') {
      tempStudents = tempStudents.filter(student => student.status === 'inactive' || student.status === 'false');
    } else if (activeTab === 'certified') {
      tempStudents = tempStudents.filter(student => student.status === 'Certified');
    }

    // Apply search term filter
    if (searchTerm.trim() !== "") {
      tempStudents = tempStudents.filter(s =>
        s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.courseInterested?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.courseInterested?.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentMobile?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const filterDate = (date) => {
        const admissionDate = new Date(date);
        if (isNaN(admissionDate.getTime())) return false;

        switch (timeFilter) {
          case "today":
            return admissionDate >= today;
          case "yesterday":
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return admissionDate >= yesterday && admissionDate < today;
          case "last7days":
            const last7days = new Date(today);
            last7days.setDate(today.getDate() - 7);
            return admissionDate >= last7days;
          case "last30days":
            const last30days = new Date(today);
            last30days.setDate(today.getDate() - 30);
            return admissionDate >= last30days;
          case "custom":
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999); // Include the entire end day
              return admissionDate >= start && admissionDate <= end;
            }
            return true;
          default:
            return true;
        }
      };
      tempStudents = tempStudents.filter(student => filterDate(student.admissionDate));
    }

    setFilteredStudents(tempStudents);
    setCurrentPage(1); // Reset to first page whenever filter changes
  }, [students, searchTerm, timeFilter, activeTab, startDate, endDate]);

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const totalPages = filteredStudents.length > 0 ? Math.ceil(filteredStudents.length / entriesPerPage) : 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = filteredStudents.slice(startIndex, startIndex + entriesPerPage);

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
      'Status': student.status === 'active' || student.status === 'true'
        ? 'Active'
        : student.status === 'Certified'
          ? 'Certified'
          : 'Inactive',
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

      // Use current filtered students instead of all students
      const dataToExport = filteredStudents.length > 0 ? filteredStudents : students;
      const exportData = prepareExportData(dataToExport);

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

      // Use current filtered students instead of all students
      const dataToExport = filteredStudents.length > 0 ? filteredStudents : students;

      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation

      // Add title
      doc.setFontSize(16);
      doc.text('Students List', 14, 20);

      // Add date
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate}`, 14, 28);

      // Prepare data for PDF table
      const exportData = prepareExportData(dataToExport);

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

  // All other existing functions remain the same...
  const handleStatusToggleClick = (student) => {
    setStatusToggleStudent(student);
    setShowStatusPopup(true);
  };

  const confirmStatusToggle = async () => {
    if (!statusToggleStudent) return;

    // ✅ ADD THIS CHECK
    if (statusToggleStudent.status === 'Certified') {
      alert('Certified students cannot have their status changed.');
      setShowStatusPopup(false);
      setStatusToggleStudent(null);
      return;
    }

    try {
      // Determine next status based on current status
      let newStatus;
      if (statusToggleStudent.status === 'active' || statusToggleStudent.status === 'true') {
        newStatus = 'inactive';
      } else if (statusToggleStudent.status === 'inactive' || statusToggleStudent.status === 'false') {
        newStatus = 'active';
      }
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

  // Merge fees data (from fees endpoint) into base students by rollNumber
  const mergeFeesIntoStudents = async (baseStudents) => {
    try {
      const franchiseId = localStorage.getItem('franchiseID');
      // Fetch normal fee aggregates
      const resp = await axios.get(
        `${API_BASE_URL}/api/v1/institute_fees/students?limit=1000&page=1&franchiseId=${franchiseId}`
      );
      const feeList = resp.data?.data || [];
      const feeMap = new Map(feeList.map((s) => [s.rollNumber, s]));

      // Fetch installment aggregates
      const instResp = await axios.get(
        `${API_BASE_URL}/api/v1/institute_fees/installments/students?franchiseId=${franchiseId}`
      );
      const instList = instResp.data?.data || [];
      const instMap = new Map(instList.map((s) => [s.rollNumber, s]));

      return baseStudents.map((s) => {
        const fee = feeMap.get(s.rollNumber);
        const inst = instMap.get(s.rollNumber);

        let merged = { ...s };

        if (fee) {
          const dueFee = typeof fee.dueFee === 'number'
            ? fee.dueFee
            : (Number(fee.totalFee || 0) - Number(fee.paidFee || 0));
          merged = {
            ...merged,
            totalFee: fee.totalFee,
            paidFee: fee.paidFee,
            dueFee,
          };
        }

        if (inst) {
          // Prefer backend-provided totals if present
          const totalInstallmentAmount = Number(inst.totalInstallmentAmount ?? (inst.installments?.reduce((sum, i) => sum + Number(i.amount || 0), 0) || 0));
          const paidInstallmentAmount = Number(inst.paidInstallmentAmount ?? (inst.installments?.reduce((sum, i) => sum + Number(i.paid ? (i.amount || 0) : 0), 0) || 0));
          const dueInstallmentAmount = Number(inst.dueInstallmentAmount ?? (totalInstallmentAmount - paidInstallmentAmount));

          merged = {
            ...merged,
            installments: inst.installments || [],
            totalInstallmentAmount,
            paidInstallmentAmount,
            dueInstallmentAmount,
          };
        }

        // Compute displayDueFee: if installment data exists, show its due; else show normal due
        const totalFeeNum = Number(merged.totalFee || 0);
        const paidFeeNum = Number(merged.paidFee || 0);
        const dueFromFeesCalc = merged.dueFee ?? (totalFeeNum - paidFeeNum);
        const dueFromFees = Number(dueFromFeesCalc ?? 0);
        const hasInstallments = Array.isArray(merged.installments) && merged.installments.length > 0;
        const dueFromInstallments = Number(merged.dueInstallmentAmount || 0);
        const displayDueFee = (hasInstallments || dueFromInstallments > 0) ? dueFromInstallments : dueFromFees;

        return {
          ...merged,
          displayDueFee,
        };
      });
    } catch (error) {
      console.error('Error fetching fees/installments data:', error);
      return baseStudents;
    }
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
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="mx-auto bg-white p-6 md:p-7 rounded-2xl shadow-lg ring-1 ring-slate-200/70">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-700 to-indigo-600">List Student Admission</h1>
          <div className="flex gap-3">
            <button
              className="bg-sky-700 hover:bg-sky-800 active:scale-[0.98] text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              onClick={() => navigate("/institute/Registration")}
            >
              Add New Student
            </button>

            {/* Updated Export Button with Dropdown */}
            <div className="relative export-dropdown-container">
              <button
                className="bg-sky-700 hover:bg-sky-800 active:scale-[0.98] text-white font-medium px-4 py-2 rounded-lg cursor-pointer flex items-center shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                onClick={toggleExportDropdown}
              >
                Export
                <span className={`text-md ml-1 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''
                  }`}>
                  ▼
                </span>
              </button>

              {/* Export Dropdown Menu */}
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                  <div className="py-1">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={exportToExcel}
                    >
                      📊 Export to Excel
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
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
        <div className="mb-4 border-b border-slate-200/80">
          <ul className="flex flex-wrap -mb-px text-sm font-semibold text-center text-slate-500">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`inline-block px-4 py-3 rounded-t-lg border-b-2 transition-colors ${activeTab === 'all' ? 'text-sky-700 border-sky-600' : 'border-transparent hover:text-slate-700 hover:border-slate-300'}`}
              >
                All Students
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`inline-block px-4 py-3 rounded-t-lg border-b-2 transition-colors ${activeTab === 'active' ? 'text-sky-700 border-sky-600' : 'border-transparent hover:text-slate-700 hover:border-slate-300'}`}
              >
                Active Students
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('inactive')}
                className={`inline-block px-4 py-3 rounded-t-lg border-b-2 transition-colors ${activeTab === 'inactive' ? 'text-sky-700 border-sky-600' : 'border-transparent hover:text-slate-700 hover:border-slate-300'}`}
              >
                Inactive Students
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('certified')}
                className={`inline-block px-4 py-3 rounded-t-lg border-b-2 transition-colors ${activeTab === 'certified' ? 'text-sky-700 border-sky-600' : 'border-transparent hover:text-slate-700 hover:border-slate-300'}`}
              >
                Certified Students
              </button>
            </li>
          </ul>
        </div>


        {/* Filter and Search Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center my-4 gap-4">
          {/* Left: Showing X of Y */}
          <div className="text-lg font-semibold text-slate-700">
            Showing {currentEntries.length} of {filteredStudents.length} students.
          </div>

          {/* Right: Search and Filter */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Box */}
            <div className="relative w-full md:w-[400px]">
              <input
                type="text"
                placeholder="Search by Name, ID, Course, Mobile..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="p-2 pl-10 pr-3 border border-slate-200 rounded-full w-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300 transition"
              />
              <svg
                className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-4">
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="p-2 px-3 border border-slate-200 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300 transition"
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
                    className="p-2 border border-slate-200 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300 transition"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 border border-slate-200 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300 transition"
                  />
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Updated table to use correct field names */}
        <div className="w-full overflow-auto max-h-[550px] rounded-xl shadow-md ring-1 ring-slate-200">
          <table className="min-w-full w-[1400px] border-collapse">
            <thead className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">S/N</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">StudentID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Course Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Course ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Batch</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Admission Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Due Fee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Referral Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Referral Name</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentEntries.map((student, index) => (
                <tr key={student._id} className="group text-center w-96 even:bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-700">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button
                      className="bg-sky-700 hover:bg-sky-800 text-white p-2 rounded-full text-sm font-medium shadow-sm transition-all duration-150 hover:scale-[1.02]"
                      onClick={() => handleViewProfile(student)}
                    >
                      <FaUser className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      {...(student.status !== 'Certified' && { onClick: () => handleStatusToggleClick(student) })}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ring-1 shadow-sm transition-colors ${student.status === 'Certified'
                          ? "bg-blue-100 text-blue-700 ring-blue-200 cursor-not-allowed opacity-80"
                          : student.status === 'active' || student.status === 'true'
                            ? "bg-emerald-100 text-emerald-700 ring-emerald-200 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-700 ring-rose-200 hover:bg-rose-200"
                        }`}
                      disabled={student.status === 'Certified'}
                    >
                      {student.status === 'active' || student.status === 'true'
                        ? "Active"
                        : student.status === 'Certified'
                          ? "Certified"
                          : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-left">{student.studentName}</td>
                  <td className="px-4 py-3 text-slate-700 text-left font-mono">{student.rollNumber}</td>
                  <td className="px-4 py-3 text-slate-700 text-left">{student.courseInterested?.courseName}</td>
                  <td className="px-4 py-3 text-slate-700 text-left">{student.studentMobile}</td>
                  <td className="px-4 py-3 text-slate-700 text-left font-mono">{student.courseInterested?.courseCode}</td>
                  <td className="px-4 py-3 text-left">
                    <span className="text-sky-700 font-semibold tracking-wide">{student.selectedBatch || student.batch}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-left">{student.admissionDate}</td>
                  <td className="px-4 py-3 text-rose-600 text-left font-semibold">₹{(() => {
                    const totalFeeNum = Number(student.totalFee || 0);
                    const paidFeeNum = Number(student.paidFee || 0);
                    const dueFromFeesCalc = student.dueFee ?? (totalFeeNum - paidFeeNum);
                    const dueFromFees = Number(dueFromFeesCalc ?? 0);
                    const dueFromInstallments = Number(student.dueInstallmentAmount || 0);
                    const hasInstallments = Array.isArray(student.installments) && student.installments.length > 0;
                    const display = (hasInstallments || dueFromInstallments > 0) ? dueFromInstallments : dueFromFees;
                    return Number(isNaN(display) ? 0 : display).toLocaleString();
                  })()}</td>
                  <td className="px-4 py-3 text-slate-700 text-left">{student.referralCode}</td>
                  <td className="px-4 py-3 text-slate-700 text-left">{student.referralName}</td>

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
            className={`px-4 py-2 rounded-lg transition-all shadow-sm ${currentPage === 1
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-700 text-white active:scale-[0.98]"
              }`}
          >
            Previous
          </button>
          <span className="text-slate-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg transition-all shadow-sm ${currentPage === totalPages
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-700 text-white active:scale-[0.98]"
              }`}
          >
            Next
          </button>
        </div>
      

        {showStatusPopup && statusToggleStudent && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Status Change</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to change the status of{" "}
                <strong>{statusToggleStudent.studentName}</strong> to{" "}
                <strong className={
                  statusToggleStudent.status === 'Certified'
                    ? "text-green-600"
                    : statusToggleStudent.status === 'active' || statusToggleStudent.status === 'true'
                      ? "text-red-600"
                      : "text-green-600"
                }>
                  {statusToggleStudent.status === 'active' || statusToggleStudent.status === 'true'
                    ? "Inactive"
                    : statusToggleStudent.status === 'Certified'
                      ? "Active"
                      : "Active"}
                </strong>?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelStatusToggle}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusToggle}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${statusToggleStudent.status === 'active' || statusToggleStudent.status === 'true'
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  {statusToggleStudent.status === 'active' || statusToggleStudent.status === 'true'
                    ? "Deactivate"
                    : statusToggleStudent.status === 'Certified'
                      ? "Activate"
                      : "Activate"}
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
    </div>  
      );
};

      export default StudentAdmissionList;
