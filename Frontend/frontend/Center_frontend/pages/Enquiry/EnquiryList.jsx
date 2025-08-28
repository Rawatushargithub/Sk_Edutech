import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaTrash, FaEdit } from "react-icons/fa";
import { Search, AlertCircle, Clock, Calendar, ChevronDown, X } from 'lucide-react';
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

  // Enhanced filter states
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    startDate: "",
    endDate: ""
  });
  
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  // Status management states
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    enquiryId: null,
    enquiryStatus: '',
    holdUntilDate: '',
    remarks: ''
  });

  // Export states
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Active filters display
  const [activeFilters, setActiveFilters] = useState([]);

  const fetchEnquiries = async (page = 1, searchTerm = "", appliedFilters = filters) => {
    try {
      setLoading(true);
      const franchiseId = localStorage.getItem('franchiseID');
      if (!franchiseId) {
        toast.error("Franchise ID not found. Please login again.");
        return;
      }

      let queryParams = `franchiseId=${franchiseId}&page=${page}&limit=${limit}&search=${searchTerm}`;
      
      // Add status filter
      if (appliedFilters.status !== "all") {
        queryParams += `&status=${appliedFilters.status}`;
      }

      // Add date range filters
      if (appliedFilters.dateRange && appliedFilters.dateRange !== "all") {
        if (appliedFilters.dateRange === "custom" && appliedFilters.startDate && appliedFilters.endDate) {
          queryParams += `&startDate=${appliedFilters.startDate}&endDate=${appliedFilters.endDate}`;
        } else if (appliedFilters.dateRange !== "custom") {
          queryParams += `&dateRange=${appliedFilters.dateRange}`;
        }
      }

      console.log("Fetching with query params:", queryParams);

      const response = await axios.get(`${API_BASE_URL}/api/v1/institute_enquiry?${queryParams}`);

      if (response.data.success) {
        setEnquiries(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalEnquiries(response.data.pagination.total);
        setCurrentPage(response.data.pagination.page);
        updateActiveFilters(appliedFilters, searchTerm);
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

  // Update active filters for display
  const updateActiveFilters = (appliedFilters, searchTerm) => {
    const active = [];
    
    if (searchTerm) {
      active.push({ type: 'search', value: searchTerm, label: `Search: "${searchTerm}"` });
    }
    
    if (appliedFilters.status !== "all") {
      active.push({ 
        type: 'status', 
        value: appliedFilters.status, 
        label: `Status: ${appliedFilters.status.replace('_', ' ')}` 
      });
    }
    
    if (appliedFilters.dateRange !== "all") {
      if (appliedFilters.dateRange === "custom") {
        if (appliedFilters.startDate && appliedFilters.endDate) {
          active.push({ 
            type: 'dateRange', 
            value: 'custom', 
            label: `Date: ${appliedFilters.startDate} to ${appliedFilters.endDate}` 
          });
        }
      } else {
        const dateLabels = {
          'today': 'Today',
          'yesterday': 'Yesterday',
          'last7days': 'Last 7 Days',
          'last30days': 'Last 30 Days'
        };
        active.push({ 
          type: 'dateRange', 
          value: appliedFilters.dateRange, 
          label: `Date: ${dateLabels[appliedFilters.dateRange]}` 
        });
      }
    }
    
    setActiveFilters(active);
  };

  // Remove individual filter
  const removeFilter = (filterType) => {
    const newFilters = { ...filters };
    
    if (filterType === 'search') {
      setSearch("");
    } else if (filterType === 'status') {
      newFilters.status = "all";
    } else if (filterType === 'dateRange') {
      newFilters.dateRange = "all";
      newFilters.startDate = "";
      newFilters.endDate = "";
      setShowCustomDateRange(false);
    }
    
    setFilters(newFilters);
    setCurrentPage(1);
    fetchEnquiries(1, filterType === 'search' ? "" : search, newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const resetFilters = {
      status: "all",
      dateRange: "all",
      startDate: "",
      endDate: ""
    };
    setFilters(resetFilters);
    setSearch("");
    setShowCustomDateRange(false);
    setCurrentPage(1);
    fetchEnquiries(1, "", resetFilters);
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchEnquiries(1, search, filters);
  };

  useEffect(() => {
    fetchEnquiries(1, search, filters);
  }, []); // Only run on mount

  useEffect(() => {
    if (currentPage > 1) {
      fetchEnquiries(currentPage, search, filters);
    }
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    
    // Auto-search with debounce
    if (value === "") {
      applyFilters();
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    
    if (filterType === 'dateRange') {
      setShowCustomDateRange(value === "custom");
      if (value !== "custom") {
        newFilters.startDate = "";
        newFilters.endDate = "";
      }
    }
    
    setFilters(newFilters);
    
    // Auto-apply non-custom filters
    if (filterType !== 'dateRange' || value !== 'custom') {
      setCurrentPage(1);
      fetchEnquiries(1, search, newFilters);
    }
  };

  const handleCustomDateSubmit = () => {
    if (filters.startDate && filters.endDate) {
      setCurrentPage(1);
      fetchEnquiries(1, search, filters);
    } else {
      toast.error("Please select both start and end dates");
    }
  };

  // Enhanced status update functions
  const openStatusUpdate = (enquiry) => {
    setStatusUpdateData({
      enquiryId: enquiry._id,
      enquiryStatus: enquiry.enquiryStatus || 'OPEN',
      holdUntilDate: enquiry.holdUntilDate ? new Date(enquiry.holdUntilDate).toISOString().split('T')[0] : '',
      remarks: ''
    });
    setShowStatusUpdate(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      const franchiseId = localStorage.getItem('franchiseID');
      if (!franchiseId) {
        toast.error("Franchise ID not found. Please login again.");
        return;
      }

      // Validate required fields
      if (!statusUpdateData.enquiryStatus) {
        toast.error("Please select a status");
        return;
      }

      if (statusUpdateData.enquiryStatus === 'ON_HOLD' && !statusUpdateData.holdUntilDate) {
        toast.error("Hold until date is required when setting status to ON_HOLD");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/v1/institute_enquiry/${statusUpdateData.enquiryId}/status?franchiseId=${franchiseId}`,
        {
          enquiryStatus: statusUpdateData.enquiryStatus,
          holdUntilDate: statusUpdateData.holdUntilDate || null,
          remarks: statusUpdateData.remarks,
          changedBy: 'User'
        }
      );

      if (response.data.success) {
        toast.success("Status updated successfully!");
        setShowStatusUpdate(false);
        fetchEnquiries(currentPage, search, filters);
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMessage = error.response?.data?.message || "Error updating status";
      toast.error(errorMessage);
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
        fetchEnquiries(currentPage, search, filters);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    // Handle dd-mm-yyyy format
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      const date = new Date(`${year}-${month}-${day}`);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB');
      }
    }
    
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB');
      }
    } catch (error) {
      console.error("Date formatting error:", error);
    }
    
    return "Invalid Date";
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

  // Export Functions (keeping existing implementation)
  const prepareEnquiryExportData = (enquiriesData) => {
    return enquiriesData.map((enquiry, index) => ({
      'S/N': index + 1,
      'Enquiry ID': enquiry.enquiryId || '',
      'Student Name': enquiry.studentName || '',
      'Email': enquiry.email || '',
      'Phone': enquiry.studentMobile || '',
      'Date of Birth': formatDate(enquiry.dob),
      'Gender': enquiry.gender || '',
      'City': enquiry.city || '',
      'Address': enquiry.permanentAddress || '',
      'Enquiry Date': formatDate(enquiry.enquiryDate),
      'Course Interested': enquiry.courseInterested?.courseName || '',
      'Status': enquiry.enquiryStatus || '',
      'Hold Until Date': formatDate(enquiry.holdUntilDate),
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
      toast.info('Preparing Excel file...');

      const exportData = prepareEnquiryExportData(enquiries);
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();

      const colWidths = [
        { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 15 },
        { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 12 },
        { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }
      ];

      ws['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(wb, ws, 'Enquiries');

      const fileName = `Enquiry_List_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Error exporting to Excel. Please try again.');
    }
  };

  const exportToPDF = async () => {
    try {
      setShowExportDropdown(false);
      toast.info('Preparing PDF file...');

      const doc = new jsPDF('l', 'mm', 'a4');
      doc.setFontSize(16);
      doc.text('Student Enquiry List', 14, 20);

      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate}`, 14, 28);

      const exportData = prepareEnquiryExportData(enquiries);
      const columns = [
        'S/N', 'Enquiry ID', 'Student Name', 'Email', 'Phone', 'DOB',
        'Gender', 'City', 'Address', 'Enquiry Date', 'Course Interested',
        'Status', 'Hold Until Date', 'Course Fees', 'Discount Amount',
        'Total Fees', 'Fees Received', 'Balance', 'Payment Mode', 'Remarks'
      ];

      const rows = exportData.map(enquiry => [
        enquiry['S/N'], enquiry['Enquiry ID'], enquiry['Student Name'],
        enquiry['Email'], enquiry['Phone'], enquiry['Date of Birth'],
        enquiry['Gender'], enquiry['City'], enquiry['Address'],
        enquiry['Enquiry Date'], enquiry['Course Interested'], enquiry['Status'],
        enquiry['Hold Until Date'], enquiry['Course Fees'], enquiry['Discount Amount'],
        enquiry['Total Fees'], enquiry['Fees Received'], enquiry['Balance'],
        enquiry['Payment Mode'], enquiry['Remarks']
      ]);

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 35,
        styles: { fontSize: 6 },
        headStyles: { fillColor: [69, 123, 157] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35, right: 10, bottom: 20, left: 10 }
      });

      const fileName = `Enquiry_List_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Error exporting to PDF. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'OPEN': 'bg-blue-100 text-blue-800',
      'ON_HOLD': 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ') || 'N/A'}
      </span>
    );
  };

  const toggleExportDropdown = () => {
    setShowExportDropdown(!showExportDropdown);
  };

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
      <ToastContainer position="top-right" />
      
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#457B9D] px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Student Enquiry List</h1>
          
          {/* Export Button with Dropdown */}
          <div className="relative export-dropdown-container">
            <button
              className="bg-white text-[#457B9D] font-medium px-4 py-2 rounded-md cursor-pointer flex items-center hover:bg-gray-100 transition-colors"
              onClick={toggleExportDropdown}
            >
              Export
              <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={exportToExcel}
                  >
                    📊 Export to Excel
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={exportToPDF}
                  >
                    📄 Export to PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="p-8 border-b border-gray-200 space-y-4">
          {/* Main Filter Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search by name, email, phone, or enquiry ID..." 
                  value={search} 
                  onChange={handleSearchChange} 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent w-full" 
                />
              </div>
              <button 
                type="submit" 
                className="px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#3a6b8a] transition-colors"
              >
                Search
              </button>
            </form>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</label>
              <select 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] min-w-[120px]"
              >
                <option value="all">All Status</option>
                <option value="OPEN">Open</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select 
                value={filters.dateRange} 
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] min-w-[140px]"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Total Count */}
            <div className="flex items-center text-sm text-gray-600 whitespace-nowrap">
              Total: <span className="font-semibold ml-1">{totalEnquiries}</span>
            </div>
          </div>

          {/* Custom Date Range */}
          {showCustomDateRange && (
            <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input 
                type="date" 
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
              />
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input 
                type="date" 
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
              />
              <button 
                onClick={handleCustomDateSubmit}
                className="px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#3a6b8a] transition-colors"
              >
                Apply
              </button>
            </div>
          )}

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              {activeFilters.map((filter, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {filter.label}
                  <button
                    onClick={() => removeFilter(filter.type)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded-full hover:bg-red-50 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="p-8 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#457B9D]"></div>
              <span className="ml-2 text-gray-600">Loading enquiries...</span>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              {activeFilters.length > 0 ? 
                "No enquiries found matching your filters." : 
                "No enquiries found."
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-4 py-3 text-left font-semibold">Enquiry ID</th>
                    <th className="border px-4 py-3 text-left font-semibold">Name</th>
                    <th className="border px-4 py-3 text-left font-semibold">Status</th>
                    <th className="border px-4 py-3 text-left font-semibold">Email</th>
                    <th className="border px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="border px-4 py-3 text-left font-semibold">Enquiry Date</th>
                    <th className="border px-4 py-3 text-left font-semibold">Hold Until</th>
                    <th className="border px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enquiry) => (
                    <React.Fragment key={enquiry._id}>
                      <tr className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => openDetails(enquiry)}>
                        <td className="border px-4 py-3 font-medium">{enquiry.enquiryId}</td>
                        <td className="border px-4 py-3">{enquiry.studentName}</td>
                        <td className="border px-4 py-3">{getStatusBadge(enquiry.enquiryStatus)}</td>
                        <td className="border px-4 py-3">{enquiry.email}</td>
                        <td className="border px-4 py-3">{enquiry.studentMobile}</td>
                        <td className="border px-4 py-3">{formatDate(enquiry.enquiryDate)}</td>
                        <td className="border px-4 py-3">{formatDate(enquiry.holdUntilDate)}</td>
                        <td className="border px-4 py-3 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetails(enquiry);
                              }}
                              className="p-2 text-blue-500 rounded hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openStatusUpdate(enquiry);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 transition-colors" 
                              title="Update Status"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(enquiry._id);
                              }} 
                              className="p-2 text-red-500 hover:bg-red-50 transition-colors" 
                              title="Delete Enquiry"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {selectedEnquiry && selectedEnquiry._id === enquiry._id && (
                        <tr className="bg-gray-50">
                          <td colSpan="8" className="p-4">
                            <div className="p-6 bg-white rounded-lg shadow-md">
                              <h3 className="text-lg font-semibold mb-4 text-gray-800">Full Details</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-3">
                                  <p><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{enquiry.studentName}</span></p>
                                  <p><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{enquiry.email}</span></p>
                                  <p><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-900">{enquiry.studentMobile}</span></p>
                                  <p><span className="font-medium text-gray-700">Date of Birth:</span> <span className="text-gray-900">{formatDate(enquiry.dob)}</span></p>
                                  <p><span className="font-medium text-gray-700">Gender:</span> <span className="text-gray-900">{enquiry.gender}</span></p>
                                  <p><span className="font-medium text-gray-700">City:</span> <span className="text-gray-900">{enquiry.city}</span></p>
                                </div>
                                <div className="space-y-3">
                                  <p><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-900">{enquiry.permanentAddress}</span></p>
                                  <p><span className="font-medium text-gray-700">Enquiry Date:</span> <span className="text-gray-900">{formatDate(enquiry.enquiryDate)}</span></p>
                                  <p><span className="font-medium text-gray-700">Course:</span> <span className="text-gray-900">{enquiry.courseInterested?.courseName}</span></p>
                                  <p><span className="font-medium text-gray-700">Status:</span> <span className="ml-2">{getStatusBadge(enquiry.enquiryStatus)}</span></p>
                                  <p><span className="font-medium text-gray-700">Hold Until:</span> <span className="text-gray-900">{formatDate(enquiry.holdUntilDate)}</span></p>
                                  <p><span className="font-medium text-gray-700">Payment Mode:</span> <span className="text-gray-900">{enquiry.paymentMode}</span></p>
                                </div>
                                <div className="space-y-3">
                                  <p><span className="font-medium text-gray-700">Course Fees:</span> <span className="text-gray-900">Rs.{(enquiry.courseFees || 0).toLocaleString()}</span></p>
                                  <p><span className="font-medium text-gray-700">Discount:</span> <span className="text-gray-900">Rs.{(enquiry.discountAmount || 0).toLocaleString()}</span></p>
                                  <p><span className="font-medium text-gray-700">Total Fees:</span> <span className="text-gray-900">Rs.{(enquiry.totalFees || 0).toLocaleString()}</span></p>
                                  <p><span className="font-medium text-gray-700">Fees Received:</span> <span className="text-gray-900">Rs.{(enquiry.feesReceived || 0).toLocaleString()}</span></p>
                                  <p><span className="font-medium text-gray-700">Balance:</span> <span className="text-gray-900">Rs.{(enquiry.balance || 0).toLocaleString()}</span></p>
                                </div>
                              </div>
                              {enquiry.remarks && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <p><span className="font-medium text-gray-700">Remarks:</span></p>
                                  <p className="text-gray-900 mt-1">{enquiry.remarks}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && enquiries.length > 0 && totalPages > 1 && (
          <div className="px-8 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalEnquiries)} of {totalEnquiries} enquiries
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1} 
                  className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                {getPageNumbers().map((page) => (
                  <button 
                    key={page} 
                    onClick={() => handlePageChange(page)} 
                    className={`px-3 py-1 rounded ${currentPage === page ? 'bg-[#457B9D] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages} 
                  className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Status Update Modal */}
      {showStatusUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Update Enquiry Status</h2>
              <button
                onClick={() => setShowStatusUpdate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={statusUpdateData.enquiryStatus}
                  onChange={(e) => setStatusUpdateData({...statusUpdateData, enquiryStatus: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="OPEN">Open</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>

              {/* Hold Until Date - Required for ON_HOLD */}
              {statusUpdateData.enquiryStatus === 'ON_HOLD' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hold Until Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={statusUpdateData.holdUntilDate}
                    onChange={(e) => setStatusUpdateData({...statusUpdateData, holdUntilDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500 mt-1">Date when the enquiry should be contacted again</p>
                </div>
              )}


              {/* Remarks */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={statusUpdateData.remarks}
                  onChange={(e) => setStatusUpdateData({...statusUpdateData, remarks: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                  rows="3"
                  placeholder="Add any remarks about this status change..."
                />
              </div> */}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStatusUpdate(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#3a6b8a] transition-colors"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryList;
