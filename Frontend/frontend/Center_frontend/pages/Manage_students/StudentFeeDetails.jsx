

import React, { useState, useEffect } from "react";
import { Search, Calendar, CreditCard, Users, Clock, CheckCircle, XCircle, IndianRupee } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../../config";

const FeesManagementSystem = () => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("studentName");
  
  // Normal Fees Data
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showUpdateFeeModal, setShowUpdateFeeModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    mode: "Cash",
    date: new Date().toISOString().slice(0, 10),
  });

  // Installment Data
  const [installmentStudents, setInstallmentStudents] = useState([]);
  const [selectedInstallmentStudent, setSelectedInstallmentStudent] = useState(null);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [installmentPayment, setInstallmentPayment] = useState({
    installmentId: "",
    amount: "",
    paymentMode: "Cash",
    date: new Date().toISOString().slice(0, 10),
  });


  // Filter and sort functions
  const getFilteredAndSortedData = (data, searchTerm, sortKey) => {
    const filtered = data.filter((item) =>
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return [...filtered].sort((a, b) => {
      if (typeof a[sortKey] === "string") {
        return a[sortKey].localeCompare(b[sortKey]);
      } else {
        return a[sortKey] - b[sortKey];
      }
    });
  };

  const filteredStudents = getFilteredAndSortedData(students, search, sortKey);
  const filteredInstallmentStudents = getFilteredAndSortedData(installmentStudents, search, sortKey);

  // Calculate totals for normal fees
  const totalFee = students.reduce((acc, student) => acc + student.courseFee, 0);
  const totalPaid = students.reduce((acc, student) => acc + student.paidFee, 0);
  const totalDue = students.reduce((acc, student) => acc + student.dueFee, 0);

  // Calculate totals for installments
  const totalInstallmentAmount = installmentStudents.reduce(
    (acc, student) => acc + student.totalInstallmentAmount, 0
  );
  const totalInstallmentPaid = installmentStudents.reduce(
    (acc, student) => acc + student.paidInstallmentAmount, 0
  );
  const totalInstallmentDue = installmentStudents.reduce(
    (acc, student) => acc + student.dueInstallmentAmount, 0
  );

  // Handle normal fee update
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
    console.log(studentId)
  const franchiseId = localStorage.getItem('franchiseID');
    // Make the API call to update fees
    axios.post(`${API_BASE_URL}/api/v1/institute_fees/${studentId}/update-fee`, paymentData)
      .then(response => {
        if (response.data.success) {
          console.log("Student data coming:: " , response)
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
  

  // Handle installment payment
  const handleInstallmentPayment = (studentId, installmentId) => {
    const amount = parseFloat(installmentPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount greater than zero");
      return;
    }

    const paymentData = {
      installmentId: installmentId,
      amount: amount,
      paymentMode: installmentPayment.paymentMode,
      date: installmentPayment.date,
    };

    // Simulate API call
    console.log("Updating installment for student:", studentId, paymentData);
    
    // Update local state (replace with actual API call)
    const updatedStudents = installmentStudents.map(student => {
      if (student.id === studentId) {
        const updatedInstallments = student.installments.map(inst => {
          if (inst.id === installmentId) {
            return { ...inst, paid: true, paidAmount: amount };
          }
          return inst;
        });
        
        const newPaidAmount = student.paidInstallmentAmount + amount;
        const newDueAmount = student.totalInstallmentAmount - newPaidAmount;
        
        return {
          ...student,
          installments: updatedInstallments,
          paidInstallmentAmount: newPaidAmount,
          dueInstallmentAmount: newDueAmount,
        };
      }
      return student;
    });

    setInstallmentStudents(updatedStudents);
    setShowInstallmentModal(false);
    setInstallmentPayment({
      installmentId: "",
      amount: "",
      paymentMode: "Cash",
      date: new Date().toISOString().slice(0, 10),
    });
    alert("Installment payment recorded successfully!");
  };

  // Mock data initialization
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
          dueFee: student.totalFee - student.paidFee, // Ensure dueFee is properly calculated
        }));
        setStudents(updatedStudents);
      })
      .catch((error) => console.error("Error fetching students:", error));

    // Mock installment data
    const mockInstallmentStudents = [
      {
        id: "3",
        studentName: "Alice Johnson",
        course: { courseName: "Mobile App Development" },
        totalInstallmentAmount: 60000,
        paidInstallmentAmount: 20000,
        dueInstallmentAmount: 40000,
        installments: [
          { id: "i1", installmentName: "First Installment", amount: 20000, date: "2024-01-01", paid: true, paidAmount: 20000 },
          { id: "i2", installmentName: "Second Installment", amount: 20000, date: "2024-03-01", paid: false, paidAmount: 0 },
          { id: "i3", installmentName: "Third Installment", amount: 20000, date: "2024-05-01", paid: false, paidAmount: 0 }
        ]
      },
      {
        id: "4",
        studentName: "Bob Wilson",
        course: { courseName: "UI/UX Design" },
        totalInstallmentAmount: 45000,
        paidInstallmentAmount: 30000,
        dueInstallmentAmount: 15000,
        installments: [
          { id: "i4", installmentName: "First Installment", amount: 15000, date: "2024-01-15", paid: true, paidAmount: 15000 },
          { id: "i5", installmentName: "Second Installment", amount: 15000, date: "2024-03-15", paid: true, paidAmount: 15000 },
          { id: "i6", installmentName: "Third Installment", amount: 15000, date: "2024-05-15", paid: false, paidAmount: 0 }
        ]
      }
    ];

    setInstallmentStudents(mockInstallmentStudents);
  }, []);

  const StatCard = ({ title, value, color, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
      <div className={`p-3 rounded-full ${color} mr-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-800">₹{value.toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Fee Details</h1>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "transactions"
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Fee Transactions
          </button>
          <button
            onClick={() => setActiveTab("installments")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "installments"
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Installment Management
          </button>
        </div>
      </div>

      {/* Fee Transactions Tab */}
      {activeTab === "transactions" && (
        <div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard title="Total Fee" value={totalFee} color="bg-blue-500" icon={IndianRupee} />
            <StatCard title="Received Fee" value={totalPaid} color="bg-green-500" icon={CheckCircle} />
            <StatCard title="Balance Fee" value={totalDue} color="bg-red-500" icon={XCircle} />
          </div>

          {/* Search and Filter */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Student Name"
                  className="pl-10 pr-4 py-2 border rounded-lg w-72"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="border rounded-lg py-2 px-3"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="studentName">Name</option>
                <option value="courseFee">Course Fee</option>
                <option value="paidFee">Paid Fee</option>
                <option value="dueFee">Due Fee</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-y-auto max-h-96">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Student ID</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Student Name</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Course</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Course Fee</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Student Fee</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Paid Fee</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Due Fee</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <React.Fragment key={student.id}>
                    <tr
                      onClick={() =>
                        setSelectedStudent(
                          selectedStudent === student.id ? null : student.id
                        )
                      }
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 border-b">{student.rollNumber}</td>
                      <td className="py-3 px-4 border-b font-medium">{student.studentName}</td>
                      <td className="py-3 px-4 border-b">{student.course.courseName}</td>
                      <td className="py-3 px-4 border-b">{student.courseFee.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b">₹{student.totalFee.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b text-green-600">₹{student.paidFee.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b text-red-600">₹{student.dueFee.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUpdateFeeModal(student.id);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md shadow hover:bg-blue-600 transition-colors"
                        >
                          Update Fee
                        </button>
                      </td>
                    </tr>
                    {selectedStudent === student.id && (
                      <tr>
                        <td colSpan="7" className="bg-gray-50">
                          <div className="p-4">
                            <h3 className="text-lg font-semibold mb-3">Fee History</h3>
                            <div className="bg-white rounded-lg overflow-hidden">
                              <table className="min-w-full text-left border-collapse">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="py-2 px-4 border-b font-medium">Amount</th>
                                    <th className="py-2 px-4 border-b font-medium">Date</th>
                                    <th className="py-2 px-4 border-b font-medium">Payment Mode</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {student.transactions.map((transaction, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                      <td className="py-2 px-4 border-b">₹{transaction.amount.toLocaleString()}</td>
                                      <td className="py-2 px-4 border-b">{transaction.date}</td>
                                      <td className="py-2 px-4 border-b">{transaction.paymentMode}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Installment Management Tab */}
      {activeTab === "installments" && (
        <div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard title="Total Installment" value={totalInstallmentAmount} color="bg-purple-500" icon={IndianRupee} />
            <StatCard title="Paid Installment" value={totalInstallmentPaid} color="bg-green-500" icon={CheckCircle} />
            <StatCard title="Due Installment" value={totalInstallmentDue} color="bg-red-500" icon={XCircle} />
          </div>

          {/* Search and Filter */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Student Name"
                  className="pl-10 pr-4 py-2 border rounded-lg w-72"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Installment Students Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">ID</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Student Name</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Course</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Total Amount</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Paid Amount</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Due Amount</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstallmentStudents.map((student, index) => (
                  <React.Fragment key={student.id}>
                    <tr
                      onClick={() =>
                        setSelectedInstallmentStudent(
                          selectedInstallmentStudent === student.id ? null : student.id
                        )
                      }
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 border-b">{index + 1}</td>
                      <td className="py-3 px-4 border-b font-medium">{student.studentName}</td>
                      <td className="py-3 px-4 border-b">{student.course.courseName}</td>
                      <td className="py-3 px-4 border-b">₹{student.totalInstallmentAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b text-green-600">₹{student.paidInstallmentAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b text-red-600">₹{student.dueInstallmentAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInstallmentStudent(student.id);
                          }}
                          className="bg-purple-500 text-white px-3 py-1 rounded-md shadow hover:bg-purple-600 transition-colors"
                        >
                          View Installments
                        </button>
                      </td>
                    </tr>
                    {selectedInstallmentStudent === student.id && (
                      <tr>
                        <td colSpan="7" className="bg-gray-50">
                          <div className="p-4">
                            <h3 className="text-lg font-semibold mb-3">Installment Details</h3>
                            <div className="bg-white rounded-lg overflow-hidden">
                              <table className="min-w-full text-left border-collapse">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="py-2 px-4 border-b font-medium">Installment Name</th>
                                    <th className="py-2 px-4 border-b font-medium">Amount</th>
                                    <th className="py-2 px-4 border-b font-medium">Due Date</th>
                                    <th className="py-2 px-4 border-b font-medium">Status</th>
                                    <th className="py-2 px-4 border-b font-medium">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {student.installments.map((installment) => (
                                    <tr key={installment.id} className="hover:bg-gray-50">
                                      <td className="py-2 px-4 border-b">{installment.installmentName}</td>
                                      <td className="py-2 px-4 border-b">₹{installment.amount.toLocaleString()}</td>
                                      <td className="py-2 px-4 border-b">{installment.date}</td>
                                      <td className="py-2 px-4 border-b">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            installment.paid
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {installment.paid ? "Paid" : "Pending"}
                                        </span>
                                      </td>
                                      <td className="py-2 px-4 border-b">
                                        {!installment.paid && (
                                          <button
                                            onClick={() => {
                                              setInstallmentPayment({
                                                ...installmentPayment,
                                                installmentId: installment.id,
                                                amount: installment.amount.toString(),
                                              });
                                              setShowInstallmentModal(student.id);
                                            }}
                                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                                          >
                                            Pay Now
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Fee Modal */}
      {showUpdateFeeModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Update Fee</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, amount: e.target.value })
                }
                placeholder="Enter amount"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Payment Mode</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPayment.mode}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, mode: e.target.value })
                }
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPayment.date}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, date: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowUpdateFeeModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateFee(showUpdateFeeModal)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Installment Payment Modal */}
      {showInstallmentModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Record Installment Payment</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={installmentPayment.amount}
                onChange={(e) =>
                  setInstallmentPayment({ ...installmentPayment, amount: e.target.value })
                }
                placeholder="Enter amount"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Payment Mode</label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={installmentPayment.paymentMode}
                onChange={(e) =>
                  setInstallmentPayment({ ...installmentPayment, paymentMode: e.target.value })
                }
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={installmentPayment.date}
                onChange={(e) =>
                  setInstallmentPayment({ ...installmentPayment, date: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowInstallmentModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleInstallmentPayment(showInstallmentModal, installmentPayment.installmentId)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesManagementSystem;
