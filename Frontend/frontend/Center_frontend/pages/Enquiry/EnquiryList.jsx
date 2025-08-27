import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaTrash } from "react-icons/fa";
import { Search } from 'lucide-react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../../config";
// Import for Excel export
import * as XLSX from 'xlsx';
// Import for PDF export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EnquiryList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [limit] = useState(10);
  const [timeFilter, setTimeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Export states
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const fetchEnquiries = async (page = 1, searchTerm = "") => {

    try {
      setLoading(true);
      const franchiseId = localStorage.getItem('franchiseID');
      if (!franchiseId) {
        toast.error("Franchise ID not found. Please login again.");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/institute_enquiry?franchiseId=${franchiseId}&page=${page}&limit=${limit}&search=${searchTerm}`);

      if (response.data.success) {
        setEnquiries(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalEnquiries(response.data.pagination.total);
        setCurrentPage(response.data.pagination.page);
      } else {
        toast.error(response.data.message || "Failed to fetch enquiries");
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      const errorMessage = error.response?.data?.message || "Error fetching enquiries";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries(1, search, timeFilter, startDate, endDate);
  }, [search, timeFilter, startDate, endDate]);

  useEffect(() => {
    fetchEnquiries(currentPage, search, timeFilter, startDate, endDate);
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEnquiries(1, search, timeFilter, startDate, endDate);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      setCurrentPage(1);
      fetchEnquiries(1, "", timeFilter, startDate, endDate);
    }
  };

  const openDetails = (enquiry) => {
    if (selectedEnquiry && selectedEnquiry._id === enquiry._id) {
      setSelectedEnquiry(null);
    } else {
      setSelectedEnquiry(enquiry);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) {
      return;
    }
    try {
      const franchiseId = localStorage.getItem('franchiseID');
      if (!franchiseId) {
        toast.error("Franchise ID not found. Please login again.");
        return;
      }
      const response = await axios.delete(`${API_BASE_URL}/api/v1/institute_enquiry/${id}?franchiseId=${franchiseId}`);
      if (response.data.success) {
        toast.success("Enquiry deleted successfully!");

        fetchEnquiries(currentPage, search);


        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry(null);
        }
      } else {
        toast.error(response.data.message || "Failed to delete enquiry");
      }
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      const errorMessage = error.response?.data?.message || "Error deleting enquiry";
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDOB = (dob) => {
    if (!dob) return "N/A";
    const date = new Date(dob);
    return date.toLocaleDateString("en-GB");
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Export Functions
  const prepareEnquiryExportData = (enquiriesData) => {
    return enquiriesData.map((enquiry, index) => ({
      'S/N': index + 1,
      'Enquiry ID': enquiry.enquiryId || '',
      'Student Name': enquiry.studentName || '',
      'Email': enquiry.email || '',
      'Phone': enquiry.studentMobile || '',
      'Date of Birth': formatDOB(enquiry.dob),
      'Gender': enquiry.gender || '',
      'City': enquiry.city || '',
      'Address': enquiry.permanentAddress || '',
      'Enquiry Date': formatDOB(enquiry.enquiryDate),
      'Course Interested': enquiry.courseInterested?.courseName || '',
      'Course Fees': `Rs.${(enquiry.courseFees || 0).toLocaleString()}`,
      'Discount Amount': `Rs.${(enquiry.discountAmount || 0).toLocaleString()}`,
      'Total Fees': `Rs.${(enquiry.totalFees || 0).toLocaleString()}`,
      'Fees Received': `Rs.${(enquiry.feesReceived || 0).toLocaleString()}`,
      'Balance': `Rs.${(enquiry.balance || 0).toLocaleString()}`,
      'Payment Mode': enquiry.paymentMode || '',
      'Remarks': enquiry.remarks || '',
    }));
  };

  const exportToExcel = async () => {
    try {
      setShowExportDropdown(false);
      alert('Preparing Excel file... This may take a moment.');

      const exportData = prepareEnquiryExportData(enquiries);

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();

      // Set column widths
      const colWidths = [
        { wch: 5 },   // S/N
        { wch: 15 },  // Enquiry ID
        { wch: 25 },  // Student Name
        { wch: 30 },  // Email
        { wch: 15 },  // Phone
        { wch: 12 },  // DOB
        { wch: 10 },  // Gender
        { wch: 15 },  // City
        { wch: 40 },  // Address
        { wch: 12 },  // Enquiry Date
        { wch: 25 },  // Course Interested
        { wch: 15 },  // Course Fees
        { wch: 15 },  // Discount Amount
        { wch: 15 },  // Total Fees
        { wch: 15 },  // Fees Received
        { wch: 15 },  // Balance
        { wch: 15 },  // Payment Mode
        { wch: 30 },  // Remarks
      ];

      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Enquiries');

      const fileName = `Enquiry_List_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert(`Excel file "${fileName}" has been downloaded successfully!`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  const exportToPDF = async () => {
    try {
      setShowExportDropdown(false);
      alert('Preparing PDF file... This may take a moment.');

      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation

      // Add title
      doc.setFontSize(16);
      doc.text('Student Enquiry List', 14, 20);

      // Add date
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate}`, 14, 28);

      const exportData = prepareEnquiryExportData(enquiries);

      // Define all columns for PDF (complete details)
      const columns = [
        'S/N',
        'Enquiry ID',
        'Student Name',
        'Email',
        'Phone',
        'DOB',
        'Gender',
        'City',
        'Address',
        'Enquiry Date',
        'Course Interested',
        'Course Fees',
        'Discount Amount',
        'Total Fees',
        'Fees Received',
        'Balance',
        'Payment Mode',
        'Remarks'
      ];

      const rows = exportData.map(enquiry => [
        enquiry['S/N'],
        enquiry['Enquiry ID'],
        enquiry['Student Name'],
        enquiry['Email'],
        enquiry['Phone'],
        enquiry['Date of Birth'],
        enquiry['Gender'],
        enquiry['City'],
        enquiry['Address'],
        enquiry['Enquiry Date'],
        enquiry['Course Interested'],
        enquiry['Course Fees'],
        enquiry['Discount Amount'],
        enquiry['Total Fees'],
        enquiry['Fees Received'],
        enquiry['Balance'],
        enquiry['Payment Mode'],
        enquiry['Remarks']
      ]);

      // Add table using autoTable
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 35,
        styles: { fontSize: 6 }, // Smaller font to fit more columns
        headStyles: { fillColor: [69, 123, 157] }, // Using the same blue color as the header
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35, right: 10, bottom: 20, left: 10 },
        columnStyles: {
          0: { cellWidth: 8 },   // S/N
          1: { cellWidth: 15 },  // Enquiry ID
          2: { cellWidth: 20 },  // Student Name
          3: { cellWidth: 25 },  // Email
          4: { cellWidth: 15 },  // Phone
          5: { cellWidth: 12 },  // DOB
          6: { cellWidth: 10 },  // Gender
          7: { cellWidth: 15 },  // City
          8: { cellWidth: 25 },  // Address
          9: { cellWidth: 12 },  // Enquiry Date
          10: { cellWidth: 20 }, // Course Interested
          11: { cellWidth: 15 }, // Course Fees
          12: { cellWidth: 15 }, // Discount Amount
          13: { cellWidth: 15 }, // Total Fees
          14: { cellWidth: 15 }, // Fees Received
          15: { cellWidth: 15 }, // Balance
          16: { cellWidth: 12 }, // Payment Mode
          17: { cellWidth: 20 }, // Remarks
        }
      });

      const fileName = `Enquiry_List_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      alert(`PDF file "${fileName}" has been downloaded successfully!`);
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#457B9D] px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Student Enquiry List</h1>

          {/* Export Button with Dropdown */}
          <div className="relative export-dropdown-container">
            <button
              className="bg-white text-[#457B9D] font-medium px-4 py-2 rounded-md cursor-pointer flex items-center hover:bg-gray-100 transition-colors"
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
        <div className="p-8 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" /><input type="text" placeholder="Search by name, email, or phone..." value={search} onChange={handleSearchChange} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent w-64" /></div>
              <button type="submit" className="px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#3a6b8a] transition-colors">Search</button>
            </form>

            <div className="text-sm text-gray-600">Total Enquiries: <span className="font-semibold">{totalEnquiries}</span></div>

          </div>
        </div>
        <div className="p-8 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#457B9D]"></div><span className="ml-2 text-gray-600">Loading enquiries...</span></div>
          ) : enquiries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{search ? "No enquiries found matching your search." : "No enquiries found."}</div>
          ) : (
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2 text-left">Enquiry ID</th>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Phone</th>
                  <th className="border px-4 py-2 text-left">Enquiry Date</th>
                  <th className="border px-4 py-2 text-left">City</th>
                  <th className="border px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <React.Fragment key={enquiry._id}>
                    <tr className="hover:bg-gray-100" onClick={() => openDetails(enquiry)}>
                      <td className="border px-4 py-2">{enquiry.enquiryId}</td>
                      <td className="border px-4 py-2">{enquiry.studentName}</td>
                      <td className="border px-4 py-2">{enquiry.email}</td>
                      <td className="border px-4 py-2">{enquiry.studentMobile}</td>
                      <td className="border px-4 py-2">{(enquiry.enquiryDate)}</td>
                      <td className="border px-4 py-2">{enquiry.city}</td>
                      <td className="border px-4 py-2 text-center space-x-2">
                        <button onClick={() => openDetails(enquiry)}
                          className="px-2 py-1 text-blue-500 rounded hover:bg-gray-100 transition-colors"
                          title="View Details">
                          <FaEye />
                        </button>
                        <button onClick={() => handleDelete(enquiry._id)} 
                        className="px-2 py-1 text-red-500 hover:bg-gray-100 transition-colors" 
                        title="Delete Enquiry">
                          <FaTrash />
                          </button>
                      </td>
                    </tr>
                    {selectedEnquiry && selectedEnquiry._id === enquiry._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="p-4">
                          <div className="p-4 bg-white rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-3">Full Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <p><strong>Name:</strong> {enquiry.studentName}</p>
                              <p><strong>Email:</strong> {enquiry.email}</p>
                              <p><strong>Phone:</strong> {enquiry.studentMobile}</p>
                              <p><strong>Date of Birth:</strong> {formatDOB(enquiry.dob)}</p>
                              <p><strong>Gender:</strong> {enquiry.gender}</p>
                              <p><strong>City:</strong> {enquiry.city}</p>
                              <p><strong>Permanent Address:</strong> {enquiry.permanentAddress}</p>
                              <p><strong>Enquiry Date:</strong> {(enquiry.enquiryDate)}</p>
                              <p><strong>Course Interested:</strong> {enquiry.courseInterested.courseName}</p>
                              <p><strong>Course Fees:</strong> {enquiry.courseFees}</p>
                              <p><strong>Discount Amount:</strong> {enquiry.discountAmount}</p>
                              <p><strong>Total Fees:</strong> {enquiry.totalFees}</p>
                              <p><strong>Fees Received:</strong> {enquiry.feesReceived}</p>
                              <p><strong>Balance:</strong> {enquiry.balance}</p>
                              <p><strong>Payment Mode:</strong> {enquiry.paymentMode}</p>
                              <p><strong>Remarks:</strong> {enquiry.remarks}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && enquiries.length > 0 && totalPages > 1 && (
          <div className="px-8 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalEnquiries)} of {totalEnquiries} enquiries</div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Previous</button>
                {getPageNumbers().map((page) => (<button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-1 rounded ${currentPage === page ? 'bg-[#457B9D] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{page}</button>))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryList;
