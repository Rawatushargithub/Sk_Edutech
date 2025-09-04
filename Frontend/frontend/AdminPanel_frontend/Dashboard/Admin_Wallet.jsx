import React, { useState, useEffect, useMemo } from "react";
import { FaCheckCircle, FaTimesCircle, FaWallet, FaSearch } from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary
// Import for Excel export
import * as XLSX from 'xlsx';
// Import for PDF export 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminWalletApproval = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending_approval');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('institute'); // 'all', 'institute', 'student'
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  useEffect(() => {
    fetchTransactions(); 
  }, [filter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/adminwallet/transactions?status=${filter}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (transactionId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/v1/adminwallet/transactions/${transactionId}/approve`);
      setTransactions(
        transactions.map((transaction) =>
          transaction._id === transactionId
            ? { ...transaction, status: "approved" }
            : transaction
        )
      );
    } catch (error) {
      alert("Failed to approve transaction");
    }
  };

  const handleReject = async (transactionId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/v1/adminwallet/transactions/${transactionId}/reject`);
      setTransactions(
        transactions.map((transaction) =>
          transaction._id === transactionId
            ? { ...transaction, status: "rejected" }
            : transaction
        )
      );
    } catch (error) {
      alert("Failed to reject transaction");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Date filtering logic
  const isDateInRange = (date, timeFilter, startDate, endDate) => {
    if (!date) return true;

    const itemDate = new Date(date);
    if (isNaN(itemDate.getTime())) return false;

    if (timeFilter === 'all') {
      return true;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (timeFilter) {
      case 'today':
        return itemDate >= today;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return itemDate >= yesterday && itemDate < today;
      case 'last7days':
        const last7days = new Date(today);
        last7days.setDate(today.getDate() - 7);
        return itemDate >= last7days;
      case 'last30days':
        const last30days = new Date(today);
        last30days.setDate(today.getDate() - 30);
        return itemDate >= last30days;
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return itemDate >= start && itemDate <= end;
        }
        return true;
      default:
        return true;
    }
  };

  // Combined filtering
  const filteredTransactions = useMemo(() => {
    console.log('Filtering transactions. Current filter states:', { 
      status: filter, 
      type: transactionTypeFilter, 
      time: timeFilter, 
      search: searchQuery 
    });
    console.log('Raw transactions:', transactions);

    const result = transactions.filter(transaction => {
      // Status filter
      const statusMatch = filter === 'all' || transaction.status === filter;
      
      // Transaction type filter based on paymentId
      const typeMatch = (() => {
        if (transactionTypeFilter === 'all') return true;
        if (transactionTypeFilter === 'institute') {
          return transaction.paymentId && transaction.paymentId !== 'N/A';
        }
        if (transactionTypeFilter === 'student') {
          return !transaction.paymentId || transaction.paymentId === 'N/A';
        }
        return true;
      })();
      
      // Date filter
      const dateMatch = isDateInRange(transaction.timestamp, timeFilter, startDate, endDate);
      
      // Search filter
      const searchMatch = 
        !searchQuery ||
        (transaction.franchise?.franchiseName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transaction.paymentId?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transaction._id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transaction.amount?.toString().toLowerCase().includes(searchQuery.toLowerCase()));

      return statusMatch && typeMatch && dateMatch && searchMatch;
    });

    console.log('Filtered transactions:', result);
    return result;
  }, [transactions, filter, transactionTypeFilter, timeFilter, startDate, endDate, searchQuery]);

  // Get filter display text for export filenames
  const getFilterDisplayText = () => {
    const statusText = filter === 'all' ? 'All_Statuses' : filter.replace('_', '_');
    const typeText = transactionTypeFilter === 'all' ? 'All_Types' : transactionTypeFilter;
    const timeText = timeFilter === 'all' ? 'All_Time' : 
                    timeFilter === 'today' ? 'Today' :
                    timeFilter === 'yesterday' ? 'Yesterday' :
                    timeFilter === 'last7days' ? 'Last_7_Days' :
                    timeFilter === 'last30days' ? 'Last_30_Days' :
                    timeFilter === 'custom' ? 'Custom_Range' : timeFilter;
    return `${statusText}_${typeText}_${timeText}`;
  };

  // Prepare export data for admin wallet transactions
  const prepareExportData = (transactionsData) => {
    return transactionsData.map((transaction, index) => ({
      'S/N': index + 1,
      'Date': formatDate(transaction.timestamp),
      'Institute': transaction?.franchise?.franchiseName || 'N/A',
      'Amount': `Rs.${transaction.amount}`,
      'Payment ID': transaction.paymentId || 'N/A',
      'Type': transaction.paymentId && transaction.paymentId !== 'N/A' ? 'Institute' : 'Student',
      'Status': transaction.status?.replace("_", " ").toUpperCase() || 'N/A',
      'Transaction ID': transaction._id || 'N/A',
    }));
  };

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      setShowExportDropdown(false);
      alert('Preparing Excel file... This may take a moment.');

      const exportData = prepareExportData(filteredTransactions);
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      
      // Set column widths
      const colWidths = [
        { wch: 5 },   // S/N
        { wch: 20 },  // Date
        { wch: 25 },  // Institute
        { wch: 15 },  // Amount
        { wch: 20 },  // Payment ID
        { wch: 12 },  // Type
        { wch: 15 },  // Status
        { wch: 25 },  // Transaction ID
      ];
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, "Admin_Wallet_Transactions");
      
      // Generate filename with current date and filters
      const currentDate = new Date().toISOString().split('T')[0];
      const filterText = getFilterDisplayText();
      const fileName = `Admin_Wallet_Transactions_${filterText}_${currentDate}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      
      alert(`Excel file "${fileName}" has been downloaded successfully with ${exportData.length} transaction records!`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  // Export to PDF function
  const exportToPDF = async () => {
    try {
      setShowExportDropdown(false);
      alert('Preparing PDF file... This may take a moment.');

      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      // Add title
      doc.setFontSize(16);
      doc.text('Admin Wallet Transaction Report', 14, 20);
      
      // Add filter info and date
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Status Filter: ${filter === 'all' ? 'All Statuses' : filter.replace('_', ' ')}`, 14, 28);
      doc.text(`Type Filter: ${transactionTypeFilter}`, 14, 34);
      doc.text(`Time Filter: ${timeFilter === 'all' ? 'All Time' : timeFilter}`, 14, 40);
      doc.text(`Generated on: ${currentDate}`, 14, 46);
      
      // Prepare data for PDF table
      const exportData = prepareExportData(filteredTransactions);
      
      // Define columns for PDF (selecting key columns to fit better)
      const columns = [
        'S/N',
        'Date',
        'Institute',
        'Amount',
        'Payment ID',
        'Type',
        'Status'
      ];
      
      const rows = exportData.map(transaction => [
        transaction['S/N'],
        transaction['Date'],
        transaction['Institute'],
        transaction['Amount'],
        transaction['Payment ID'],
        transaction['Type'],
        transaction['Status']
      ]);

      // Add table using autoTable
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 52,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 52, right: 14, bottom: 20, left: 14 },
        columnStyles: {
          0: { cellWidth: 12 }, // S/N column - short
          1: { cellWidth: 35 }, // Date column
          2: { cellWidth: 40 }, // Institute column
          3: { cellWidth: 20 }, // Amount column
          4: { cellWidth: 30 }, // Payment ID column
          5: { cellWidth: 18 }, // Type column
          6: { cellWidth: 25 }, // Status column
        }
      });

      // Generate filename with current date and filters
      const currentDate2 = new Date().toISOString().split('T')[0];
      const filterText = getFilterDisplayText();
      const fileName = `Admin_Wallet_Transactions_${filterText}_${currentDate2}.pdf`;
      
      doc.save(fileName);
      
      alert(`PDF file "${fileName}" has been downloaded successfully with ${filteredTransactions.length} transaction records!`);
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FaWallet className="mr-2" /> Wallet Transaction Approvals
        </h1>
        
        {/* Export Button with Dropdown */}
        <div className="relative export-dropdown-container">
          <button 
            className="bg-sky-900 text-white font-medium px-4 py-2 rounded-md cursor-pointer flex items-center"
            onClick={toggleExportDropdown}
          >
            Export Transactions
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
      <div className="flex justify-between items-center mb-4">
        {/* Search input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by institute, amount, or ID..."
            className="border rounded-lg px-4 py-2 w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Time Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="timeFilter" className="font-semibold">Show:</label>
          <select
            id="timeFilter"
            className="border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
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
                className="border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span>-</span>
              <input
                type="date"
                className="border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-start items-center mb-4 space-x-2">
        {/* Filter cards */}
        <div className="flex border rounded-lg overflow-hidden">
          {[
            { value: 'all', label: 'All Statuses' },
            { value: 'pending_approval', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ].map((item, index) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 text-sm font-medium focus:outline-none ${ 
                filter === item.value
                  ? 'bg-gray-400 text-gray-900'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${index < 3 ? 'border-r border-gray-200' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex border rounded-lg overflow-hidden">
            <button
                onClick={() => setTransactionTypeFilter('all')}
                className={`px-4 py-2 text-sm font-medium focus:outline-none ${ 
                transactionTypeFilter === 'all'
                    ? 'bg-gray-400 text-gray-900'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-r border-gray-200`}
            >
                All Types
            </button>
            <button
                onClick={() => setTransactionTypeFilter('institute')}
                className={`px-4 py-2 text-sm font-medium focus:outline-none ${ 
                transactionTypeFilter === 'institute'
                    ? 'bg-gray-400 text-gray-900'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-r border-gray-200`}
            >
                Institute
            </button>
            <button
                onClick={() => setTransactionTypeFilter('student')}
                className={`px-4 py-2 text-sm font-medium focus:outline-none ${ 
                transactionTypeFilter === 'student'
                    ? 'bg-gray-400 text-gray-900'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
                Student
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No transactions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-y-auto h-[70vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institute
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 ">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction?.franchise?.franchiseName}</div>
                    <div className="text-sm text-gray-500">{transaction.institute?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">₹{transaction.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.paymentId || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "pending_approval"
                          ? "bg-yellow-100 text-yellow-800"
                          : transaction.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {transaction.status === "pending_approval" ? "Pending Approval" : transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {transaction.status === "pending_approval" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(transaction._id)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <FaCheckCircle className="mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(transaction._id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <FaTimesCircle className="mr-1" /> Reject
                        </button>
                      </div>
                    )}
                    {(transaction.status === "approved" || transaction.status === "rejected") && (
                      <span className="text-gray-500">No actions available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminWalletApproval;