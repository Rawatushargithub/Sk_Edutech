import React, { useState, useEffect } from "react";  
import { Search, Calendar, CreditCard, Users, Clock, CheckCircle, XCircle, IndianRupee } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../../config";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
// Import for Excel export
import * as XLSX from 'xlsx';
// Import for PDF export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


ChartJS.register(ArcElement, Tooltip, Legend);


const FeesManagementSystem = () => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("studentName");
  const [timeFilter, setTimeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
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
    paymentType: "normal"
  });
  const [paymentMode, setPaymentMode] = useState("normal"); // normal, full_payment, custom
  const [totalDueAmount, setTotalDueAmount] = useState(0);

  // Export states
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Payment History Modal states
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [selectedPaymentHistory, setSelectedPaymentHistory] = useState([]);
  const [selectedInstallmentName, setSelectedInstallmentName] = useState('');



  // Filter and sort functions
  const getFilteredAndSortedData = (data, searchTerm, sortKey, timeFilter, startDate, endDate) => {
    // Time Filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());


      const filterDate = (date) => {
        const admissionDate = new Date(date);
        if (isNaN(admissionDate.getTime())) return false;


        switch (timeFilter) {
          case 'today':
            return admissionDate >= today;
          case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return admissionDate >= yesterday && admissionDate < today;
          case 'last7days':
            const last7days = new Date(today);
            last7days.setDate(today.getDate() - 7);
            return admissionDate >= last7days;
          case 'last30days':
            const last30days = new Date(today);
            last30days.setDate(today.getDate() - 30);
            return admissionDate >= last30days;
          case 'custom':
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999); // Include the entire end day
              return admissionDate >= start && admissionDate <= end;
            }
            return true;
          default:
            return true;
        }
      };
      data = data.filter(item => filterDate(item.admissionDate));
    }


    let filteredData = data.filter(item => {
      const term = searchTerm.toLowerCase();
      return (
        item.studentName.toLowerCase().includes(term) ||
        (item.rollNumber && item.rollNumber.toLowerCase().includes(term)) ||
        (item.course.courseName && item.course.courseName.toLowerCase().includes(term))
      );
    });
    
    return [...filteredData].sort((a, b) => {
      if (typeof a[sortKey] === "string") {
        return a[sortKey].localeCompare(b[sortKey]);
      } else {
        return a[sortKey] - b[sortKey];
      }
    });
  };


  const filteredStudents = getFilteredAndSortedData(students, search, sortKey, timeFilter, startDate, endDate);
  const filteredInstallmentStudents = getFilteredAndSortedData(installmentStudents, search, sortKey, timeFilter, startDate, endDate);


  // Calculate totals for normal fees based on filtered students for real-time updates
  const totalFee = filteredStudents.reduce((acc, student) => acc + student.totalFee, 0);
  const totalPaid = filteredStudents.reduce((acc, student) => acc + student.paidFee, 0);
  const totalDue = filteredStudents.reduce((acc, student) => acc + student.dueFee, 0);


  // Update these calculations based on your actual data structure
const totalInstallmentAmount = installmentStudents.reduce((acc, student) => {
  const studentTotal = student.installments?.reduce((sum, inst) => sum + inst.amount, 0) || 0;
  return acc + studentTotal;
}, 0);


const totalInstallmentPaid = installmentStudents.reduce((acc, student) => {
  const studentPaid = student.installments?.reduce((sum, inst) => sum + (inst.paid ? inst.amount : 0), 0) || 0;
  return acc + studentPaid;
}, 0);


