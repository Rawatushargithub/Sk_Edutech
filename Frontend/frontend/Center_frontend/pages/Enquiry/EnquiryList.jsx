import React, { useEffect, useState } from "react";
import axios from "axios";
import { ReceiptText } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Search } from 'lucide-react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../../config";

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

  // Fetch enquiries from backend
  const fetchEnquiries = async (page = 1, searchTerm = "", filter = timeFilter, start = startDate, end = endDate) => {
    try {
      setLoading(true);
      const franchiseId = localStorage.getItem('franchiseID');
      
      if (!franchiseId) {
        toast.error("Franchise ID not found. Please login again.");
        return;
      }

      let url = `${API_BASE_URL}/api/v1/institute_enquiry?franchiseId=${franchiseId}&page=${page}&limit=${limit}&search=${searchTerm}`;

      if (filter !== "all") {
        url += `&timeFilter=${filter}`;
        if (filter === "custom" && start && end) {
          url += `&startDate=${start}&endDate=${end}`;
        }
      }

      const response = await axios.get(url);
console.log("Enquiry data fetched:", response.data);
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

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEnquiries(1, search, timeFilter, startDate, endDate);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      setCurrentPage(1);
      fetchEnquiries(1, "", timeFilter, startDate, endDate);
    }
  };

  // Open details below the clicked row
  const openDetails = (enquiry) => {
    // If the same enquiry is clicked, toggle the details (show/hide)
    if (selectedEnquiry && selectedEnquiry._id === enquiry._id) {
      setSelectedEnquiry(null);
    } else {
      setSelectedEnquiry(enquiry);
    }
  };

  // Handle delete
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

      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/institute_enquiry/${id}?franchiseId=${franchiseId}`
      );

      if (response.data.success) {
        toast.success("Enquiry deleted successfully!");
        // Refresh the current page
        fetchEnquiries(currentPage, search, timeFilter, startDate, endDate);
        // Clear selected enquiry if it was deleted
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

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#457B9D] px-8 py-4">
          <h1 className="text-2xl font-bold text-white">Student Enquiry List</h1>
        </div>

        {/* Search and Stats */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent w-64"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#3a6b8a] transition-colors"
              >
                Search
              </button>
            </form>

            {/* Time Filter */}
            <div className="flex items-center gap-4">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
              {timeFilter === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                  />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="text-sm text-gray-600">
              Total Enquiries: <span className="font-semibold">{totalEnquiries}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-8 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#457B9D]"></div>
              <span className="ml-2 text-gray-600">Loading enquiries...</span>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {search ? "No enquiries found matching your search." : "No enquiries found."}
            </div>
          ) : (
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Phone</th>
                  <th className="border px-4 py-2 text-left">DOB</th>
                  <th className="border px-4 py-2 text-left">City</th>
                  <th className="border px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <React.Fragment key={enquiry._id}>
                    <tr className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{enquiry.studentName}</td>
                      <td className="border px-4 py-2">{enquiry.email}</td>
                      <td className="border px-4 py-2">{enquiry.studentMobile}</td>
                      <td className="border px-4 py-2">{enquiry.dateOfBirth}</td>
                      <td className="border px-4 py-2">{enquiry.city}</td>
                      <td className="border px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => openDetails(enquiry)}
                          className="px-2 py-1 text-white rounded hover:bg-gray-100 transition-colors"
                          title="View Details"
                        >
                          <ReceiptText className="text-[#457B9D]"/>
                        </button>
                        <button
                          onClick={() => handleDelete(enquiry._id)}
                          className="px-2 py-1 hover:bg-gray-100 transition-colors"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="text-red-500"/>
                        </button>
                      </td>
                    </tr>

                    {/* Show Details below the row if the enquiry is selected */}
                    {selectedEnquiry && selectedEnquiry._id === enquiry._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="p-4">
                          <div className="p-4 bg-white rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-3">Full Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <p><strong>Name:</strong> {enquiry.studentName}</p>
                              <p><strong>Email:</strong> {enquiry.email}</p>
                              <p><strong>Phone:</strong> {enquiry.studentMobile}</p>
                              <p><strong>Date of Birth:</strong> {enquiry.dateOfBirth}</p>
                              <p><strong>Gender:</strong> {enquiry.gender}</p>
                              <p><strong>City:</strong> {enquiry.city}</p>
                              <p><strong>State:</strong> {enquiry.state}</p>
                              <p><strong>Permanent Address:</strong> {enquiry.permanentAddress}</p>
                              <p><strong>Enquiry Date:</strong> {enquiry.enquiryDate}</p>
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

        {/* Pagination */}
        {!loading && enquiries.length > 0 && totalPages > 1 && (
          <div className="px-8 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalEnquiries)} of {totalEnquiries} enquiries
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-[#457B9D] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryList;