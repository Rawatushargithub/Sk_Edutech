import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config";

const Batches = () => {
  const franchiseId = localStorage.getItem("franchiseId");
  const [batches, setBatches] = useState([]);
  const [batch, setBatch] = useState({
    batchName: "",
    batchTiming: "",
    batchLimit: 0,
    currentStudents: 0,
    franchiseId: franchiseId,
  });

  // Separate state for time inputs
  const [timeInputs, setTimeInputs] = useState({
    fromTime: "",
    toTime: "",
  });

  // Generate time options from 6 AM to 10 PM
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      if (hour <= 12) {
        times.push(hour === 12 ? "12PM" : `${hour}AM`);
      } else {
        times.push(`${hour - 12}PM`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const franchiseId = localStorage.getItem("franchiseID");
      batch.franchiseId = franchiseId;
      console.log(franchiseId);
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/institute_batche/allBatches?franchiseId=${franchiseId}`
      );
      console.log(response.data.data);

      setBatches(response.data.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
  const formatTimeToAMPM = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleTimeChange = (field, value) => {
    const updatedTimeInputs = { ...timeInputs, [field]: value };
    setTimeInputs(updatedTimeInputs);

    // Convert 24-hour format to 12-hour format and concatenate
    if (updatedTimeInputs.fromTime && updatedTimeInputs.toTime) {
      const fromTime12 = formatTimeToAMPM(updatedTimeInputs.fromTime);
      const toTime12 = formatTimeToAMPM(updatedTimeInputs.toTime);
      const concatenatedTiming = `${fromTime12} - ${toTime12}`;
      setBatch({ ...batch, batchTiming: concatenatedTiming });
    } else {
      setBatch({ ...batch, batchTiming: "" });
    }
  };

  const handleAddBatch = async () => {
    console.log(batch);
    if (!batch.batchName || !batch.batchTiming || !batch.batchLimit) {
      alert("All fields are mandatory!");
      return;
    }

    // SIMPLEST SOLUTION - Replace the entire validation section with:
if (!batch.batchName || !batch.batchTiming || !batch.batchLimit) {
  alert("All fields are mandatory!");
  return;
}

// Add time validation
if (!timeInputs.fromTime || !timeInputs.toTime) {
  alert("Please select both start and end times!");
  return;
}

// Check if end time is after start time
if (timeInputs.fromTime >= timeInputs.toTime) {
  alert("End time must be after start time!");
  return;
}
    console.log(batch.batchName);
    try {
      console.log(batch);
      const franchiseId = localStorage.getItem("franchiseID");
      await axios.post(
        `${API_BASE_URL}/api/v1/institute_batche/createBatch?franchiseId=${franchiseId}`,
        batch
      );

      fetchBatches();
      setBatch({ batchName: "", batchTiming: "", batchLimit: "" });
      setTimeInputs({ fromTime: "", toTime: "" }); // Reset time inputs
      alert("Successfully created Batches");
    } catch (error) {
      console.error("Error adding batch", error);
      alert("Failed to create the batch");
    }
  };

  const deleteBatch = async (batchId) => {
    try {
      const franchiseId = localStorage.getItem("franchiseID");
      await axios.delete(
        `${API_BASE_URL}/api/v1/institute_batche/${batchId}?franchiseId=${franchiseId}`
      );
      alert("Batch deleted successfully.");
      // Refresh the batches list after deletion
      fetchBatches();
    } catch (error) {
      console.log(error.message);
      alert("Failed to delete the batch. Please try again.");
    }
  };

  // Guarded delete handler with validations and messages
  const handleDeleteClick = (batch) => {
    const enrolled = Number(batch.currentStudents) || 0;

    if (enrolled > 0) {
      alert(
        "This batch cannot be deleted because students are currently enrolled. Deleting the batch would permanently remove the associated student registrations and data."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this batch? This action cannot be undone."
    );
    if (!confirmed) return;

    deleteBatch(batch.id);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        Batch Management
      </h1>

      {/* Add New Batch Form */}
      <div className="bg-white p-6 shadow-md rounded mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
    {/* Batch Name */}
    <div>
      <label className="block text-gray-700 mb-2">Batch Name</label>
      <input
        type="text"
        className="w-full p-2 border rounded h-10"
        placeholder="Batch name"
        value={batch.batchName}
        onChange={(e) =>
          setBatch({ ...batch, batchName: e.target.value.toUpperCase() })
        }
      />
    </div>

    {/* From Time */}
    <div>
      <label className="block text-gray-700 font-medium mb-2">
        <span className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          From Time
        </span>
      </label>
      <input
        type="time"
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
        value={timeInputs.fromTime}
        onChange={(e) => handleTimeChange("fromTime", e.target.value)}
      />
      {timeInputs.fromTime && (
        <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          📅 {formatTimeToAMPM(timeInputs.fromTime)}
        </div>
      )}
    </div>

    {/* To Time */}
    <div>
      <label className="block text-gray-700 font-medium mb-2">
        <span className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          To Time
        </span>
      </label>
      <input
        type="time"
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 h-10"
        value={timeInputs.toTime}
        onChange={(e) => handleTimeChange("toTime", e.target.value)}
      />
      {timeInputs.toTime && (
        <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          📅 {formatTimeToAMPM(timeInputs.toTime)}
        </div>
      )}
    </div>

    {/* Max Students and Button Container */}
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-gray-700 mb-2">Max Students</label>
        <input
          type="number"
          className="w-full p-2 border rounded h-10"
          placeholder="0"
          value={batch.batchLimit || ""}
          onChange={(e) => {
            const value = e.target.value;
            setBatch({
              ...batch,
              batchLimit:
                value === "" ? 0 : Math.max(0, parseInt(value) || 0),
            });
          }}
        />
      </div>
      <div className="flex items-end">
        <button
          onClick={handleAddBatch}
          className="bg-green-500 text-white px-4 py-2 rounded h-10 w-full"
        >
          Add Batch
        </button>
      </div>
    </div>
  </div>

        {/* Display concatenated timing */}
        {batch.batchTiming && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">
              Batch Timing:{" "}
            </span>
            <span className="font-bold text-blue-800">{batch.batchTiming}</span>
            <div className="text-xs text-blue-500 mt-1">
              ⏱️ {timeInputs.fromTime && formatTimeToAMPM(timeInputs.fromTime)}{" "}
              - {timeInputs.toTime && formatTimeToAMPM(timeInputs.toTime)}
            </div>
          </div>
        )}
      </div>

      {/* Batches Table */}
      <div className="bg-white p-6 shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Batches List</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Batch Name</th>
              <th className="border p-2">Timing</th>
              <th className="border p-2">Enrolled Students</th>
              <th className="border p-2">Allowed Students</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id} className="text-center">
                <td className="border p-2">{batch.name}</td>
                <td className="border p-2">{batch.timings}</td>
                <td className="border p-2">{batch.currentStudents}</td>
                <td className="border p-2">{batch.limit}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDeleteClick(batch)}
                    className={`${(Number(batch.currentStudents) || 0) > 0 ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"} px-3 py-1 rounded transition-colors`}
                    title={(Number(batch.currentStudents) || 0) > 0 ? "Cannot delete: students are enrolled in this batch" : "Delete this batch"}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Batches;
