// Modified Fees_table.js with auto-updating course fees

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../config";

const Fees_table = ({
  handleSubmit,
  formData,
  setFormData,
  handleChange,
  batches,
  selectedBatch,
  remainingSeats,
  setBatches,
  setSelectedBatch,
  setRemainingSeats,
  isSubmitting,
}) => {
  const [installments, setInstallments] = useState([]);
  // Remove local courseFees state - use formData.courseFees instead
  const [discountRate, setDiscountRate] = useState("amount-");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [feesReceived, setFeesReceived] = useState(0);
  const [feesBalance, setfeeBalance] = useState(0);
  const [remarks, setRemarks] = useState("");

  const navigate = useNavigate();

  // Fetch all batches
  const fetchBatches = async () => {
    try {
      const franchiseId = localStorage.getItem("franchiseID");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_batche/allBatches?franchiseId=${franchiseId}`
      );
      if (!response.ok) throw new Error("Failed to fetch batches");
      console.log("Response:: ", response);
      const data = await response.json();
      console.log("Data:: ", data);
      setBatches(data.data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  // Fetch remaining seats for selected batch
  const fetchRemainingSeats = async (batchId) => {
    try {
      const franchiseId = localStorage.getItem("franchiseID");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_batche/${batchId}/seats?franchiseId=${franchiseId}`
      );
      if (!response.ok) throw new Error("Failed to fetch remaining seats");
      const data = await response.json();
      console.log("Remaining seats data:", data);
      setRemainingSeats(data.data);
    } catch (error) {
      console.error("Error fetching remaining seats:", error);
      setRemainingSeats("Error loading seats");
    }
  };

  // Handle batch selection change
  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    const selectedBatchObject = batches.find((batch) => batch.id === batchId);

    if (selectedBatchObject) {
      setFormData({
        ...formData,
        selectedBatch: selectedBatchObject.name,
      });
    }
    setSelectedBatch(batchId);

    console.log("Formdata data ", formData.batches);

    if (batchId) {
      fetchRemainingSeats(batchId);
    } else {
      setRemainingSeats("");
    }
  };

  // Handle course fees change
  const handleCourseFeesChange = (e) => {
    const newCourseFees = e.target.value;
    setFormData({
      ...formData,
      courseFees: newCourseFees === "" ? 0 : Number(newCourseFees), // Handle empty string
    });
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Update the calculateTotalFees function to handle empty courseFees:
  const calculateTotalFees = () => {
    let updatedTotal = Number(formData.courseFees) || 0; // This will handle both 0 and empty string
    console.log("without if ", discountAmount);
    if (discountRate === "amount-") {
      updatedTotal -= Number(discountAmount);
      console.log("with in if ", updatedTotal);
    } else if (discountRate === "amount+") {
      updatedTotal += Number(discountAmount);
    } else if (discountRate === "percent-") {
      const percentage = updatedTotal * (Number(discountAmount) / 100);
      updatedTotal -= percentage;
    } else if (discountRate === "percent+") {
      const percentage = updatedTotal * (Number(discountAmount) / 100);
      updatedTotal += percentage;
    }
    setTotalFees(updatedTotal);

    // Auto-calculate balance
  const balance = updatedTotal - (Number(feesReceived) || 0);
  setfeeBalance(balance);

    // Update formData with calculated values
    setFormData((prev) => ({
      ...prev,
      discountRate,
      discountAmount,
      totalFees: updatedTotal,
      feesReceived,
      feesBalance: balance,
      installments,
    }));
  };

  // Handle Adding Installments
  const addInstallment = () => {  
    const newInstallments = [...installments, { name: "", amount: 0, date: "", paymentMode: "Cash" }];
    setInstallments(newInstallments);
    // Update parent formData immediately
    setFormData((prev) => ({
      ...prev,
      installments: newInstallments,
    }));
  };

  // Handle Removing Installments
  const removeInstallment = (index) => {
    const newInstallments = installments.filter((_, i) => i !== index);
    setInstallments(newInstallments);
    // Update parent formData immediately
    setFormData((prev) => ({
      ...prev,
      installments: newInstallments,
    }));
  };

  // Handle Installment Change
  const handleInstallmentChange = (index, field, value) => {
    const updatedInstallments = [...installments];
    updatedInstallments[index][field] = value;
    setInstallments(updatedInstallments);
    // Update parent formData immediately
    setFormData((prev) => ({
      ...prev,
      installments: updatedInstallments,
    }));
  };

  // Recalculate when dependencies change - include formData.courseFees
  useEffect(() => {
    calculateTotalFees();
  }, [discountAmount, discountRate, formData.courseFees, feesReceived]);

  return (
    <div className="p-4 space-y-6">
      {/* Table for Fees */}
      <div className="w-full h-[120px]">
        <table className="table-fixed w-full h-[100px] text-m">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-2 py-2 w-[100px]">
                Course Fees(₹)
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[80px]">
                Discount Rate
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[100px]">
                Discount Amount(₹)
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[100px]">
                Total Fees(₹)
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[100px]">
                Fees Received(₹)
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[100px]">
                Payment Mode
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[100px]">
                Balance(₹)
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[120px]">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 py-2 px-2 text-center">
                <input
                  type="number"
                  className="border h-8 w-full rounded px-1 text-sm"
                  value={formData.courseFees || ""}
                  onChange={handleCourseFeesChange}
                  placeholder="₹0"
                />
              </td>
              <td className="border border-gray-300 py-2 px-2 text-center">
                <select
                  className="w-full h-8 border rounded px-1 text-sm"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(e.target.value)}
                >
                  <option value="amount+">Amount +</option>
                  <option value="amount-">Amount -</option>
                  <option value="percent+">Percent +</option>
                  <option value="percent-">Percent -</option>
                </select>
              </td>
              <td className="border border-gray-300 py-2 px-2 text-center">
                <input
                  type="number"
                  className="w-full h-8 border rounded px-1 text-sm"
                  value={discountAmount || ""}
                  placeholder="₹0"
                  onChange={(e) =>
                    setDiscountAmount(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </td>
              <td className="border border-gray-300 py-2 px-2 text-center">
                <input
                  type="number"
                  className="w-full h-8 text-black border rounded px-1 text-sm bg-gray-300"
                  placeholder="₹0"
                  value={totalFees}
                  readOnly
                />
              </td>
              <td className="border border-gray-300 py-2 px-2 text-center">
                <input
                  type="number"
                  className="w-full h-8 border rounded px-1 text-sm"
                 placeholder="₹0"
                  value={feesReceived || ""}
                  onChange={(e) =>
                    setFeesReceived(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </td>
              <td className="border border-gray-300 py-2 px-2 text-center">
                <select
                  className="w-full h-8 border rounded px-1 text-sm"
                  value={formData.paymentMode || "Cash"}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMode: e.target.value })
                  }
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
              </td>
              <td className="border border-gray-300 py-2 px-2 text-center">
                <input
                  className="w-full h-8 border rounded px-1 text-sm bg-gray-300"
                  placeholder="₹0"
                  value={feesBalance}
                  readOnly
                />
              </td>
              <td className="border border-gray-300 py-2 px-2 text-center">
                <input
                  className="w-full h-8 border rounded px-1 text-sm"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Rest of the component remains the same */}
      {/* Installment Details */}
      <div>
        <h2 className="font-bold">Installment Details</h2>
        {installments.map((installment, index) => (
          <div className="grid grid-cols-6 gap-4 items-center mb-2" key={index}>
            <input
              type="text"
              placeholder="Installment Name"
              className="col-span-1 border rounded px-2 py-2"
              value={installment.name}
              onChange={(e) =>
                handleInstallmentChange(index, "name", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Amount"
              className="col-span-1 border rounded px-2 py-2"
              value={installment.amount}
              onChange={(e) =>
                handleInstallmentChange(index, "amount", e.target.value)
              }
            />
            <input
              type="date"
              className="col-span-1 border rounded px-2 py-2"
              value={installment.date}
              onChange={(e) =>
                handleInstallmentChange(index, "date", e.target.value)
              }
            />
            <select
              className="col-span-1 border rounded px-2 py-2"
              value={installment.paymentMode || "Cash"}
              onChange={(e) =>
                handleInstallmentChange(index, "paymentMode", e.target.value)
              }
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
            </select>
            <button
              type="button"
              className="col-span-1 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => removeInstallment(index)}
            >
              Delete
            </button>
          </div>
        ))}
        <button
          type="button"
          className="bg-yellow-400 text-white px-4 py-2 rounded"
          onClick={addInstallment}
        >
          Add More
        </button>
      </div>

      {/* Updated Batch Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Select Batch for Student</label>
          <select
            className="w-full border rounded px-2 py-2"
            value={selectedBatch}
            onChange={handleBatchChange}
          >
            <option value="">Select a batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name} ({batch.timings})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Remaining Seats for this Batch</label>
          <input
            type="text"
            className="w-full text-2xl font-bold rounded px-2 py-2"
            value={remainingSeats}
            readOnly
          />
        </div>
      </div>

      {/* Admission Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Admission Date</label>
          <input
            type="date"
            name="admissionDate"
            value={formData.admissionDate}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2"
          />
        </div>
        <div>
          <label>Display Admission Form/ID Card/Fees Receipt</label>
          <div className="flex gap-4 py-2">
            <label>
              <input type="radio" name="display" value="yes" /> Yes
            </label>
            <label>
              <input type="radio" name="display" value="no" /> No
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className={`px-6 py-2 rounded-md text-white font-medium ${
          isSubmitting
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        disabled={isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Submitting...
          </div>
        ) : (
          "Submit"
        )}
        Register Admission
      </button>

      <button
        type="button"
        className="bg-red-500 text-white ml-10 px-4 py-2 rounded-2xl hover:bg-red-600"
        onClick={() => navigate("/institute/student_list")}
      >
        Cancel
      </button>
    </div>
  );
};

export default Fees_table;
