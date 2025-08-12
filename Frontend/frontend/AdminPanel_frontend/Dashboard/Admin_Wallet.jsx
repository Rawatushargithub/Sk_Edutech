import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaWallet, FaSearch } from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary

const AdminWalletApproval = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); 

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

  // Filter transactions by search query
  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.institute?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.paymentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction._id?.toLowerCase().includes(searchQuery.toLowerCase())
  );
console.log("filter transactions:: " , filteredTransactions)
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FaWallet className="mr-2" /> Wallet Transaction Approvals
        </h1>
        
        <div className="flex items-center">
          {/* Search box */}
          <div className="relative mr-4">
            <input
              type="text"
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search institute or payment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          {/* Filter dropdown */}
          <select
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Transactions</option>
          </select>
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
            <tbody className="bg-white divide-y divide-gray-200">
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