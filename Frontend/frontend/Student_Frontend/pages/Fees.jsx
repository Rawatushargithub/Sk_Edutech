import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CreditCard,
  Percent,
  Receipt,
  AlertCircle,
  CheckCircle,
  Calendar,
  IndianRupee,
  Clock
} from "lucide-react";
import API_BASE_URL from "../../config";

const FeesDetails = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [fees, setFees] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const student = JSON.parse(localStorage.getItem("student"));
  const studentId = student?.studentId;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch Fee Details
        const feesRes = await axios.get(`${API_BASE_URL}/api/v1/fees/student/${studentId}`);
        setFees(feesRes.data);

        // Fetch Installments
        try {
          const installmentsRes = await axios.get(`${API_BASE_URL}/api/v1/institute_fees/installments/student/${studentId}`);
          if (installmentsRes.data.success && installmentsRes.data.data.installments) {
            // Dedupe installments and their paymentHistory entries before setting state
            const ensureUnique = (arr, keyFn) => {
              const seen = new Set();
              return (arr || []).filter(item => {
                const key = keyFn(item);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });
            };
            const normalizeInstallments = (installs) => {
              const dedupedInstalls = ensureUnique(installs || [], inst => inst.installmentId ?? inst._id ?? inst.installmentName);
              return dedupedInstalls.map(inst => ({
                ...inst,
                paymentHistory: ensureUnique(inst.paymentHistory || [], p => p.paymentId ?? p._id ?? `${p.amount}-${p.paymentDate}-${p.paymentMode}-${p.remarks ?? ''}`)
              }));
            };
            setInstallments(normalizeInstallments(installmentsRes.data.data.installments));
          }
        } catch (err) {
          console.log("No installments found");
          setInstallments([]);
        }

        // Fetch Transactions
        try {
          const transactionsRes = await axios.get(`${API_BASE_URL}/api/v1/institute_fees/transactions/${studentId}`);
          if (transactionsRes.data.success && transactionsRes.data.data) {
            // Dedupe transactions to avoid repeated rendering if backend returns duplicates
            const ensureUniqueTx = (arr, keyFn) => {
              const seen = new Set();
              return (arr || []).filter(item => {
                const key = keyFn(item);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });
            };
            const uniqueTransactions = ensureUniqueTx(
              transactionsRes.data.data,
              t => t.transactionId ?? t._id ?? `${t.amount}-${t.date}-${t.paymentMode}-${t.remarks ?? ''}`
            );
            setTransactions(uniqueTransactions);
          }
        } catch (err) {
          console.log("No transactions found");
          setTransactions([]);
        }

      } catch (error) {
        console.error("Failed to fetch fees:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAllData();
    }
  }, [studentId]);

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString('en-IN') || '0';
  };

  // Calculate total paid from transactions
  const calculateTotalFromTransactions = () => {
    return transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
  };

  // Calculate total paid from installments (only paid installments)
  const calculateTotalFromInstallments = () => {
    return installments
      .filter(inst => inst.paid === true)
      .reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
  };

  // Calculate grand total received
  const calculateGrandTotalReceived = () => {
    const transactionTotal = calculateTotalFromTransactions();
    const installmentTotal = calculateTotalFromInstallments();
    return transactionTotal + installmentTotal;
  };

  // Calculate remaining balance
  const calculateRemainingBalance = () => {
    if (!fees) return 0;
    const totalReceived = calculateGrandTotalReceived();
    return fees.totalFees - totalReceived;
  };

  // Get payment status
  const getPaymentStatus = () => {
    const remaining = calculateRemainingBalance();
    const totalReceived = calculateGrandTotalReceived();

    if (remaining <= 0) {
      return {
        status: "Fully Paid",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        icon: <CheckCircle size={16} className="mr-1" />
      };
    } else if (totalReceived === 0) {
      return {
        status: "Pending",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: <AlertCircle size={16} className="mr-1" />
      };
    } else {
      return {
        status: "Partial Payment",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: <Clock size={16} className="mr-1" />
      };
    }
  };

  const paymentStatus = getPaymentStatus();
  const totalReceived = calculateGrandTotalReceived();
  const remainingBalance = calculateRemainingBalance();
  const paymentPercentage = fees ? (totalReceived / fees.totalFees) * 100 : 0;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="text-lg text-gray-700">Loading fees information...</span>
        </div>
      </div>
    );
  }

  // No Data State
  if (!fees) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <AlertCircle size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Fee Records Found</h3>
          <p className="text-gray-600">Please contact the administration office for more information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Fees Details
              </h1>
              <p className="text-gray-600 mt-2">Complete overview of your fee payments</p>
            </div>
            <div className={`flex items-center px-4 py-2 rounded-xl ${paymentStatus.bgColor} ${paymentStatus.textColor} font-semibold shadow-lg`}>
              {paymentStatus.icon}
              {paymentStatus.status}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`relative py-3 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === "overview"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Fee Overview</span>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`relative py-3 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === "history"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <Receipt className="w-5 h-5" />
                <span>Payment History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Progress Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span className="font-semibold">Payment Progress</span>
                <span className="font-bold text-blue-600">
                  {paymentPercentage.toFixed(1)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm transition-all duration-1000"
                  style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Fee Summary Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Course Fees */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 font-medium">Course Fees</p>
                    <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(fees.courseFees)}</p>
                  </div>
                </div>
              </div>

              {/* Discount */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Percent className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 font-medium">
                      Discount {fees.discountType ? `(${fees.discountType})` : ''}
                    </p>
                    <p className="text-2xl font-bold text-green-600">₹{formatCurrency(fees.discountAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Fee Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Receipt className="w-5 h-5 mr-2" />
                  Fee Breakdown
                </h3>
              </div>
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-gray-700">Course Fees</td>
                    <td className="py-4 px-6 text-sm text-right font-bold text-gray-900">
                      ₹{formatCurrency(fees.courseFees)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-gray-700">Discount Applied</td>
                    <td className="py-4 px-6 text-sm text-right font-bold text-green-600">
                      -₹{formatCurrency(fees.discountAmount)}
                    </td>
                  </tr>
                  <tr className="bg-blue-50 hover:bg-blue-100 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-blue-800">Total Fees (After Discount)</td>
                    <td className="py-4 px-6 text-sm text-right font-bold text-blue-800">
                      ₹{formatCurrency(fees.totalFees)}
                    </td>
                  </tr>
                  <tr className="bg-purple-50 hover:bg-purple-100 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-purple-800">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 mr-2" />
                        Paid via Transactions
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-bold text-purple-600">
                      ₹{formatCurrency(calculateTotalFromTransactions())}
                    </td>
                  </tr>
                  <tr className="bg-indigo-50 hover:bg-indigo-100 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-indigo-800">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Paid via Installments
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-bold text-indigo-600">
                      ₹{formatCurrency(calculateTotalFromInstallments())}
                    </td>
                  </tr>
                  <tr className="bg-green-50 hover:bg-green-100 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-green-800">Total Received</td>
                    <td className="py-4 px-6 text-sm text-right font-bold text-green-600">
                      ₹{formatCurrency(totalReceived)}
                    </td>
                  </tr>
                  <tr className="bg-red-50 hover:bg-red-100 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-red-800">
                      <div className="flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2" />
                        Remaining Balance
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-bold text-red-600">
                      ₹{formatCurrency(remainingBalance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Breakdown Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Transactions Summary */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-purple-900">Transaction Payments</h4>
                  <div className="bg-purple-200 rounded-full px-3 py-1">
                    <span className="text-xs font-bold text-purple-800">{transactions.length} payments</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-700">₹{formatCurrency(calculateTotalFromTransactions())}</p>
                <p className="text-sm text-purple-600 mt-1">Direct fee payments</p>
              </div>

              {/* Installments Summary */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-indigo-900">Installment Payments</h4>
                  <div className="bg-indigo-200 rounded-full px-3 py-1">
                    <span className="text-xs font-bold text-indigo-800">{installments.length} installments</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-indigo-700">₹{formatCurrency(calculateTotalFromInstallments())}</p>
                <p className="text-sm text-indigo-600 mt-1">
                  {installments.filter(i => i.paid).length} paid of {installments.length}
                </p>
              </div>
            </div>

            {/* Remarks */}
            {fees.remarks && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-blue-900 mb-1">Remarks</p>
                    <p className="text-sm text-gray-700">{fees.remarks}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === "history" && (
          <div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Receipt className="w-5 h-5 mr-2" />
                  Payment Transaction History
                </h3>
              </div>

              {transactions.length > 0 || installments.some(i => i.paid && i.paymentHistory?.length > 0) ? (
                <div className="p-6 space-y-6">
                  {/* Direct Transactions */}
                  {transactions.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        Direct Fee Payments ({transactions.length})
                      </h4>
                      <div className="space-y-3">
                        {transactions.map((transaction, index) => (
                          <div key={index} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="bg-purple-200 p-2 rounded-full">
                                  <CheckCircle className="w-5 h-5 text-purple-700" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-gray-800 text-lg">₹{formatCurrency(transaction.amount)}</h5>
                                  <p className="text-sm text-gray-600">Transaction Payment #{index + 1}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {transaction.date}
                                  </span>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${transaction.paymentMode === 'Cash' ? 'bg-green-200 text-green-800' :
                                    transaction.paymentMode === 'Card' ? 'bg-blue-200 text-blue-800' :
                                      transaction.paymentMode === 'UPI' ? 'bg-purple-200 text-purple-800' :
                                        'bg-gray-200 text-gray-800'
                                  }`}>
                                  {transaction.paymentMode}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Installment Payments */}
                  {installments.some(i => i.paid && i.paymentHistory?.length > 0) && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                        Installment Payments
                      </h4>
                      <div className="space-y-4">
                        {installments.filter(inst => inst.paid && inst.paymentHistory?.length > 0).map((installment, instIndex) => (
                          <div key={instIndex} className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                            <h5 className="font-bold text-indigo-900 mb-3">{installment.installmentName}</h5>
                            <div className="space-y-2">
                              {installment.paymentHistory.map((payment, payIndex) => (
                                <div key={payIndex} className="bg-white rounded-lg p-3 border-l-4 border-indigo-500">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-indigo-100 p-2 rounded-full">
                                        <CheckCircle className="w-4 h-4 text-indigo-600" />
                                      </div>
                                      <div>
                                        <h6 className="font-bold text-gray-800">₹{formatCurrency(payment.amount)}</h6>
                                        <p className="text-xs text-gray-500">Payment #{payIndex + 1}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Calendar className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs font-medium text-gray-700">
                                          {payment.paymentDate}
                                        </span>
                                      </div>
                                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${payment.paymentMode === 'Cash' ? 'bg-green-100 text-green-700' :
                                          payment.paymentMode === 'Card' ? 'bg-blue-100 text-blue-700' :
                                            payment.paymentMode === 'UPI' ? 'bg-purple-100 text-purple-700' :
                                              'bg-gray-100 text-gray-700'
                                        }`}>
                                        {payment.paymentMode}
                                      </span>
                                    </div>
                                  </div>
                                  {payment.remarks && (
                                    <p className="text-xs text-gray-600 mt-2 ml-11">{payment.remarks}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Payment History</h3>
                  <p className="text-gray-500">No payments have been recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeesDetails;