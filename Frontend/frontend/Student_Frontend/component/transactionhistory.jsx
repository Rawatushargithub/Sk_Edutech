import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

const FeeHistory = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Parse student object from localStorage
  const studentData = JSON.parse(localStorage.getItem("student"));
  const studentId = studentData?.studentId;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!studentId) {
        setError("Student ID not found in localStorage");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/fees-transaction/history/${studentId}`
        );
        setData(res.data);
      } catch (err) {
        setError("Failed to fetch fee history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [studentId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-lg text-gray-600">Loading...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-lg text-red-600">{error}</span>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Fee History for {data.student.name}
      </h2>
      <div className="space-y-4">
        {/* Headings Row */}
        <div className="grid grid-cols-4 gap-4 bg-gray-200 rounded-lg py-2 px-3 font-semibold text-gray-700">
          <div>Date</div>
          <div>Fee Type</div>
          <div>Amount Paid</div>
          <div>Payment Mode</div>
        </div>

        {/* Fee History Cards */}
        {data.feeHistory.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-4 gap-4 bg-white rounded-lg shadow p-4 items-center border hover:shadow-md transition"
          >
            <div className="text-gray-600">{item.date}</div>
            <div className="text-gray-700">{item.feeId?.name || "N/A"}</div>
            <div className="text-green-700 font-semibold">₹{item.amount}</div>
            <div className="text-blue-600">{item.paymentMode}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeeHistory;
