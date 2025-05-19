import React, { useState, useEffect } from "react";
import { FaWallet, FaHistory, FaArrowLeft, FaRupeeSign } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Wallet = () => {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState({
    balance: 0,
    transactions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("institute-upi@ybl"); // Pre-filled UPI ID
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/api/v1/institute_wallet/balance");
        setWalletData(response.data);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  // Handle add money form submission
  const handleAddMoney = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    setTransactionStatus("processing");
    
    try {
      // Step 1: Create a pending transaction in your backend
      const createTransaction = await axios.post("http://localhost:8000/api/v1/institute_wallet/transaction", {
        amount: parseFloat(amount),
        type: "deposit",
        status: "pending"
      });
      
      const transactionId = createTransaction.data.transactionId;
      
      // Step 2: Generate UPI deep link
      // For now we'll use a simple UPI deep link approach
      const upiLink = `upi://pay?pa=${upiId}&pn=Institute%20Portal&am=${amount}&cu=INR&tr=${transactionId}`;
      
      // Open the UPI link in a new window
      window.open(upiLink, "_blank");
      
      // Show confirmation form after payment
      setTransactionStatus("confirm");
    } catch (error) {
      console.error("Error initiating transaction:", error);
      setTransactionStatus("failed");
    }
  };

  // Handle transaction confirmation
  const handleConfirmTransaction = async (e) => {
    e.preventDefault();
    
    const upiTransactionId = document.getElementById("upiTransactionId").value;
    
    if (!upiTransactionId) {
      alert("Please enter the UPI Transaction ID");
      return;
    }
    
    try {
      // Update the transaction with the UPI ID
      await axios.put("http://localhost:8000/api/v1/institute_wallet/transaction/confirm", {
        upiTransactionId
      });
      
      setTransactionStatus("success");
      
      // Refresh wallet data after 2 seconds
      setTimeout(() => {
        setShowAddMoney(false);
        setAmount("");
        setTransactionStatus(null);
        
        // Refresh wallet data
        fetchWalletData();
      }, 2000);
    } catch (error) {
      console.error("Error confirming transaction:", error);
      setTransactionStatus("failed");
    }
  };

  // Helper function to fetch wallet data
  const fetchWalletData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/v1/institute_wallet/balance");
      setWalletData(response.data);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    }
  };

  // Format date for transactions
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate("/")} 
          className="mr-4 p-2 rounded-full hover:bg-gray-200"
        >
          <FaArrowLeft className="text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold flex items-center">
          <FaWallet className="mr-2" /> Wallet Management
        </h1>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Current Balance</h2>
            <p className="text-4xl font-bold mt-2">
              ₹ {isLoading ? "..." : walletData.balance}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {walletData.transactions && walletData.transactions.length > 0 
                ? `Last updated: ${formatDate(walletData.transactions[0].timestamp)}` 
                : "No transactions yet"}
            </p>
          </div>
          <button
            onClick={() => setShowAddMoney(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaRupeeSign className="mr-1" /> Add Money
          </button>
        </div>
      </div>

      {/* Add Money Dialog */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Money to Wallet</h2>
            
            {transactionStatus === null && (
              <form onSubmit={handleAddMoney}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter amount"
                    min="1"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMoney(false)}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Proceed to Pay
                  </button>
                </div>
              </form>
            )}
            
            {transactionStatus === "processing" && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Redirecting to payment...</p>
              </div>
            )}
            
            {transactionStatus === "confirm" && (
              <form onSubmit={handleConfirmTransaction}>
                <p className="mb-4">After completing your payment through UPI app, please enter the UPI Transaction ID to confirm your payment.</p>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">UPI Transaction ID</label>
                  <input
                    id="upiTransactionId"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter UPI Transaction ID"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMoney(false)}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Confirm Payment
                  </button>
                </div>
              </form>
            )}
            
            {transactionStatus === "success" && (
              <div className="text-center py-4">
                <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
                  <p>Transaction submitted successfully!</p>
                  <p className="text-sm">Please allow some time for admin approval.</p>
                </div>
              </div>
            )}
            
            {transactionStatus === "failed" && (
              <div className="text-center py-4">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                  <p>Transaction failed. Please try again.</p>
                </div>
                <button
                  onClick={() => setTransactionStatus(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaHistory className="mr-2 text-gray-700" />
          <h2 className="text-xl font-semibold">Transaction History</h2>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading transactions...</p>
          </div>
        ) : walletData.transactions && walletData.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {walletData.transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.type === 'deposit' ? 'Add Money' : 'Student Registration'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.referenceId || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Wallet;