import React, { useState, useEffect } from "react";
import { FaWallet, FaHistory, FaArrowLeft, FaRupeeSign, FaCheckCircle, FaClock, FaTimesCircle, FaEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../../config";

const Wallet = () => {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState({
    balance: 0,
    transactions: []
  });
  const [paymentStatus, setPaymentStatus] = useState({
    pending: [],
    approved: [],
    rejected: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("institute-upi@ybl");
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      setIsLoading(true);
      try {
        const franchiseId = localStorage.getItem("franchiseID");
        const response = await axios.get(`${API_BASE_URL}/api/v1/institute_wallet/balance?franchiseId=${franchiseId}`);
        setWalletData(response.data);
        
        // Fetch payment status data
        await fetchPaymentStatus();
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  // Fetch payment status data
  const fetchPaymentStatus = async () => {
    try {
      const franchiseId = localStorage.getItem("franchiseID");
      const response = await axios.get(`${API_BASE_URL}/api/v1/institute_wallet/payment-status?franchiseId=${franchiseId}`);
      console.log(response.data, "Payment status data fetched");
      // Group transactions by status
      const grouped = {
        pending: response.data.filter(t => t.status === 'pending_approval'),
        approved: response.data.filter(t => t.status === 'approved'),
        rejected: response.data.filter(t => t.status === 'rejected')
      };
      
      setPaymentStatus(grouped);
    } catch (error) {
      console.error("Error fetching payment status:", error);
      // Mock data for demonstration
      setPaymentStatus({
        pending: [
          {
            _id: "1",
            amount: 5000,
            type: "deposit",
            status: "pending_approval",
            referenceId: "UPI123456789",
            timestamp: new Date().toISOString(),
            paymentId: "pay_123456",
            purpose: "wallet_recharge"
          },
          {
            _id: "2",
            amount: 3000,
            type: "deposit",
            status: "pending_approval",
            referenceId: "NEFT987654321",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            paymentId: "pay_789012",
            purpose: "wallet_recharge"
          }
        ],
        approved: [
          {
            _id: "3",
            amount: 10000,
            type: "deposit",
            status: "approved",
            referenceId: "UPI111222333",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            paymentId: "pay_345678",
            purpose: "wallet_recharge"
          }
        ],
        rejected: [
          {
            _id: "4",
            amount: 2000,
            type: "deposit",
            status: "rejected",
            referenceId: "UPI444555666",
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            paymentId: "pay_901234",
            purpose: "wallet_recharge"
          }
        ]
      });
    }
  };

  // Handle add money form submission
  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    const referenceId = document.getElementById("referenceId").value;
    if (!referenceId) {
      alert("Please enter the payment reference/transaction ID");
      return;
    }
    setTransactionStatus("processing");
    try {
      await axios.post(`${API_BASE_URL}/api/v1/institute_wallet/deposit`, {
        amount: parseFloat(amount),
        referenceId
      }, { withCredentials: true });
      setTransactionStatus("success");
      setTimeout(() => {
        setShowAddMoney(false);
        setAmount("");
        setTransactionStatus(null);
        fetchWalletData();
      }, 2000);
    } catch (error) {
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
      await axios.put(`${API_BASE_URL}/api/v1/institute_wallet/transaction/confirm`, {
        upiTransactionId
      });
      
      setTransactionStatus("success");
      
      setTimeout(() => {
        setShowAddMoney(false);
        setAmount("");
        setTransactionStatus(null);
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
      const franchiseId = localStorage.getItem("franchiseID");
      const response = await axios.get(`${API_BASE_URL}/api/v1/institute_wallet/balance?franchiseId=${franchiseId}`);
      console.log("Wallet data fetched:", response.data);
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

  // Function to dynamically load Razorpay checkout.js
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-checkout-js')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Function to verify Razorpay payment
  const verifyRazorpayPayment = async (response, amount) => {
    try {
      const franchiseId = localStorage.getItem("franchiseID");
      await axios.post(`${API_BASE_URL}/api/v1/institute_wallet/razorpay/verify-payment?franchiseId=${franchiseId}`, {
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
        amount: amount
      });
      alert('Payment verified and submitted for admin approval!');
      navigate("/institute");
      fetchWalletData();
    } catch (error) {
      alert('Payment verification failed. Please contact support.');
    }
  };

  // Function to initiate Razorpay payment
  const handleRazorpayPayment = async (amount) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Failed to load Razorpay SDK. Please try again.');
      return;
    }
    try {
      const franchiseId = localStorage.getItem("franchiseID");
      const data = await axios.post(`${API_BASE_URL}/api/v1/institute_wallet/razorpay/create-order?franchiseId=${franchiseId}`, { amount });
      console.log(data, "data from backend");
      const options = {
        key: data.data.razorpay_key_id,
        amount: amount,
        currency: "INR",
        order_id: data.data.order_id,
        name: 'SK Edutech',
        description: 'Wallet Topup',
        handler: async function (response) {
          await verifyRazorpayPayment(response, amount);
        },
        prefill: {},
        theme: {
          color: '#3399cc'
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error.message, "message of error");
      console.log('Full error object:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
      alert('Error initiating payment.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_approval':
        return <FaClock className="text-yellow-500" />;
      case 'approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate("/institute")} 
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

      {/* Payment Status Dashboard */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaEye className="mr-2 text-gray-700" />
          Payment Status 
        </h2>
        
        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-900">{paymentStatus.pending.length}</p>
              </div>
              <FaClock className="text-yellow-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Approved</p>
                <p className="text-2xl font-bold text-green-900">{paymentStatus.approved.length}</p>
              </div>
              <FaCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{paymentStatus.rejected.length}</p>
              </div>
              <FaTimesCircle className="text-red-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4">
          {[
            { key: 'pending', label: 'Pending', count: paymentStatus.pending.length },
            { key: 'approved', label: 'Approved', count: paymentStatus.approved.length },
            { key: 'rejected', label: 'Rejected', count: paymentStatus.rejected.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Payment List */}
        <div className="space-y-3">
          {paymentStatus[activeTab].length > 0 ? (
            paymentStatus[activeTab].map((payment) => (
              <div key={payment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(payment.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-lg">₹{payment.amount}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(payment.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Ref: {payment.referenceId || 'N/A'}
                    </p>
                    {payment.paymentId && (
                      <p className="text-xs text-gray-400">
                        Payment ID: {payment.paymentId}
                      </p>
                    )}
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No {activeTab} payments found</p>
            </div>
          )}
        </div>
      </div>
 
      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-grey-100 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">₹{selectedPayment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{formatDate(selectedPayment.timestamp)}</span>
              </div>
              {selectedPayment.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="text-xs">{selectedPayment.paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Purpose:</span>
                <span>{selectedPayment.purpose || 'Wallet Recharge'}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedPayment(null)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Money Dialog */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative animate-fadeIn">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Add Money</h2>
            {transactionStatus === null && (
              <>
                <form onSubmit={handleAddMoney} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter amount"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Reference/Transaction ID</label>
                    <input
                      id="referenceId"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter payment reference/transaction ID"
                      required
                    />
                  </div>
                  <div className="flex justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMoney(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
                    >
                      Submit
                    </button>
                  </div>
                </form>
                <div className="mt-6 flex flex-col items-center">
                  <span className="text-gray-400 text-xs mb-2">or</span>
                  <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow cursor-pointer"
                    onClick={async () => {
                      if (!amount || parseFloat(amount) <= 0) {
                        alert("Please enter a valid amount");
                        return;
                      }
                      await handleRazorpayPayment(amount * 100);
                    }}
                  >
                    Pay with Razorpay
                  </button>
                </div>
              </>
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

      
    </div>
  );
};

export default Wallet;
