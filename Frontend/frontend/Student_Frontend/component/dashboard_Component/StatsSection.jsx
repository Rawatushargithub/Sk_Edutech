import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, CreditCard, Calendar, User, Clock, Disc, Loader } from "lucide-react";
import API_BASE_URL from "../../../config";

const StatsSection = () => {
  const [fees, setFees] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balanceFees, setBalanceFees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [progress, setProgress] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [errorCourse, setErrorCourse] = useState(null);

  // Get student data from localStorage
  const student = JSON.parse(localStorage.getItem("student"));
  const studentId = student?.studentId;
  const courseName = student?.courseName || "N/A";
  const rollNumber = student?.rollNumber || "N/A";
  const studentName = student?.name || "Student";
  const enrollmentDate = student?.admissionDate || "N/A";
  const courseCode = student?.courseCode || "N/A";
  const [duration, setDuration] = useState(null);

  // Calculate total paid from transactions
  const calculateTotalFromTransactions = () => {
    return transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
  };

  // Calculate total paid from installments (only paid ones)
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

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch Fee Details
        const feesRes = await axios.get(`${API_BASE_URL}/api/v1/fees/student/${studentId}`);
        setFees(feesRes.data);

        // Fetch Installments
        try {
          const installmentsRes = await axios.get(`${API_BASE_URL}/api/v1/institute_fees/installments/student/${studentId}`);
          if (installmentsRes.data.success && installmentsRes.data.data.installments) {
            setInstallments(installmentsRes.data.data.installments);
          }
        } catch (err) {
          console.log("No installments found");
          setInstallments([]);
        }

        // Fetch Transactions
        try {
          const transactionsRes = await axios.get(`${API_BASE_URL}/api/v1/institute_fees/transactions/${studentId}`);
          if (transactionsRes.data.success && transactionsRes.data.data) {
            setTransactions(transactionsRes.data.data);
          }
        } catch (err) {
          console.log("No transactions found");
          setTransactions([]);
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching balance fees:", error);
        setError("Unable to load fee details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAllData();
    } else {
      setLoading(false);
      setError("Student ID not found");
    }
  }, [studentId]);

  // Calculate balance fees after all data is loaded
  useEffect(() => {
    if (fees && !loading) {
      const calculatedBalance = calculateRemainingBalance();
      setBalanceFees(calculatedBalance);
    }
  }, [fees, installments, transactions, loading]);

  // Course duration and progress calculation
  useEffect(() => {
    if (!courseCode || !enrollmentDate) {
      console.error("Missing courseCode or admissionDate");
      return;
    }

    // Fetch course duration from API
    fetch(`${API_BASE_URL}/api/v1/student/course-duration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseCode })
    })
      .then(res => res.json())
      .then(data => {
        if (data.duration) {
          const durationInMonths = parseInt(data.duration);
          setDuration(durationInMonths);

          // Calculate course timeline
          const admission = new Date(enrollmentDate);
          const today = new Date();

          // Course end date = admission + duration (in months)
          const endDate = new Date(admission);
          endDate.setMonth(admission.getMonth() + durationInMonths);

          const totalDays = Math.ceil((endDate - admission) / (1000 * 60 * 60 * 24));
          const daysCompleted = Math.ceil((today - admission) / (1000 * 60 * 60 * 24));
          const daysLeft = Math.max(0, totalDays - daysCompleted);
          const progressPercent = Math.min(100, Math.round((daysCompleted / totalDays) * 100));

          // Store in state
          setDaysRemaining(daysLeft);
          setProgress(progressPercent);
        } else {
          console.error('Error:', data.message);
        }
      })
      .catch(err => console.error('Request failed:', err));
  }, [courseCode, enrollmentDate]);

  // Format date function
  const formatDate = (dateString) => {
    if (dateString === "N/A") return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const fetchCourseDetails = async () => {
    setLoadingCourse(true);
    setErrorCourse(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/coursedetails/course-syllabus`, {
        courseCode,
      });
      setCourseDetails(res.data);
    } catch (err) {
      console.error("Error fetching course details:", err);
      setErrorCourse("Unable to load course details.");
    } finally {
      setLoadingCourse(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchCourseDetails();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCourseDetails(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString('en-IN') || '0';
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <User className="h-6 w-6 mr-2 text-sky-600" />
        Student Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Course Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-sky-100 overflow-hidden hover:shadow-md transition-all">
          <div className="bg-sky-600 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Course Information
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-start mb-3">
              <Disc className="h-5 w-5 mr-2 text-sky-500 mt-1" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Course Name</p>
                <p className="text-base font-medium text-gray-800">{courseName}</p>
              </div>
            </div>

            <div className="flex items-start mb-3">
              <User className="h-5 w-5 mr-2 text-sky-500 mt-1" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Registration Number</p>
                <p className="text-base font-medium text-gray-800">{rollNumber}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-2 text-sky-500 mt-1" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Registration Date</p>
                <p className="text-base font-medium text-gray-800">{formatDate(enrollmentDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Fees Card */}
        <div className="bg-white rounded-lg shadow-sm border border-sky-100 overflow-hidden hover:shadow-md transition-all">
          <div className="bg-sky-600 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Fee Status
            </h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader className="h-8 w-8 text-sky-500 animate-spin mb-2" />
                <p className="text-sm text-gray-500">Loading fee details...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            ) : (
              <>
                <div className="mb-2">
                  <p className="text-xs text-gray-500 uppercase">Remaining Balance</p>
                  <p className={`text-2xl font-bold ${balanceFees > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{formatCurrency(balanceFees)}
                  </p>
                </div>

                {/* Fee Breakdown */}
                <div className="mt-3 p-3 bg-sky-50 rounded-lg space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Total Fees:</span>
                    <span className="font-semibold text-gray-800">₹{formatCurrency(fees?.totalFees)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Paid (Transactions):</span>
                    <span className="font-semibold text-green-600">₹{formatCurrency(calculateTotalFromTransactions())}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Paid (Installments):</span>
                    <span className="font-semibold text-green-600">₹{formatCurrency(calculateTotalFromInstallments())}</span>
                  </div>
                  <div className="border-t border-sky-200 pt-1 mt-1"></div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-700 font-medium">Total Received:</span>
                    <span className="font-bold text-green-700">₹{formatCurrency(calculateGrandTotalReceived())}</span>
                  </div>
                </div>

                {/* {balanceFees > 0 && (
                  <div className="mt-4">
                    <button
                      className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center text-sm font-medium"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Remaining ₹{formatCurrency(balanceFees)}
                    </button>
                  </div>
                )} */}

                {balanceFees <= 0 && (
                  <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded text-center">
                    <p className="text-sm font-medium text-green-700">✓ All fees paid!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Course Progress Card */}
        <div className="bg-white rounded-lg shadow-sm border border-sky-100 overflow-hidden hover:shadow-md transition-all">
          <div className="bg-sky-600 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Course Timeline
            </h3>
          </div>
          <div className="p-4">
            <div className="mb-3">
              <p className="text-xs text-gray-500 uppercase">Days Remaining</p>
              <p className="text-2xl font-bold text-sky-700">
                {duration ? `${daysRemaining} days` : "Loading..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Course Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-sky-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleOpenModal}
                className="w-full bg-white border border-sky-600 text-sky-600 hover:bg-sky-50 py-2 px-4 rounded transition-colors flex items-center justify-center text-sm font-medium"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Course Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-[80vw] max-w-4xl h-[80vh] p-6 relative flex flex-col">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-2xl font-semibold text-sky-600 mb-4">Course Details</h2>

            {/* Content */}
            {loadingCourse ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader className="h-6 w-6 text-sky-500 animate-spin" />
                <p className="ml-2 text-gray-500">Loading...</p>
              </div>
            ) : errorCourse ? (
              <p className="text-red-500">{errorCourse}</p>
            ) : courseDetails ? (
              <div className="flex-1 overflow-y-auto pr-3 space-y-4">
                <p>
                  <span className="font-semibold">Course Name:</span>{" "}
                  {courseDetails.data.courseName}
                </p>
                <p>
                  <span className="font-semibold">Syllabus:</span>{" "}
                  {courseDetails.data.syllabus}
                </p>
                {courseDetails.data.duration && (
                  <p>
                    <span className="font-semibold">Duration:</span>{" "}
                    {courseDetails.data.duration} months
                  </p>
                )}
                {courseDetails.data.instructor && (
                  <p>
                    <span className="font-semibold">Instructor:</span>{" "}
                    {courseDetails.data.instructor}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No course details available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsSection;