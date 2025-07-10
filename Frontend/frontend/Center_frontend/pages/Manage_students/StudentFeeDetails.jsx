import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config";

const StudentFeeDetails = () => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [students, setStudents] = useState([
   
  ]);

  // Filter students based on search
  const filteredStudents = students.filter((student) =>
    student.studentName.toLowerCase().includes(search.toLowerCase())
  );

  // Sort students dynamically
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (typeof a[sortKey] === "string") {
      return a[sortKey].localeCompare(b[sortKey]);
    } else {
      return a[sortKey] - b[sortKey];
    }
  });

  // Calculate totals
  const totalFee = students.reduce(
    (acc, student) => acc + student.courseFee,
    0
  );
  const totalPaid = students.reduce((acc, student) => acc + student.paidFee, 0);
  const totalDue = students.reduce((acc, student) => acc + student.dueFee, 0);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showUpdateFeeModal, setShowUpdateFeeModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: "0",
    mode: "Cash",
    date: new Date().toISOString().slice(0, 10),
  });
  const[updatedPayment , setUpdatedPayment] = useState({});

  const handleUpdateFee = (studentId) => {
    // Validate amount is a positive number
    const amount = parseFloat(newPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount greater than zero");
      return;
    }
  
    // Create the payload for the API call
    const paymentData = {
      amount: amount,
      paymentMode: newPayment.mode,
      date: newPayment.date,
    };
  const franchiseId = localStorage.getItem('franchiseID');
    // Make the API call to update fees
    axios.post(`${API_BASE_URL}/api/v1/institute_fees/${studentId}/update-fee?franchiseId=${franchiseId}`, paymentData)
      .then(response => {
        if (response.data.success) {
          console.log("Student data coming:: " , response.json())
          // Update the local state with the updated student data
          const updatedStudents = students.map(student => {
            if (student.id === studentId) {
              // Return the updated student data from the response
              return {
                ...student,
                transactions: response.data.data.transactions
              };
            }
            return student;
          });
  
          // Update the state
          setStudents(updatedStudents);
          
          // Show success message
          alert("Payment recorded successfully!");
          
          // Close the modal and reset form
          setShowUpdateFeeModal(false);
          setNewPayment({
            amount: "0",
            mode: "Cash",
            date: new Date().toISOString().slice(0, 10),
          });
          
          // Optionally refresh the data from the server
          // fetchStudents(); // If you have a function to fetch all students
        } else {
          alert("Error: " + response.data.message);
        }
      })
      .catch(error => {
        console.error("Error updating fee:", error);
        const errorMessage = error.response?.data?.message || "Failed to update payment";
        alert("Error: " + errorMessage);
      });
  };

  // Fetch students data from API
  useEffect(() => {
    const limit = 15;
    const page = 1;
    const franchiseId = localStorage.getItem('franchiseID');
    axios
      .get(`${API_BASE_URL}/api/v1/institute_fees/students?limit=${limit}&page=${page}&franchiseId=${franchiseId}`)
      .then((response) => {
        console.log(response)
        const updatedStudents = response.data.data.map((student) => ({
          ...student,
          dueFee: student.courseFee - student.paidFee, // Ensure dueFee is properly calculated
        }));
        setStudents(updatedStudents);
      })
      .catch((error) => console.error("Error fetching students:", error));
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Student Fee Details
      </h1>

      <div className="flex justify-between items-center mb-4">
        <div>
          <input
            type="text"
            placeholder="Search Student Name"
            className="pl-3 pr-4 py-2 border rounded-md w-72 mr-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border rounded-md py-2 px-3"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="course">Course</option>
            <option value="courseFee">Course Fee</option>
            <option value="paidFee">Paid Fee</option>
            <option value="dueFee">Due Fee</option>
          </select>
        </div>

        <div>
          <p className="font-bold">Total Fee: ₹{totalFee}</p>
          <p className="text-green-600 font-bold">Received Fee: ₹{totalPaid}</p>
          <p className="text-red-600 font-bold">Balance Fee: ₹{totalDue}</p>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 border-b">ID</th>
              <th className="py-3 px-4 border-b">Student Name</th>
              <th className="py-3 px-4 border-b">Course</th>
              <th className="py-3 px-4 border-b">Course Fee</th>
              <th className="py-3 px-4 border-b">Paid Fee</th>
              <th className="py-3 px-4 border-b">Due Fee</th>
              <th className="py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student, index) => (
              <React.Fragment key={student.id}>
                <tr
                  onClick={() =>
                    setSelectedStudent(
                      selectedStudent === student.id ? null : student.id
                    )
                  }
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-3 px-4 border-b">{index + 1}</td>
                  <td className="py-3 px-4 border-b">{student.studentName}</td>
                  <td className="py-3 px-4 border-b">{student.course.courseName}</td>
                  <td className="py-3 px-4 border-b">₹{student.courseFee}</td>
                  <td className="py-3 px-4 border-b">₹{student.paidFee}</td>
                  <td className="py-3 px-4 border-b">₹{student.dueFee}</td>
                  <td className="py-3 px-4 border-b">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUpdateFeeModal(student.id);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600"
                    >
                      Update Fee
                    </button>
                  </td>
                </tr>
                {selectedStudent === student.id && (
                  <tr>
                    <td colSpan="7" className="bg-gray-50">
                      <div className="p-4">
                        <h2 className="text-lg font-semibold mb-2">
                          Fee History
                        </h2>
                        <table className="min-w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 px-4 border-b">Amount</th>
                              <th className="py-2 px-4 border-b">Date</th>
                              <th className="py-2 px-4 border-b">
                                Payment Mode
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.transactions.map((history, idx) => (
                              <tr key={idx}>
                                <td className="py-2 px-4 border-b">
                                  {history.amount}
                                </td>
                                <td className="py-2 px-4 border-b">
                                  {history.date}
                                </td>
                                <td className="py-2 px-4 border-b">
                                  {history.paymentMode}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update Fee Modal */}
      {showUpdateFeeModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Update Fee</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded"
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, amount: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Payment Mode</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={newPayment.mode}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, mode: e.target.value })
                }
              >
                <option value="Cash">Cash</option>
                {/* <option value="Online">Online</option> */}
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded"
                value={newPayment.date}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, date: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowUpdateFeeModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateFee(showUpdateFeeModal)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeDetails;
