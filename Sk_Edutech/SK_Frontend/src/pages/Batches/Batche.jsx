import React, { useState, useEffect } from "react";
import axios from "axios";

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [batch, setBatch] = useState({ batchName: "", batchTiming: "", batchLimit: "" , currentStudents:"6" }); // create batches field

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/v1/batche/allBatches");
      console.log(response.data.data)

      setBatches(response.data.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleAddBatch = async () => {
    console.log(batch)
    if (!batch.batchName || !batch.batchTiming || !batch.batchLimit) {
      alert("All fields are mandatory!");
      return;
    }

    // Validate time format (e.g., 9AM - 10AM)
    const timeFormat = /^([1-9]|1[0-2])(AM|PM) - ([1-9]|1[0-2])(AM|PM)$/;
    if (!timeFormat.test(batch.batchTiming)) {
      alert("Invalid time format! Use format: 9AM - 10AM");
      return;
    }

    try {
      console.log(batch)
      await axios.post("http://localhost:8000/api/v1/batche/createBatch", batch);
      
      fetchBatches();
      setBatch({ batchName: "", batchTiming: "", batchLimit: "" });
      alert("Successfully created Batches")
    } catch (error) {
      console.error("Error adding batch", error);
      alert("Failed to create the batch")
    }
  };

  const deleteBatch = async (batchId) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/batche/${batchId}`);
      alert("Successfully deleted");
      // Refresh the batches list after deletion
      fetchBatches();
    } catch (error) {
      console.log(error.message);
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        Batch Management
      </h1>

      {/* Add New Batch Form */}
      <div className="bg-white p-6 shadow-md rounded mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Batch Name */}
          <div className="flex-1">
            <label className="block text-gray-700">Batch Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Batch name"
              value={batch.batchName}
              onChange={(e) =>
                setBatch({ ...batch, batchName: e.target.value.toUpperCase() })
              }
            />
          </div>

          {/* Timing */}
          <div className="flex-1">
            <label className="block text-gray-700">
              Timing (e.g., 9AM - 10AM)
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Timing"
              value={batch.batchTiming}
              onChange={(e) => setBatch({ ...batch, batchTiming: e.target.value })}
            />
          </div>

          {/* Max Students Allowed */}
          <div className="flex-1">
            <label className="block text-gray-700">Max Students Allowed</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="Max students"
              value={batch.batchLimit}
              onChange={(e) => {
                const value = Math.max(0, parseInt(e.target.value) || 0);
                setBatch({ ...batch, batchLimit: value });
              }}
            />
          </div>

          {/* Add Button */}
          <div className="flex items-end">
            <button
              onClick={handleAddBatch}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Batch
            </button>
          </div>
        </div>
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
                  onClick={() => deleteBatch(batch.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded">
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