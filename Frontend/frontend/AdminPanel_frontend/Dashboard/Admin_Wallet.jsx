import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaWallet, FaSearch } from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary

const AdminWalletApproval = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending_approval');
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
  const filteredTransactions = transactions
    .filter(transaction => isDateInRange(transaction.timestamp, timeFilter, startDate, endDate))
    .filter(
      (transaction) =>
                (transaction.franchise?.franchiseName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transaction.institute?.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transaction.paymentId?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transaction._id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transaction.amount?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FaWallet className="mr-2" /> Wallet Transaction Approvals
        </h1>
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
      <div className="flex justify-between items-center mb-4">
        {/* Filter cards */}
        <div className="flex border rounded-lg overflow-hidden mb-4 w-full">
          {[
            { value: 'all', label: 'All Transactions' },
            { value: 'pending_approval', label: 'Pending Approval' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ].map((item, index) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`flex-1 px-4 py-2 text-sm font-medium focus:outline-none ${ 
                filter === item.value
                  ? 'bg-gray-400 text-gray-900'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${index < 3 ? 'border-r border-gray-200' : ''}`}
            >
              {item.label}
            </button>
          ))}
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
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