import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, CreditCard, Calendar, User, Clock, Disc, Loader } from "lucide-react";
import API_BASE_URL from "../../../config"; // Adjust the import path as necessary

const StatsSection = () => {
  const [balanceFees, setBalanceFees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [progress, setProgress] = useState(0);


  // Get student data from localStorage
  const student = JSON.parse(localStorage.getItem("student"));
  const studentId = student?.studentId;
  const courseName = student?.courseName || "N/A";
  const rollNumber = student?.rollNumber || "N/A";
  const studentName = student?.name || "Student";
  const enrollmentDate = student?.admissionDate || "N/A";
  const courseCode = student?.courseCode || "N/A";
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    const fetchFees = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/fees/student/${studentId}`);
        setBalanceFees(res.data.balance);
        setError(null);
      } catch (error) {
        console.error("Error fetching balance fees:", error);
        setError("Unable to load fee details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchFees();
    } else {
      setLoading(false);
      setError("Student ID not found");
    }
  }, [studentId]);

  // React Component or useEffect logic
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
          const durationInMonths = parseInt(data.duration); // e.g., "6" or "12"
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

  // Calculate days remaining in course (dummy calculation - replace with actual logic)
  // const daysRemaining = 120; // Example: 120 days remaining

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
                <p className="text-xs text-gray-500 uppercase">Roll Number</p>
                <p className="text-base font-medium text-gray-800">{rollNumber}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-2 text-sky-500 mt-1" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Enrollment Date</p>
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
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase">Balance Fees</p>
                  <p className={`text-2xl font-bold ${balanceFees > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{balanceFees}
                  </p>
                </div>

                <div className="mt-2">
                  <button
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </button>
                </div>
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
                  className="bg-sky-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4">
              <button
                className="w-full bg-white border border-sky-600 text-sky-600 hover:bg-sky-50 py-2 px-4 rounded transition-colors flex items-center justify-center"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Course Details
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Quick Stats Row */}
      {/* <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-sky-100 flex items-center">
          <div className="rounded-full bg-sky-100 p-3 mr-3">
            <BookOpen className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Classes Attended</p>
            <p className="text-lg font-bold text-gray-800">45/50</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-sky-100 flex items-center">
          <div className="rounded-full bg-sky-100 p-3 mr-3">
            <Clock className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Hours</p>
            <p className="text-lg font-bold text-gray-800">120 hrs</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-sky-100 flex items-center">
          <div className="rounded-full bg-sky-100 p-3 mr-3">
            <CreditCard className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Fees Paid</p>
            <p className="text-lg font-bold text-gray-800">₹15,000</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-sky-100 flex items-center">
          <div className="rounded-full bg-sky-100 p-3 mr-3">
            <Calendar className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Next Due Date</p>
            <p className="text-lg font-bold text-gray-800">May 15</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default StatsSection;