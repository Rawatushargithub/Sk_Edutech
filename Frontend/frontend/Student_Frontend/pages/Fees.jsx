import React, { useEffect, useState } from "react";
import axios from "axios";
import FeeHistory from "../component/transactionhistory";
import { CreditCard, DollarSign, Percent, Receipt, AlertCircle, Clock, CheckCircle } from "lucide-react";
import API_BASE_URL from "../../config";

const FeesDetails = () => {
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);

  const student = JSON.parse(localStorage.getItem("student"));
  const studentId = student?.studentId;

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/fees/student/${studentId}`);
        setFees(res.data);
      } catch (error) {
        console.error("Failed to fetch fees:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchFees();
    }
  }, [studentId]);

  // Format currency with commas
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-IN');
  };

  // Calculate payment status
  const getPaymentStatus = () => {
    if (!fees) return { status: "unknown", color: "gray" };
    
    if (fees.balance <= 0) {
      return { status: "Paid", color: "green", icon: <CheckCircle size={16} className="mr-1" /> };
    } else if (fees.feesReceived === 0) {
      return { status: "Pending", color: "red", icon: <AlertCircle size={16} className="mr-1" /> };
    } else {
      return { status: "Partial", color: "blue", icon: <Clock size={16} className="mr-1" /> };
    }
  };

  // Calculate payment percentage
  const calculatePaymentPercentage = () => {
    if (!fees || fees.totalFees === 0) return 0;
    return (fees.feesReceived / fees.totalFees) * 100;
  };

  const paymentStatus = getPaymentStatus();
  const paymentPercentage = calculatePaymentPercentage();

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-gradient-to-br from-sky-50 to-white rounded-xl shadow-lg border border-sky-100 overflow-hidden">
        <div className="bg-blue-950 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard size={24} className="mr-3" />
              <h2 className="text-2xl font-bold">Fees Details</h2>
            </div>
            {!loading && fees && (
              <div className={`flex items-center px-3 py-1 rounded-full bg-opacity-90 text-sm font-medium bg-${paymentStatus.color}-950 text-${paymentStatus.color}-950`}>
                {paymentStatus.icon}
                {paymentStatus.status}
              </div>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
            <span className="ml-3 text-blue-950">Loading fees information...</span>
          </div>
        ) : !fees ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle size={48} className="text-sky-300 mb-3" />
            <p className="text-lg font-medium text-blue-950">No fee records found.</p>
            <p className="text-sm text-blue-950 mt-2">Please contact the administration office for more information.</p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="px-6 pt-6 pb-2">
              <div className="flex justify-between text-xs text-blue-950 mb-1">
                <span>Payment Progress</span>
                <span>{paymentPercentage.toFixed(0)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full bg-blue-950" 
                  style={{ width: `${paymentPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Fee Cards */}
            <div className="grid md:grid-cols-2 gap-4 p-6">
              <div className="bg-white rounded-lg shadow-sm border border-sky-100 p-4">
                <div className="flex items-start">
                  <div className="p-2 bg-sky-100 rounded-lg text-blue-950">
                    {/* <DollarSign size={20} /> */}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-950">Course Fees</p>
                    <p className="text-xl font-bold text-sky-800">₹{formatCurrency(fees.courseFees)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-sky-100 p-4">
                <div className="flex items-start">
                  <div className="p-2 bg-sky-100 rounded-lg text-blue-950">
                    <Percent size={20} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-950">Discount ({fees.discountType})</p>
                    <p className="text-xl font-bold text-sky-800">₹{formatCurrency(fees.discountAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Fee Table */}
            <div className="px-6 pb-6">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-sky-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium text-sky-800">Total Fees</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-sky-800">₹{formatCurrency(fees.totalFees)}</td>
                    </tr>
                    <tr className="bg-sky-50">
                      <td className="py-3 px-4 text-sm font-medium text-sky-800">Fees Received</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">₹{formatCurrency(fees.feesReceived)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium text-sky-800">Balance</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-red-600">₹{formatCurrency(fees.balance)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Remarks */}
            {fees.remarks && (
              <div className="px-6 pb-6">
                <div className="bg-sky-50 rounded-lg p-4 border border-sky-100">
                  <div className="flex items-start">
                    <Receipt size={20} className="text-blue-950 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-950">Remarks</p>
                      <p className="text-sm text-blue-950 mt-1">{fees.remarks}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <FeeHistory /> 
    </div>
  );
};

export default FeesDetails;