const totalInstallmentDue = totalInstallmentAmount - totalInstallmentPaid;


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
  
  // Enhanced installment payment handler with flexible payment scenarios
  const handleInstallmentPayment = (studentId, installmentId) => {
    const amount = parseFloat(installmentPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount greater than zero");
      return;
    }

    const paymentData = {
      amount: amount,
      paymentMode: installmentPayment.paymentMode,
      date: installmentPayment.date,
      paymentType: installmentPayment.paymentType
    };

    // Make API call to update installment
    axios.put(`${API_BASE_URL}/api/v1/institute_fees/installments/${installmentId}/update-payment`, paymentData)
      .then(response => {
        if (response.data.success) {
          const { updatedInstallments, paymentScenario, overpayment, totalProcessed, studentTotals } = response.data.data;
          
          // Show enhanced success message based on payment scenario
          let message = `Payment of ₹${totalProcessed.toLocaleString()} processed successfully.`;
          
          switch(paymentScenario) {
            case "full_payment":
              message += " All installments have been marked as paid!";
              break;
            case "overpayment":
              message += ` Payment distributed across multiple installments.`;
              if (overpayment > 0) {
                message += ` Excess amount: ₹${overpayment.toLocaleString()}`;
              }
              break;
            case "underpayment":
              message += " Partial payment recorded. Remaining balance updated.";
              break;
            case "exact_payment":
              message += " Installment fully paid!";
              break;
          }
          
          alert(message);

          // Update local state with all affected installments
          const updatedStudents = installmentStudents.map(student => {
            if (student._id === studentId) {
              // Update installments with the response data
              const updatedInstallmentsList = student.installments.map(inst => {
                const updatedInst = updatedInstallments.find(updated => updated._id === inst._id);
                if (updatedInst) {
                  return {
                    ...inst,
                    paid: updatedInst.paid,
                    paidAmount: updatedInst.paidAmount,
                    remainingAmount: updatedInst.remainingAmount || 0,
                    status: updatedInst.status,
                    paymentMode: updatedInst.paymentMode,
                    paymentDate: updatedInst.paymentDate,
                    paymentHistory: updatedInst.paymentHistory || []
                  };
                }
                return inst;
              });
              
              // Use totals from backend response
              return {
                ...student,
                installments: updatedInstallmentsList,
                totalInstallmentAmount: studentTotals.totalInstallmentAmount,
                paidInstallmentAmount: studentTotals.paidInstallmentAmount,
                dueInstallmentAmount: studentTotals.dueInstallmentAmount
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
            paymentType: "normal"
          });
          setPaymentMode("normal");
        } else {
          alert("Error: " + response.data.message);
        }
      })
      .catch(error => {
        console.error("Error updating installment:", error);
        const errorMessage = error.response?.data?.message || "Failed to update installment payment";
        alert("Error: " + errorMessage);
      });
  };

  // Calculate total due amount for a student
  const calculateStudentDueAmount = (student) => {
    return student.installments.reduce((sum, inst) => {
      const remaining = inst.amount - (inst.paidAmount || 0);
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);
  };

  // Handle payment mode change
  const handlePaymentModeChange = (mode, student, installment) => {
    setPaymentMode(mode);
    const studentDueAmount = calculateStudentDueAmount(student);
    setTotalDueAmount(studentDueAmount);
    
    let amount = "";
    switch(mode) {
      case "full_payment":
        amount = studentDueAmount.toString();
        break;
      case "normal":
        const remainingAmount = installment.amount - (installment.paidAmount || 0);
        amount = remainingAmount.toString();
        break;
      case "custom":
        amount = "";
        break;
    }
    
    setInstallmentPayment({
      ...installmentPayment,
      installmentId: installment._id,
      amount: amount,
      paymentType: mode
    });
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

 
    // Fetch installment students
    axios
      .get(`${API_BASE_URL}/api/v1/institute_fees/installments/students?franchiseId=${franchiseId}`)
      .then((response) => {
        console.log("Installment data:", response);
        if (response.data.success) {
          setInstallmentStudents(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching installment students:", error);
        setInstallmentStudents([]);
      });
  }, []);

  // Export Functions
  const prepareTransactionExportData = (studentsData) => {
    return studentsData.map((student, index) => ({
      'S/N': index + 1,
      'Student ID': student.rollNumber || '',
      'Student Name': student.studentName || '',
      'Course': student.course?.courseName || '',
      'Course Fee': `Rs.${(student.courseFee || 0).toLocaleString()}`,
      'Student Fee': `Rs.${(student.totalFee || 0).toLocaleString()}`,
      'Paid Fee': `Rs.${(student.paidFee || 0).toLocaleString()}`,
      'Due Fee': `Rs.${(student.dueFee || 0).toLocaleString()}`,
      'Admission Date': student.admissionDate || '',
      'Mobile': student.studentMobile || '',
      'Email': student.email || '',
    }));
  };

  const prepareInstallmentExportData = (studentsData) => {
    const exportData = [];
    studentsData.forEach((student, index) => {
      if (student.installments && student.installments.length > 0) {
        student.installments.forEach((installment, instIndex) => {
          exportData.push({
            'S/N': `${index + 1}.${instIndex + 1}`,
            'Student ID': student._id || '',
            'Student Name': student.studentName || '',
            'Course': student.course?.courseName || '',
            'Installment Name': installment.installmentName || '',
            'Amount': `Rs.${(installment.amount || 0).toLocaleString()}`,
            'Due Date': installment.date || '',
            'Status': installment.paid ? 'Paid' : 'Pending',
            'Total Installment': `Rs.${(student.totalInstallmentAmount || 0).toLocaleString()}`,
            'Paid Amount': `Rs.${(student.paidInstallmentAmount || 0).toLocaleString()}`,
            'Due Amount': `Rs.${(student.dueInstallmentAmount || 0).toLocaleString()}`,
          });
        });
      } else {
        exportData.push({
          'S/N': index + 1,
          'Student ID': student._id || '',
          'Student Name': student.studentName || '',
          'Course': student.course?.courseName || '',
          'Installment Name': 'No Installments',
          'Amount': 'Rs.0',
          'Due Date': '',
          'Status': 'N/A',
          'Total Installment': `Rs.${(student.totalInstallmentAmount || 0).toLocaleString()}`,
          'Paid Amount': `Rs.${(student.paidInstallmentAmount || 0).toLocaleString()}`,
          'Due Amount': `Rs.${(student.dueInstallmentAmount || 0).toLocaleString()}`,
        });
      }
    });
    return exportData;
  };

  const exportToExcel = async () => {
    try {
      setShowExportDropdown(false);
      alert('Preparing Excel file... This may take a moment.');

      let exportData;
      let fileName;
      
      if (activeTab === 'transactions') {
        exportData = prepareTransactionExportData(filteredStudents);
        fileName = `Fee_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
      } else {
        exportData = prepareInstallmentExportData(filteredInstallmentStudents);
        fileName = `Installment_Details_${new Date().toISOString().split('T')[0]}.xlsx`;
      }
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      
      // Set column widths
      const colWidths = activeTab === 'transactions' ? [
        { wch: 5 },   // S/N
        { wch: 15 },  // Student ID
        { wch: 25 },  // Student Name
        { wch: 30 },  // Course
        { wch: 15 },  // Course Fee
        { wch: 15 },  // Student Fee
        { wch: 15 },  // Paid Fee
        { wch: 15 },  // Due Fee
        { wch: 15 },  // Admission Date
        { wch: 15 },  // Mobile
        { wch: 25 },  // Email
      ] : [
        { wch: 8 },   // S/N
        { wch: 15 },  // Student ID
        { wch: 25 },  // Student Name
        { wch: 30 },  // Course
        { wch: 20 },  // Installment Name
        { wch: 12 },  // Amount
        { wch: 12 },  // Due Date
        { wch: 10 },  // Status
        { wch: 15 },  // Total Installment
        { wch: 15 },  // Paid Amount
        { wch: 15 },  // Due Amount
      ];
      
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, activeTab === 'transactions' ? 'Fee Transactions' : 'Installments');
      XLSX.writeFile(wb, fileName);
      
      alert(`Excel file "${fileName}" has been downloaded successfully!`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  const exportToPDF = async () => {
    try {
      setShowExportDropdown(false);
      alert('Preparing PDF file... This may take a moment.');

      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      // Add title
      doc.setFontSize(16);
      const title = activeTab === 'transactions' ? 'Student Fee Transactions' : 'Student Installment Details';
      doc.text(title, 14, 20);
      
      // Add date
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate}`, 14, 28);
      
      let exportData, columns, rows, fileName;
      
      if (activeTab === 'transactions') {
        exportData = prepareTransactionExportData(filteredStudents);
        columns = ['S/N', 'Student ID', 'Student Name', 'Course', 'Course Fee', 'Student Fee', 'Paid Fee', 'Due Fee'];
        rows = exportData.map(student => [
          student['S/N'],
          student['Student ID'],
          student['Student Name'],
          student['Course'],
          `Rs.${student['Course Fee'].toLocaleString()}`,
          `Rs.${student['Student Fee'].toLocaleString()}`,
          `Rs.${student['Paid Fee'].toLocaleString()}`,
          `Rs.${student['Due Fee'].toLocaleString()}`
        ]);
        fileName = `Fee_Transactions_${new Date().toISOString().split('T')[0]}.pdf`;
      } else {
        exportData = prepareInstallmentExportData(filteredInstallmentStudents);
        columns = ['S/N', 'Student Name', 'Course', 'Installment', 'Amount', 'Due Date', 'Status'];
        rows = exportData.map(item => [
          item['S/N'],
          item['Student Name'],
          item['Course'],
          item['Installment Name'],
          `Rs.${item['Amount'].toLocaleString()}`,
          item['Due Date'],
          item['Status']
        ]);
        fileName = `Installment_Details_${new Date().toISOString().split('T')[0]}.pdf`;
      }

      // Add table using autoTable
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35, right: 14, bottom: 20, left: 14 },
      });

      doc.save(fileName);
      alert(`PDF file "${fileName}" has been downloaded successfully!`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error exporting to PDF. Please try again.');
    }
  };

  // Toggle export dropdown
  const toggleExportDropdown = () => {
    setShowExportDropdown(!showExportDropdown);
  };

  // Close dropdown when clicking outside
  const closeDropdownOnOutsideClick = (e) => {
    if (showExportDropdown && !e.target.closest('.export-dropdown-container')) {
      setShowExportDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeDropdownOnOutsideClick);
    return () => {
      document.removeEventListener('click', closeDropdownOnOutsideClick);
    };
  }, [showExportDropdown]);

  const StatCard = ({ title, value, color, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center h-full">
      <div className={`p-3 rounded-full ${color} mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-800">₹{value.toLocaleString()}</p>
      </div>
    </div>
  );


  // Pie Chart Component for Fee Transactions
  const FeeTransactionPieChart = ({ totalFee, totalPaid, totalDue }) => {
    const data = {
      labels: ['Received Fee', 'Balance Fee'],
      datasets: [
        {
          data: [totalPaid, totalDue],
          backgroundColor: ['#10b981', '#ef4444'],
          borderColor: ['#ffffff'],
          borderWidth: 2,
        },
      ],
    };


    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const percentage = totalFee > 0 ? Math.round((value / totalFee) * 100) : 0;
              return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      }
    };


    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col justify-center">
        <p className="text-sm font-semibold text-gray-700 mb-2 text-center">Fee Distribution</p>
        <div className="relative h-40 w-full">
          <Pie data={data} options={options} />
        </div>
      </div>
    );
  };


  // Pie Chart Component for Installments
  const InstallmentPieChart = ({ totalAmount, paidAmount, dueAmount }) => {
    const data = {
      labels: ['Paid Installment', 'Due Installment'],
      datasets: [
        {
          data: [paidAmount, dueAmount],
          backgroundColor: ['#10b981', '#ef4444'],
          borderColor: ['#ffffff'],
          borderWidth: 2,
        },
      ],
    };


    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const percentage = totalAmount > 0 ? Math.round((value / totalAmount) * 100) : 0;
              return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      }
    };


    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col justify-center">
        <p className="text-sm font-semibold text-gray-700 mb-2 text-center">Installment Distribution</p>
        <div className="relative h-40 w-full">
          <Pie data={data} options={options} />
        </div>
      </div>
    );
  };


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Student Fee Details</h1>
        
        {/* Export Button with Dropdown */}
        <div className="relative export-dropdown-container">
          <button 
            className="bg-sky-900 text-white font-medium px-4 py-2 rounded-md cursor-pointer flex items-center"
            onClick={toggleExportDropdown}
          >
            Export 
            <span className={`text-md ml-1 transition-transform duration-200 ${
              showExportDropdown ? 'rotate-180' : ''
            }`}>
              ▼
            </span>
          </button>
          
          {/* Export Dropdown Menu */}
          {showExportDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  onClick={exportToExcel}
                >
                  📊 Export to Excel
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  onClick={exportToPDF}
                >
                  📄 Export to PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
            activeTab === "transactions"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm border"
          }`}
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Fee Transactions
        </button>
        <button
          onClick={() => setActiveTab("installments")}
          className={`py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
            activeTab === "installments"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm border"
          }`}
        >
          <Clock className="w-5 h-5 mr-2" />
          Installment Management
        </button>
      </div>


      {/* Fee Transactions Tab */}
      {activeTab === "transactions" && (
        <div>
          {/* Top Section: Stats and Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Fee" value={totalFee} color="bg-blue-500" icon={IndianRupee} />
              <StatCard title="Received Fee" value={totalPaid} color="bg-green-500" icon={CheckCircle} />
              <StatCard title="Balance Fee" value={totalDue} color="bg-red-500" icon={XCircle} />
            </div>
            <div className="lg:col-span-1">
              <FeeTransactionPieChart totalFee={totalFee} totalPaid={totalPaid} totalDue={totalDue} />
            </div>
          </div>


          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Name, ID, or Course"
                  className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-108"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="studentName">Sort by Name</option>
                <option value="courseFee">Sort by Course Fee</option>
                <option value="paidFee">Sort by Paid Fee</option>
                <option value="dueFee">Sort by Due Fee</option>
              </select>

              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
                {timeFilter === "custom" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              
            </div>
          </div>


          {/* Students Table */}
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
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
                {filteredStudents.map((student) => (
                  <React.Fragment key={student.id}>
                    <tr
                      onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 border-b whitespace-nowrap">{student.rollNumber}</td>
                      <td className="py-3 px-4 border-b font-medium whitespace-nowrap">{student.studentName}</td>
                      <td className="py-3 px-4 border-b">{student.course.courseName}</td>
                      <td className="py-3 px-4 border-b whitespace-nowrap">₹{student.courseFee.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b whitespace-nowrap">₹{student.totalFee.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b text-green-600 font-semibold whitespace-nowrap">₹{student.paidFee.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b text-red-600 font-semibold whitespace-nowrap">₹{student.dueFee.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUpdateFeeModal(student.id);
                          }}
                          disabled={student.dueFee === 0}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md shadow hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Update Fee
                        </button>
                      </td>
                    </tr>
                    {selectedStudent === student.id && (
                      <tr>
                        <td colSpan="8" className="bg-gray-100 p-0">
                          <div className="p-4 bg-gray-100">
                            <h3 className="text-md font-semibold mb-2 text-gray-800">Fee History</h3>
                            <div className="bg-white rounded-lg overflow-hidden border">
                              <table className="min-w-full text-left">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="py-2 px-4 border-b font-medium text-sm">Amount</th>
                                    <th className="py-2 px-4 border-b font-medium text-sm">Date</th>
                                    <th className="py-2 px-4 border-b font-medium text-sm">Payment Mode</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {student.transactions.length > 0 ? (
                                    student.transactions.map((transaction, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50 text-sm">
                                        <td className="py-2 px-4 border-b">₹{transaction.amount.toLocaleString()}</td>
                                        <td className="py-2 px-4 border-b">{new Date(transaction.date).toLocaleDateString()}</td>
                                        <td className="py-2 px-4 border-b">{transaction.paymentMode}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="3" className="text-center py-4 text-gray-500">
                                        No transaction history.
                                      </td>
                                    </tr>
                                  )}
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
          {/* Top Section: Stats and Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Installment" value={totalInstallmentAmount} color="bg-purple-500" icon={IndianRupee} />
              <StatCard title="Paid Installment" value={totalInstallmentPaid} color="bg-green-500" icon={CheckCircle} />
              <StatCard title="Due Installment" value={totalInstallmentDue} color="bg-red-500" icon={XCircle} />
            </div>
            <div className="lg:col-span-1">
              <InstallmentPieChart totalAmount={totalInstallmentAmount} paidAmount={totalInstallmentPaid} dueAmount={totalInstallmentDue} />
            </div>
          </div>


          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Name, ID, or Course"
                  className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-56"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
                {timeFilter === "custom" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              <select
                className="border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="studentName">Sort by Name</option>
                <option value="totalInstallmentAmount">Sort by Total</option>
                <option value="paidInstallmentAmount">Sort by Paid</option>
                <option value="dueInstallmentAmount">Sort by Due</option>
              </select>
            </div>
          </div>


          {/* Installment Students Table */}
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
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
                  <React.Fragment key={student._id}>
                    <tr
                      onClick={() =>
                        setSelectedInstallmentStudent(
                          selectedInstallmentStudent === student._id ? null : student._id
                        )
                      }
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 border-b">{student.rollNumber}</td>
                      <td className="py-3 px-4 border-b font-medium">{student.studentName}</td>
                      <td className="py-3 px-4 border-b">{student.course.courseName}</td>
                      <td className="py-3 px-4 border-b">₹{student.totalInstallmentAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b text-green-600">₹{student.paidInstallmentAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b text-red-600">₹{student.dueInstallmentAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 border-b">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInstallmentStudent(student._id);
                          }}
                          className="bg-purple-500 text-white px-3 py-1 rounded-md shadow hover:bg-purple-600 transition-colors"
                        >
                          View Installments
                        </button>
                      </td>
                    </tr>
                    {selectedInstallmentStudent === student._id && (
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
                                    <th className="py-2 px-4 border-b font-medium">Paid Amount</th>
                                    <th className="py-2 px-4 border-b font-medium">Due Date</th>
                                    <th className="py-2 px-4 border-b font-medium">Status</th>
                                    <th className="py-2 px-4 border-b font-medium">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {student.installments.map((installment) => {
                                    const remainingAmount = installment.amount - (installment.paidAmount || 0);
                                    const isFullyPaid = installment.paid || remainingAmount <= 0;
                                    const isPartiallyPaid = installment.paidAmount > 0 && !isFullyPaid;
                                    
                                    return (
                                      <tr key={installment._id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border-b">{installment.installmentName}</td>
                                        <td className="py-2 px-4 border-b">₹{installment.amount.toLocaleString()}</td>
                                        <td className="py-2 px-4 border-b">
                                          <div className="flex flex-col">
                                            <span>₹{(installment.paidAmount || 0).toLocaleString()}</span>
                                            {remainingAmount > 0 && (
                                              <span className="text-xs text-red-600">
                                                (Due: ₹{remainingAmount.toLocaleString()})
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-2 px-4 border-b">{installment.date}</td>
                                        <td className="py-2 px-4 border-b">
                                          <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              installment.status === "Fully_Paid_Early"
                                                ? "bg-blue-100 text-blue-800"
                                                : isFullyPaid
                                                ? "bg-green-100 text-green-800"
                                                : isPartiallyPaid
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {installment.status === "Fully_Paid_Early" 
                                              ? "Paid Early" 
                                              : isFullyPaid 
                                              ? "Paid" 
                                              : isPartiallyPaid 
                                              ? "Partial" 
                                              : "Pending"}
                                          </span>
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                          <div className="flex gap-1">
                                            {!isFullyPaid && (
                                              <>
                                                <button
                                                  onClick={() => {
                                                    handlePaymentModeChange("normal", student, installment);
                                                    setShowInstallmentModal(student._id);
                                                  }}
                                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                                                  title="Pay remaining amount for this installment"
                                                >
                                                  Pay
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    handlePaymentModeChange("full_payment", student, installment);
                                                    setShowInstallmentModal(student._id);
                                                  }}
                                                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                                                  title="Pay all remaining fees"
                                                >
                                                  Pay All
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    handlePaymentModeChange("custom", student, installment);
                                                    setShowInstallmentModal(student._id);
                                                  }}
                                                  className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 transition-colors"
                                                  title="Pay custom amount"
                                                >
                                                  Custom
                                                </button>
                                              </>
                                            )}
                                            {installment.paymentHistory && installment.paymentHistory.length > 0 && (
                                              <button
                                                onClick={() => {
                                                  setSelectedPaymentHistory(installment.paymentHistory);
                                                  setSelectedInstallmentName(installment.installmentName);
                                                  setShowPaymentHistoryModal(true);
                                                }}
                                                className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                                                title="View payment history"
                                              >
                                                History
                                              </button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
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


      {/* Enhanced Update Fee Modal */}
      {showUpdateFeeModal && ( 
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-full">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Update Fee Payment</h2>
                    <p className="text-blue-100 text-sm">Record new payment transaction</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpdateFeeModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <IndianRupee className="w-4 h-4 text-green-600" />
                  <span>Payment Amount</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                    value={newPayment.amount || ""}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-400 text-sm">INR</span>
                  </div>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Payment Method</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'Card', 'UPI'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setNewPayment({ ...newPayment, mode })}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                        newPayment.mode === mode
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Payment Date</span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={newPayment.date}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => setShowUpdateFeeModal(false)}
                className="px-6 py-2.5 text-gray-600 font-medium rounded-xl border-2 border-gray-200 hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateFee(showUpdateFeeModal)}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Enhanced Installment Payment Modal */}
      {showInstallmentModal && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {paymentMode === "full_payment" ? "Pay All Fees" : 
               paymentMode === "custom" ? "Custom Payment" : "Pay Installment"}
            </h2>
            
            {/* Payment Type Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                {paymentMode === "full_payment" && (
                  <div>
                    <p className="font-medium text-blue-600">Full Payment Mode</p>
                    <p>This will pay all remaining installments (₹{totalDueAmount.toLocaleString()})</p>
                  </div>
                )}
                {paymentMode === "normal" && (
                  <div>
                    <p className="font-medium text-green-600">Normal Payment Mode</p>
                    <p>Pay remaining amount for this installment</p>
                  </div>
                )}
                {paymentMode === "custom" && (
                  <div>
                    <p className="font-medium text-purple-600">Custom Payment Mode</p>
                    <p>Enter any amount. Excess will be applied to next installments</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={installmentPayment.amount}
                onChange={(e) =>
                  setInstallmentPayment({ ...installmentPayment, amount: e.target.value })
                }
                placeholder={paymentMode === "full_payment" ? `₹${totalDueAmount}` : "Enter amount"}
                min="1"
              />
              {paymentMode === "custom" && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setInstallmentPayment({...installmentPayment, amount: "1000"})}
                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    ₹1,000
                  </button>
                  <button
                    onClick={() => setInstallmentPayment({...installmentPayment, amount: "5000"})}
                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    ₹5,000
                  </button>
                  <button
                    onClick={() => setInstallmentPayment({...installmentPayment, amount: totalDueAmount.toString()})}
                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    All (₹{totalDueAmount.toLocaleString()})
                  </button>
                </div>
              )}
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
                onClick={() => {
                  setShowInstallmentModal(false);
                  setPaymentMode("normal");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleInstallmentPayment(showInstallmentModal, installmentPayment.installmentId)}
                className={`text-white px-4 py-2 rounded-lg transition-colors ${
                  paymentMode === "full_payment" ? "bg-blue-500 hover:bg-blue-600" :
                  paymentMode === "custom" ? "bg-purple-500 hover:bg-purple-600" :
                  "bg-green-500 hover:bg-green-600"
                }`}
              >
                {paymentMode === "full_payment" ? "Pay All Fees" : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistoryModal && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-full">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Payment History</h2>
                    <p className="text-gray-200 text-sm">{selectedInstallmentName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentHistoryModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {selectedPaymentHistory.length > 0 ? (
                <div className="space-y-4">
                  {selectedPaymentHistory.map((payment, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">
                              ₹{payment.amount?.toLocaleString() || 0}
                            </h3>
                            <p className="text-sm text-gray-600">Payment #{index + 1}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {payment.paymentDate || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              payment.paymentMode === 'Cash' 
                                ? 'bg-green-100 text-green-700'
                                : payment.paymentMode === 'Card'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {payment.paymentMode || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {payment.remarks && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-start space-x-2">
                            <div className="bg-blue-100 p-1 rounded">
                              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Remarks:</p>
                              <p className="text-sm text-gray-800">{payment.remarks}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Payment History</h3>
                  <p className="text-gray-500">No payments have been recorded for this installment yet.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total Payments: <span className="font-semibold">{selectedPaymentHistory.length}</span>
              </div>
              <button
                onClick={() => setShowPaymentHistoryModal(false)}
                className="px-6 py-2.5 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesManagementSystem;




