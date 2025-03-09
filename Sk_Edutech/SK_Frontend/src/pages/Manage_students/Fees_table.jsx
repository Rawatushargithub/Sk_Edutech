import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const [courseFees, setCourseFees] = useState(0);
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
      const response = await fetch(
        "http://localhost:8000/api/v1/batche/allBatches"
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
      const response = await fetch(
        `http://localhost:8000/api/v1/batche/${batchId}/seats`
      );
      if (!response.ok) throw new Error("Failed to fetch remaining seats");
      const data = await response.json();
      setRemainingSeats(data.data);
    } catch (error) {
      console.error("Error fetching remaining seats:", error);
      setRemainingSeats("Error loading seats");
    } finally {
    }
  };

  // Handle batch selection change
  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    const selectedBatchObject = batches.find(batch => batch.id === batchId);
  
    if (selectedBatchObject) {
      setFormData({
        ...formData,
        selectedBatch: selectedBatchObject.name
      });
    }
    setSelectedBatch(batchId);

  console.log("Formdata data " , formData.batches)

    if (batchId) {
      fetchRemainingSeats(batchId);
    } else {
      setRemainingSeats("");
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []); // Fetch batches on component mount

  // Calculate Total Fees
  const calculateTotalFees = () => {
    let updatedTotal = Number(courseFees) || 0; // Default to 0 if courseFees is empty or invalid
    console.log("without if ", discountAmount);
    if (discountRate === "amount-") {
      updatedTotal -= Number(discountAmount); // Subtract discount amount
      console.log(" with in if ", updatedTotal);
    } else if (discountRate === "amount+") {
      updatedTotal += Number(discountAmount); // Add discount amount
    } else if (discountRate === "percent-") {
      const percentage = updatedTotal * (Number(discountAmount) / 100); // Calculate percentage discount
      updatedTotal -= percentage;
    } else if (discountRate === "percent+") {
      const percentage = updatedTotal * (Number(discountAmount) / 100); // Calculate percentage increase
      updatedTotal += percentage;
    }
    setTotalFees(updatedTotal); // Update the state for Total Fees
  };

  // Handle Adding Installments
  const addInstallment = () => {
    setInstallments([...installments, { name: "", amount: 0, date: "" }]);
  };

  // // Handle Removing Installments
  const removeInstallment = (index) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };

  // // Handle Installment Change
  const handleInstallmentChange = (index, field, value) => {
    const updatedInstallments = [...installments];
    updatedInstallments[index][field] = value;
    setInstallments(updatedInstallments);
  };

  useEffect(() => {
    calculateTotalFees();
  }, [discountAmount, discountRate]); // Recalculate whenever these dependencies change
  return (
    <div className="p-4 space-y-6">
      {/* Table for Fees  */}
      <div className="w-full  h-[120px] ">
        <table className="table-fixed w-full h-[100px] text-m">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-2 py-2 w-[100px]">
                Course Fees
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[80px]">
                Discount Rate
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[100px]">
                Discount Amount
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[100px]">
                Total Fees
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[100px]">
                Fees Received
              </th>
              <th className="border border-gray-300 px-1 py-1 w-[100px]">
                Balance
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
                  value={courseFees}
                  onChange={(e) => setCourseFees(e.target.value)}
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
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                />
              </td>
              <td className="border border-gray-300 py-2 px-2 text-center">
                <input
                  type="number"
                  className="w-full h-8 text-black border rounded px-1 text-sm bg-gray-300"
                  value={totalFees}
                  readOnly
                />
              </td>
              <td className="border border-gray-300 py-2 px-2 text-center">
                <input
                  type="number"
                  className="w-full h-8 border rounded px-1 text-sm"
                  value={feesReceived}
                  onChange={(e) => setFeesReceived(e.target.value)}
                />
              </td>
              <td className="border border-gray-300 py-2 px-2 text-center">
                <input
                  className="w-full h-8 border rounded px-1 text-sm"
                  value={feesBalance}
                  onChange={(e) => setfeeBalance(e.target.value)}
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

      {/* Installment Details */}
      <div>
        <h2 className="font-bold">Installment Details</h2>
        {installments.map((installment, index) => (
          <div className="grid grid-cols-5 gap-4 items-center mb-2" key={index}>
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
        onClick={() => navigate("/")}
      >
        Cancel
      </button>
    </div>
  );
};

export default Fees_table;
