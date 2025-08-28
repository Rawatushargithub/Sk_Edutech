import React, { useState, useEffect } from "react";
import {
  FaWallet,
  FaHistory,
  FaArrowLeft,
  FaRupeeSign,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../../config";
import qrcode from "../../../../../public/assets/payment-qr-code.png"; // Adjust the path as needed

const Wallet = () => {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState({
    balance: 0,
    transactions: [],
  });
  const [allTransactions, setAllTransactions] = useState([]); // Store all transactions
  const [paymentStatus, setPaymentStatus] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Date filtering state
  const [dateFilter, setDateFilter] = useState("all");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filteredPaymentStatus, setFilteredPaymentStatus] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });

  // Fetch wallet data and transactions
  useEffect(() => {
    const fetchWalletData = async () => {
      setIsLoading(true);
      try {
        const franchiseId = localStorage.getItem("franchiseID");

        // Fetch wallet balance
        const balanceResponse = await axios.get(
          `${API_BASE_URL}/api/v1/institute_wallet/balance?franchiseId=${franchiseId}`
        );
        console.log("Wallet balance data:", balanceResponse.data);

        // Fetch all transactions for this franchise
        const transactionsResponse = await axios.get(
          `${API_BASE_URL}/api/v1/institute_wallet/payment-status?franchiseId=${franchiseId}`
        );
        console.log("All transactions data:", transactionsResponse.data);

        // Set wallet data with balance and transactions
        setWalletData({
          balance: balanceResponse.data.balance || 0,
          transactions: transactionsResponse.data || [],
        });

        // Store all transactions for filtering
        setAllTransactions(transactionsResponse.data || []);

        // Group transactions by status for payment status dashboard
        const grouped = {
          pending: (transactionsResponse.data || []).filter(
            (t) => t.status === "pending_approval"
          ),
          approved: (transactionsResponse.data || []).filter(
            (t) => t.status === "approved"
          ),
          rejected: (transactionsResponse.data || []).filter(
            (t) => t.status === "rejected"
          ),
        };

        setPaymentStatus(grouped);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        // Set default values on error
        setWalletData({ balance: 0, transactions: [] });
        setAllTransactions([]);
        setPaymentStatus({ pending: [], approved: [], rejected: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  // Apply date filter whenever data or dateFilter changes
  useEffect(() => {
    applyDateFilter();
  }, [allTransactions, dateFilter]);

  // Fixed date filtering function
  const applyDateFilter = () => {
    const now = new Date();
    let startDate;

    switch (dateFilter) {
      case "daily":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = null;
    }

    // Filter all transactions
    let filtered = [];
    if (allTransactions && allTransactions.length > 0) {
      if (startDate) {
        filtered = allTransactions.filter((transaction) => {
          const transactionDate = new Date(
            transaction.timestamp || transaction.createdAt || transaction.date
          );
          return transactionDate >= startDate;
        });
      } else {
        filtered = allTransactions;
      }
    }

    setFilteredTransactions(filtered);

    // Update wallet data with filtered transactions
    setWalletData((prev) => ({
      ...prev,
      transactions: filtered,
    }));

    // Filter payment status data
    const filteredStatus = {
      pending: filtered.filter(
        (payment) => payment.status === "pending_approval"
      ),
      approved: filtered.filter((payment) => payment.status === "approved"),
      rejected: filtered.filter((payment) => payment.status === "rejected"),
    };

    setFilteredPaymentStatus(filteredStatus);
  };

  // Get filter display text
  const getFilterDisplayText = () => {
    switch (dateFilter) {
      case "daily":
        return "Today";
      case "weekly":
        return "Last 7 Days";
      case "monthly":
        return "This Month";
      default:
        return "All Time";
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
      await axios.post(
        `${API_BASE_URL}/api/v1/institute_wallet/deposit`,
        {
          amount: parseFloat(amount),
          referenceId,
        },
        { withCredentials: true }
      );
      setTransactionStatus("success");
      setTimeout(() => {
        setShowAddMoney(false);
        setAmount("");
        setTransactionStatus(null);
        // Refresh data
        window.location.reload(); // Simple way to refresh all data
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
      await axios.put(
        `${API_BASE_URL}/api/v1/institute_wallet/transaction/confirm`,
        {
          upiTransactionId,
        }
      );

      setTransactionStatus("success");

      setTimeout(() => {
        setShowAddMoney(false);
        setAmount("");
        setTransactionStatus(null);
        // Refresh data
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error confirming transaction:", error);
      setTransactionStatus("failed");
    }
  };

  // Format date for transactions
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  // Function to dynamically load Razorpay checkout.js
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-checkout-js")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
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
      await axios.post(
        `${API_BASE_URL}/api/v1/institute_wallet/razorpay/verify-payment?franchiseId=${franchiseId}`,
        {
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
          amount: amount,
        }
      );
      alert("Payment verified and submitted for admin approval!");
      setShowAddMoney(false);
      navigate("/institute/wallet");
    } catch (error) {
      alert("Payment verification failed. Please contact support.");
    }
  };

  // Function to initiate Razorpay payment
  const handleRazorpayPayment = async (amount) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay SDK. Please try again.");
      return;
    }
    try {
      const franchiseId = localStorage.getItem("franchiseID");
      const data = await axios.post(
        `${API_BASE_URL}/api/v1/institute_wallet/razorpay/create-order?franchiseId=${franchiseId}`,
        { amount }
      );
      const options = {
        key: data.data.razorpay_key_id,
        amount: amount,
        currency: "INR",
        order_id: data.data.order_id,
        name: "SK Edutech",
        description: "Wallet Topup",
        handler: async function (response) {
          await verifyRazorpayPayment(response, amount);
        },
        prefill: {},
        theme: {
          color: "#3399cc",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error.message, "message of error");
      console.log("Full error object:", error);
      console.log("Error response:", error.response?.data);
      console.log("Error status:", error.response?.status);
      alert("Error initiating payment.");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending_approval":
        return <FaClock className="text-yellow-500" />;
      case "approved":
        return <FaCheckCircle className="text-green-500" />;
      case "rejected":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            <h2 className="text-xl font-semibold text-gray-700">
              Current Balance
            </h2>
            <p className="text-4xl font-bold mt-2">
              ₹ {isLoading ? "..." : walletData.balance}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {walletData.transactions && walletData.transactions.length > 0
                ? `Last updated: ${formatDate(
                    walletData.transactions[0].timestamp
                  )}`
                : "No transactions yet"}
            </p>
          </div>
          <button
            onClick={() => setShowAddMoney(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaRupeeSign className="mr-1" /> Update Wallet
          </button>
        </div>
      </div>
      {/* QR Code Payment Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaRupeeSign className="mr-2 text-green-600" />
          Quick Payment via QR Code
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* QR Code */}
          <div className="flex-shrink-0">
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <img
                src={qrcode}
                alt="Payment QR Code"
                className="w-48 h-48 rounded-lg"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              How to Pay:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Scan the QR code with any UPI app</li>
              <li>Enter the amount you want to add</li>
              <li>Complete the payment</li>
              <li>Take a screenshot of payment confirmation</li>
              <li>Send screenshot to WhatsApp number below</li>
              <li>Then click "Update Wallet" button to add the amount</li>
            </ol>

            {/* WhatsApp Number */}
            <div className="mt-4 bg-green-50 border border-green-200 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                📱 Send payment screenshot to:
              </p>
              <p className="text-lg font-bold text-green-900">+91 8076782988</p>
              <p className="text-xs text-green-700">
                Include your franchise ID in the message
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <FaFilter className="mr-2 text-gray-600" />
            <span className="text-lg font-medium text-gray-700">
              Filter by Date:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Time", icon: FaCalendarAlt },
              { key: "daily", label: "Today", icon: FaCalendarAlt },
              { key: "weekly", label: "Last 7 Days", icon: FaCalendarAlt },
              { key: "monthly", label: "This Month", icon: FaCalendarAlt },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setDateFilter(filter.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  dateFilter === filter.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <filter.icon className="mr-1 text-sm" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Currently showing:{" "}
          <span className="font-semibold text-blue-600">
            {getFilterDisplayText()}
          </span>
        </div>
      </div>

      {/* Payment Status Dashboard */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaEye className="mr-2 text-gray-700" />
          Payment Status - {getFilterDisplayText()}
        </h2>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {filteredPaymentStatus.pending.length}
                </p>
              </div>
              <FaClock className="text-yellow-500 text-2xl" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {filteredPaymentStatus.approved.length}
                </p>
              </div>
              <FaCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Rejected</p>
                <p className="text-2xl font-bold text-red-900">
                  {filteredPaymentStatus.rejected.length}
                </p>
              </div>
              <FaTimesCircle className="text-red-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4">
          {[
            {
              key: "pending",
              label: "Pending",
              count: filteredPaymentStatus.pending.length,
            },
            {
              key: "approved",
              label: "Approved",
              count: filteredPaymentStatus.approved.length,
            },
            {
              key: "rejected",
              label: "Rejected",
              count: filteredPaymentStatus.rejected.length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Payment List */}
        <div className="space-y-3">
          {filteredPaymentStatus[activeTab].length > 0 ? (
            filteredPaymentStatus[activeTab].map((payment) => (
              <div
                key={payment._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(payment.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-lg">
                          ₹{payment.amount}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(payment.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
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
              <p className="text-gray-500">
                No {activeTab} payments found for{" "}
                {getFilterDisplayText().toLowerCase()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaHistory className="mr-2 text-gray-700" />
          <h2 className="text-xl font-semibold">
            Transaction History - {getFilterDisplayText()}
          </h2>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {walletData.transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          transaction.type === "deposit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "deposit" ? "+" : "-"}₹
                        {transaction.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {transaction.type === "deposit"
    ? "Add Money"
    : transaction.type === "marksheet_deduction"
    ? "Marksheet Fee"
    : "Student Registration"}
</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending_approval"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No transactions found for {getFilterDisplayText().toLowerCase()}
            </p>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">₹{selectedPayment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                    selectedPayment.status
                  )}`}
                >
                  {selectedPayment.status.replace("_", " ").toUpperCase()}
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
                <span>{selectedPayment.purpose || "Wallet Recharge"}</span>
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
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
              Add Money to Wallet
            </h2>
            {transactionStatus === null && (
              <>
                <div className="text-center mb-6">
                  <p className="text-gray-600 text-sm mb-4">
                    After completing QR code payment and sending screenshot to
                    WhatsApp, enter the same amount here to update your wallet
                    balance.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!amount || parseFloat(amount) <= 0) {
                      alert("Please enter a valid amount");
                      return;
                    }
                    handleRazorpayPayment(amount * 100);
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Paid via QR Code (₹)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter the amount you paid"
                      min="1"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the exact amount you paid through QR code
                    </p>
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
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
                    >
                      Update Wallet Balance
                    </button>
                  </div>
                </form>

                <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-xs text-yellow-800 text-center">
                    ⚠️ This will create a pending approval request. Admin will
                    verify your WhatsApp payment before approval.
                  </p>
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
                <p className="mb-4">
                  After completing your payment through UPI app, please enter
                  the UPI Transaction ID to confirm your payment.
                </p>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    UPI Transaction ID
                  </label>
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
                  <p className="text-sm">
                    Please allow some time for admin approval.
                  </p>
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
