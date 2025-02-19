import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentFeeDetails = () => {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("name");
    const [students, setStudents] = useState([
        {
            id: 1,
            code: "ST001",
            name: "PAWAN SINGH",
            course: "Advanced Diploma in Computer Application",
            courseFee: 12000,
            paidFee: 12000,
            dueFee: 0,
            feeHistory: [
        { date: "2025-01-01", amount: 2300, mode: "Card" },
        
      ],
          },
          {
            id: 2,
            code: "ST002",
            name: "AASHISH THAKUR",
            course: "Basic Course in MS Office",
            courseFee: 3000,
            paidFee: 2400,
            dueFee: 600,
            feeHistory: [
        { date: "2025-01-01", amount: 2300, mode: "Card" },
        
      ],
          },
          {
              id: 3,
              code: "ST003",
              name: "ANKUR KUSHWAHA",
              course: "Basic Course in MS Office",
              courseFee: 3000,
              paidFee: 2400,
              dueFee: 600,
              feeHistory: [
        { date: "2025-01-01", amount: 2300, mode: "Card" },
        
      ],
            },
            {
              id: 4,
              code: "ST004",
              name: "TUSHAR RAWAT",
              course: "Basic Course in MS Office",
              courseFee: 3000,
              paidFee: 2400,
              dueFee: 600,
              feeHistory: [
        { date: "2025-01-01", amount: 2300, mode: "Card" },
        
      ],
            },
            {
              id: 5,
              code: "ST005",
              name: "ANIL KUMAR",
              course: "Basic Course in MS Office",
              courseFee: 3000,
              paidFee: 2400,
              dueFee: 600,
              feeHistory: [
        { date: "2025-01-01", amount: 2300, mode: "Card" },
        
      ],
            },
    ]);

    // Fetch students data from API
    useEffect(() => {
        axios.get("/api/students")
            .then(response => {
                const updatedStudents = response.data.map(student => ({
                    ...student,
                    dueFee: student.courseFee - student.paidFee // Ensure dueFee is properly calculated
                }));
                setStudents(updatedStudents);
            })
            .catch(error => console.error("Error fetching students:", error));
    }, []);

    // Filter students based on search
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(search.toLowerCase())
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
    const totalFee = students.reduce((acc, student) => acc + student.courseFee, 0);
    const totalPaid = students.reduce((acc, student) => acc + student.paidFee, 0);
    const totalDue = students.reduce((acc, student) => acc + student.dueFee, 0);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showUpdateFeeModal, setShowUpdateFeeModal] = useState(false);
    const [newPayment, setNewPayment] = useState({
    amount: "0",
    mode: "Cash",
    date: new Date().toISOString().slice(0, 10),
  });

  
  const handleUpdateFee = (studentId) => {
    const updatedStudents = students.map((student) => {
      if (student.id === studentId) {
        const updatedPaidFee = student.paidFee + parseFloat(newPayment.amount);
        return {
          ...student,
          paidFee: updatedPaidFee,
          dueFee: student.courseFee - updatedPaidFee,
          feeHistory: [
            ...student.feeHistory,
            { date: newPayment.date, amount: parseFloat(newPayment.amount), mode: newPayment.mode },
          ],
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    setShowUpdateFeeModal(false);
    setNewPayment({ amount: "0", mode: "Cash", date: new Date().toISOString().slice(0, 10) });
  };
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Fee Details</h1>
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search Student Name"
                    className="pl-3 pr-4 py-2 border rounded-md w-72"
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
                    setSelectedStudent(selectedStudent === student.id ? null : student.id)
                  }
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-3 px-4 border-b">{index + 1}</td>
                  <td className="py-3 px-4 border-b">{student.name}</td>
                  <td className="py-3 px-4 border-b">{student.course}</td>
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
                        <h2 className="text-lg font-semibold mb-2">Fee History</h2>
                        <table className="min-w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 px-4 border-b">Amount</th>
                              <th className="py-2 px-4 border-b">Date</th>
                              <th className="py-2 px-4 border-b">Payment Mode</th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.feeHistory.map((history, idx) => (
                              <tr key={idx}>
                                <td className="py-2 px-4 border-b">{history.amount}</td>
                                <td className="py-2 px-4 border-b">{history.date}</td>
                                <td className="py-2 px-4 border-b">{history.mode}</td>
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
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Payment Mode</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={newPayment.mode}
                onChange={(e) => setNewPayment({ ...newPayment, mode: e.target.value })}
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
                onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
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
