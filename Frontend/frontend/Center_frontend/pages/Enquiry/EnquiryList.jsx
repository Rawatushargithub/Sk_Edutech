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

  // Tab and filter states
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
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

  // Active filters display (excluding tab which is handled separately)
  const [activeFilters, setActiveFilters] = useState([]);

  // Tab configuration
  const tabs = [
    { id: "all", label: "All Enquiries"},
    { id: "OPEN", label: "Open"},
    { id: "ON_HOLD", label: "On Hold"}
  ];

  // Get tab counts for better UX
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    OPEN: 0,
    ON_HOLD: 0
  });

  // Helper function to format date for API (ensures consistent timezone handling)
  const formatDateForAPI = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get date range based on filter
  const getDateRangeForFilter = (dateRange) => {
    const today = new Date();
    let startDate, endDate;

    switch(dateRange) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday);
        endDate = new Date(yesterday);
        break;
      case 'last7days':
        endDate = new Date(today);
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7); // Last 7 days including today
        break;
      case 'last30days':
        endDate = new Date(today);
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30); // Last 30 days including today
        break;
      default:
        return null;
    }

    return {
      startDate: formatDateForAPI(startDate),
      endDate: formatDateForAPI(endDate)
    };
  };

  const fetchEnquiries = async (page = 1, searchTerm = "", appliedFilters = filters, tab = activeTab) => {
    try {
      setLoading(true);
      const franchiseId = localStorage.getItem('franchiseID');
      if (!franchiseId) {
        toast.error("Franchise ID not found. Please login again.");
        return;
      }

      let queryParams = `franchiseId=${franchiseId}&page=${page}&limit=${limit}`;
      
      // Add search term
      if (searchTerm) {
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      // Add tab-based status filter
      if (tab !== "all") {
        queryParams += `&status=${tab}`;
      }

      // Add date range filters with proper handling
      if (appliedFilters.startDate && appliedFilters.endDate) {
        queryParams += `&startDate=${appliedFilters.startDate}&endDate=${appliedFilters.endDate}`;
      } else if (appliedFilters.dateRange && appliedFilters.dateRange !== "all" && appliedFilters.dateRange !== "custom") {
        const dateRange = getDateRangeForFilter(appliedFilters.dateRange);
        if (dateRange) {
          queryParams += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
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

  // Fetch tab counts with the SAME filters applied to main query
  const fetchTabCounts = async (searchTerm = search, appliedFilters = filters) => {
    try {
      const franchiseId = localStorage.getItem('franchiseID');
      if (!franchiseId) return;

      const promises = tabs.map(async (tab) => {
        let queryParams = `franchiseId=${franchiseId}&page=1&limit=1`; // Only need count
        
        // Add search term to count query
        if (searchTerm) {
          queryParams += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        // Add tab-based status filter
        if (tab.id !== "all") {
          queryParams += `&status=${tab.id}`;
        }

        // Add same date filters as main query
        if (appliedFilters.startDate && appliedFilters.endDate) {
          queryParams += `&startDate=${appliedFilters.startDate}&endDate=${appliedFilters.endDate}`;
        } else if (appliedFilters.dateRange && appliedFilters.dateRange !== "all" && appliedFilters.dateRange !== "custom") {
          const dateRange = getDateRangeForFilter(appliedFilters.dateRange);
          if (dateRange) {
            queryParams += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          }
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/v1/institute_enquiry?${queryParams}`);
        return { [tab.id]: response.data.pagination?.total || 0 };
      });

      const results = await Promise.all(promises);
      const counts = Object.assign({}, ...results);
      setTabCounts(counts);
    } catch (error) {
      console.error("Error fetching tab counts:", error);
    }
  };

  // Update active filters for display (excluding tab)
  const updateActiveFilters = (appliedFilters, searchTerm) => {
    const active = [];
    
    if (searchTerm) {
      active.push({ type: 'search', value: searchTerm, label: `Search: "${searchTerm}"` });
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

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    // Clear selected enquiry when switching tabs
    setSelectedEnquiry(null);
    // Fetch data for the new tab
    fetchEnquiries(1, search, filters, tabId);
  };

  // Remove individual filter
  const removeFilter = (filterType) => {
    const newFilters = { ...filters };
    
    if (filterType === 'search') {
      setSearch("");
      fetchEnquiries(1, "", filters, activeTab);
      fetchTabCounts("", filters);
    } else if (filterType === 'dateRange') {
      newFilters.dateRange = "all";
      newFilters.startDate = "";
      newFilters.endDate = "";
      setShowCustomDateRange(false);
      setFilters(newFilters);
      setCurrentPage(1);
      fetchEnquiries(1, search, newFilters, activeTab);
      fetchTabCounts(search, newFilters);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    const resetFilters = {
      dateRange: "all",
      startDate: "",
      endDate: ""
    };
    setFilters(resetFilters);
    setSearch("");
    setShowCustomDateRange(false);
    setCurrentPage(1);
    fetchEnquiries(1, "", resetFilters, activeTab);
    fetchTabCounts("", resetFilters);
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchEnquiries(1, search, filters, activeTab);
    fetchTabCounts(search, filters);
  };

  useEffect(() => {
    fetchEnquiries(1, search, filters, activeTab);
    fetchTabCounts(search, filters);
  }, []); // Only run on mount

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
      
      if (value !== "custom" && value !== "all") {
        // For preset ranges, calculate dates immediately but don't set startDate/endDate
        // The API call will handle the date range calculation
        newFilters.startDate = "";
        newFilters.endDate = "";
      } else if (value === "all") {
        newFilters.startDate = "";
        newFilters.endDate = "";
      }
      // For custom, keep existing startDate/endDate values
    }
    
    setFilters(newFilters);
    
    // Auto-apply non-custom filters
    if (filterType !== 'dateRange' || value !== 'custom') {
      setCurrentPage(1);
      fetchEnquiries(1, search, newFilters, activeTab);
      fetchTabCounts(search, newFilters);
    }
  };

  const handleCustomDateSubmit = () => {
    if (filters.startDate && filters.endDate) {
      setCurrentPage(1);
      fetchEnquiries(1, search, filters, activeTab);
      fetchTabCounts(search, filters);
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
        fetchEnquiries(currentPage, search, filters, activeTab);
        fetchTabCounts(search, filters); // Refresh tab counts with same filters
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
        fetchEnquiries(currentPage, search, filters, activeTab);
        fetchTabCounts(search, filters); // Refresh tab counts with same filters
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
    if (page !== currentPage) {
      setCurrentPage(page);
      fetchEnquiries(page, search, filters, activeTab);
    }
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

      const fileName = `Enquiry_List_${activeTab !== 'all' ? activeTab + '_' : ''}${new Date().toISOString().split('T')[0]}.xlsx`;
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
      const title = `Student Enquiry List${activeTab !== 'all' ? ` - ${tabs.find(t => t.id === activeTab)?.label}` : ''}`;
      doc.text(title, 14, 20);

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

      const fileName = `Enquiry_List_${activeTab !== 'all' ? activeTab + '_' : ''}${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Error exporting to PDF. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'OPEN': 'bg-green-100 text-green-800 border-green-200',
      'ON_HOLD': 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
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
        <div className="bg-gradient-to-r from-[#457B9D] to-[#5a8fb5] px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Student Enquiry Management</h1>
            <p className="text-blue-100 mt-1">Manage and track student enquiries efficiently</p>
          </div>
          
          {/* Export Button with Dropdown */}
          <div className="relative export-dropdown-container">
            <button
              className="bg-white text-[#457B9D] font-medium px-6 py-2 rounded-lg cursor-pointer flex items-center hover:bg-gray-50 transition-all duration-200 shadow-md"
              onClick={toggleExportDropdown}
            >
              Export
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                <div className="py-2">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={exportToExcel}
                  >
                    📊 Export to Excel
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={exportToPDF}
                  >
                    📄 Export to PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Classy Tabs Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-[#457B9D] text-[#457B9D] bg-blue-50/30'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-[#457B9D] text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tabCounts[tab.id] || 0}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="p-8 bg-gray-50 border-b border-gray-200 space-y-4">
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent w-full shadow-sm" 
                />
              </div>
              <button 
                type="submit" 
                className="px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#3a6b8a] transition-colors shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select 
                value={filters.dateRange} 
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] min-w-[140px] shadow-sm"
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
            <div className="flex items-center text-sm text-gray-600 whitespace-nowrap bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
              Showing: <span className="font-semibold ml-1 text-[#457B9D]">{totalEnquiries}</span> 
              <span className="ml-1">in "{tabs.find(t => t.id === activeTab)?.label}"</span>
            </div>
          </div>

          {/* Custom Date Range */}
          {showCustomDateRange && (
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">From:</label>
                <input 
                  type="date" 
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <input 
                  type="date" 
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                />
              </div>
              <button 
                onClick={handleCustomDateSubmit}
                className="px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#3a6b8a] transition-colors"
              >
                Apply Date Range
              </button>
            </div>
          )}

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-4 bg-white rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              {activeFilters.map((filter, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200"
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
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#457B9D]"></div>
              <span className="ml-3 text-gray-600 font-medium">Loading enquiries...</span>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Enquiries Found</h3>
              <p>
                {activeFilters.length > 0 || search ? 
                  "No enquiries match your current filters and search criteria." : 
                  `No ${activeTab === 'all' ? '' : tabs.find(t => t.id === activeTab)?.label.toLowerCase() || ''} enquiries found.`
                }
              </p>
              {(activeFilters.length > 0 || search) && (
                <button
                  onClick={clearAllFilters}
                  className="mt-3 px-4 py-2 text-sm text-[#457B9D] border border-[#457B9D] rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">S.No.</th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Enquiry ID</th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Student Name</th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Enquiry Date</th>
                    <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Hold Until</th>
                    <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enquiries.map((enquiry, index) => (
                    <React.Fragment key={enquiry._id}>
                      <tr className={`hover:bg-gray-50 cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`} onClick={() => openDetails(enquiry)}>
                        <td className="px-4 py-3 font-medium text-gray-700">{((currentPage - 1) * limit) + index + 1}</td>
                        <td className="px-4 py-3 font-medium text-[#457B9D]">{enquiry.enquiryId}</td>
                        <td className="px-4 py-3 font-medium">{enquiry.studentName}</td>
                        <td className="px-4 py-3">{getStatusBadge(enquiry.enquiryStatus)}</td>
                        <td className="px-4 py-3 text-gray-600">{enquiry.email}</td>
                        <td className="px-4 py-3 text-gray-600">{enquiry.studentMobile}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(enquiry.enquiryDate)}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {enquiry.holdUntilDate ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-orange-500" />
                              {formatDate(enquiry.holdUntilDate)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetails(enquiry);
                              }}
                              className="p-2 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openStatusUpdate(enquiry);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 transition-colors rounded-lg" 
                              title="Update Status"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(enquiry._id);
                              }} 
                              className="p-2 text-red-500 hover:bg-red-50 transition-colors rounded-lg" 
                              title="Delete Enquiry"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {selectedEnquiry && selectedEnquiry._id === enquiry._id && (
                        <tr className="bg-blue-50/50">
                          <td colSpan="9" className="p-6">
                            <div className="p-6 bg-white rounded-lg shadow-md border border-blue-200">
                              <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-800">Complete Enquiry Details</h3>
                                <span className="text-sm text-gray-500">ID: {enquiry.enquiryId}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Personal Information */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">Personal Information</h4>
                                  <p><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{enquiry.studentName}</span></p>
                                  <p><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{enquiry.email}</span></p>
                                  <p><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-900">{enquiry.studentMobile}</span></p>
                                  <p><span className="font-medium text-gray-700">Date of Birth:</span> <span className="text-gray-900">{formatDate(enquiry.dob)}</span></p>
                                  <p><span className="font-medium text-gray-700">Gender:</span> <span className="text-gray-900">{enquiry.gender}</span></p>
                                  <p><span className="font-medium text-gray-700">City:</span> <span className="text-gray-900">{enquiry.city}</span></p>
                                  <p><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-900">{enquiry.permanentAddress}</span></p>
                                </div>

                                {/* Enquiry Information */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">Enquiry Information</h4>
                                  <p><span className="font-medium text-gray-700">Enquiry Date:</span> <span className="text-gray-900">{formatDate(enquiry.enquiryDate)}</span></p>
                                  <p><span className="font-medium text-gray-700">Course:</span> <span className="text-gray-900">{enquiry.courseInterested?.courseName}</span></p>
                                  <p><span className="font-medium text-gray-700">Status:</span> <span className="ml-2">{getStatusBadge(enquiry.enquiryStatus)}</span></p>
                                  <p><span className="font-medium text-gray-700">Hold Until:</span> <span className="text-gray-900">{formatDate(enquiry.holdUntilDate)}</span></p>
                                  <p><span className="font-medium text-gray-700">Payment Mode:</span> <span className="text-gray-900">{enquiry.paymentMode}</span></p>
                                </div>

                                {/* Financial Information */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">Financial Details</h4>
                                  <p><span className="font-medium text-gray-700">Course Fees:</span> <span className="text-gray-900 font-semibold">Rs.{(enquiry.courseFees || 0).toLocaleString()}</span></p>
                                  <p><span className="font-medium text-gray-700">Discount:</span> <span className="text-green-600 font-semibold">Rs.{(enquiry.discountAmount || 0).toLocaleString()}</span></p>
                                  <p><span className="font-medium text-gray-700">Total Fees:</span> <span className="text-gray-900 font-semibold">Rs.{(enquiry.totalFees || 0).toLocaleString()}</span></p>
                                  <p><span className="font-medium text-gray-700">Fees Received:</span> <span className="text-blue-600 font-semibold">Rs.{(enquiry.feesReceived || 0).toLocaleString()}</span></p>
                                  <p><span className="font-medium text-gray-700">Balance:</span> <span className="text-red-600 font-semibold">Rs.{(enquiry.balance || 0).toLocaleString()}</span></p>
                                </div>
                              </div>
                              
                              {enquiry.remarks && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-2">Remarks</h4>
                                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{enquiry.remarks}</p>
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
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalEnquiries)} of {totalEnquiries} enquiries
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1} 
                  className={`px-4 py-2 rounded-lg transition-colors ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'}`}
                >
                  Previous
                </button>
                {getPageNumbers().map((page) => (
                  <button 
                    key={page} 
                    onClick={() => handlePageChange(page)} 
                    className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page ? 'bg-[#457B9D] text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'}`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages} 
                  className={`px-4 py-2 rounded-lg transition-colors ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'}`}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Update Status</h2>
                <p className="text-sm text-gray-600 mt-1">Change enquiry status and settings</p>
              </div>
              <button
                onClick={() => setShowStatusUpdate(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="OPEN">Open</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>

              {/* Hold Until Date - Required for ON_HOLD */}
              {statusUpdateData.enquiryStatus === 'ON_HOLD' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hold Until Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={statusUpdateData.holdUntilDate}
                    onChange={(e) => setStatusUpdateData({...statusUpdateData, holdUntilDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    This enquiry will be marked for follow-up on the selected date
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowStatusUpdate(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#3a6b8a] transition-colors shadow-md"
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