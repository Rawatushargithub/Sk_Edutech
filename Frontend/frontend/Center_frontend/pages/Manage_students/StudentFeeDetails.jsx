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
  const [studentStatusFilter, setStudentStatusFilter] = useState('active'); // 'active', 'inactive', 'all'
  
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
  const [studentInitialPayments, setStudentInitialPayments] = useState({});
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
  const getFilteredAndSortedData = (data, searchTerm, sortKey, timeFilter, startDate, endDate, isInstallmentData = false) => {
    // Time Filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const filterDate = (date) => {
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) return false;

        switch (timeFilter) {
          case 'today':
            return targetDate >= today;
          case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return targetDate >= yesterday && targetDate < today;
          case 'last7days':
            const last7days = new Date(today);
            last7days.setDate(today.getDate() - 7);
            return targetDate >= last7days;
          case 'last30days':
            const last30days = new Date(today);
            last30days.setDate(today.getDate() - 30);
            return targetDate >= last30days;
          case 'custom':
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999); // Include the entire end day
              return targetDate >= start && targetDate <= end;
            }
            return true;
          default:
            return true;
        }
      };
      
      if (isInstallmentData) {
        // For installment data, filter by installment due dates
        data = data.filter(student => {
          if (!student.installments || student.installments.length === 0) return false;
          
          // Check if any installment has a due date within the filter range
          return student.installments.some(installment => {
            // Convert dd-mm-yyyy format to Date object
            const dateParts = installment.date.split('-');
            if (dateParts.length === 3) {
              const dueDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
              return filterDate(dueDate);
            }
            return false;
          });
        });
      } else {
        // For regular fee data, filter by admission date
        data = data.filter(item => filterDate(item.admissionDate));
      }
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


  // Helper to normalize active status
  const isActiveStatus = (s) => {
    const st = (s?.status ?? '').toString().toLowerCase();
    return st === 'active' || st === 'true';
  };

  const filteredStudents = getFilteredAndSortedData(students, search, sortKey, timeFilter, startDate, endDate, false);
  const filteredInstallmentStudents = getFilteredAndSortedData(installmentStudents, search, sortKey, timeFilter, startDate, endDate, true);


  // Filter students based on status filter
  const getStudentsByStatusFilter = (students) => {
    switch(studentStatusFilter) {
      case 'active':
        return students.filter(student => isActiveStatus(student));
      case 'inactive':
        return students.filter(student => !isActiveStatus(student));
      case 'all':
      default:
        return students;
    }
  };

  const statusFilteredStudents = getStudentsByStatusFilter(filteredStudents);
  const statusFilteredInstallmentStudents = getStudentsByStatusFilter(filteredInstallmentStudents);

  // Calculate totals for normal fees based on status-filtered students
  const totalFee = statusFilteredStudents.reduce((acc, student) => acc + (student.totalFee || 0), 0);
  const totalPaid = statusFilteredStudents.reduce((acc, student) => acc + (student.paidFee || 0), 0);
  const totalDue = statusFilteredStudents.reduce((acc, student) => acc + (student.dueFee || 0), 0);


  // Calculate installment totals based on status-filtered students (including initial payments)
  const calculateInstallmentTotals = (students) => {
    return students.reduce((totals, student) => {
      // Calculate initial payments for this student
      const initialPaymentAmount = studentInitialPayments[student._id] ? 
        studentInitialPayments[student._id].reduce((sum, payment) => sum + payment.amount, 0) : 0;
      
      // Use the pre-calculated totals from backend if available
      if (student.totalInstallmentAmount !== undefined && 
          student.paidInstallmentAmount !== undefined && 
          student.dueInstallmentAmount !== undefined) {
        
        const studentTotal = student.totalInstallmentAmount || 0;
        const studentPaid = student.paidInstallmentAmount || 0;
        const studentDue = student.dueInstallmentAmount || 0;
        
        // Add initial payments to totals
        totals.total += studentTotal + initialPaymentAmount;
        totals.paid += studentPaid + initialPaymentAmount;
        totals.due += studentDue; // Due amount remains the same as initial payments are already paid
        
        return totals;
      }
      
      // Fallback: calculate from individual installments if backend totals not available
      if (!student.installments || student.installments.length === 0) {
        // If no installments but has initial payments, add them
        totals.total += initialPaymentAmount;
        totals.paid += initialPaymentAmount;
        return totals;
      }
      
      const studentTotals = student.installments.reduce((acc, installment) => {
        const installmentAmount = installment.amount || 0;
        const paidAmount = installment.paidAmount || 0;
        const dueAmount = Math.max(0, installmentAmount - paidAmount);
        
        return {
          total: acc.total + installmentAmount,
          paid: acc.paid + paidAmount,
          due: acc.due + dueAmount
        };
      }, { total: 0, paid: 0, due: 0 });
      
      // Add initial payments to student totals
      totals.total += studentTotals.total + initialPaymentAmount;
      totals.paid += studentTotals.paid + initialPaymentAmount;
      totals.due += studentTotals.due;
      
      return totals;
    }, { total: 0, paid: 0, due: 0 });
  };
  const installmentTotals = calculateInstallmentTotals(statusFilteredInstallmentStudents);
  const totalInstallmentAmount = installmentTotals.total;
  const totalInstallmentPaid = installmentTotals.paid;
  const totalInstallmentDue = installmentTotals.due;


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
    // console.log(studentId)
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
       
        const updatedStudents = response.data.data.map((student) => ({
          ...student,
          dueFee: student.totalFee - student.paidFee, // Ensure dueFee is properly calculated
        }));
        setStudents(updatedStudents);
        // Fetch statuses and merge into fee students by rollNumber
        axios
          .get(`${API_BASE_URL}/api/v1/institute_student/get_students?franchiseId=${franchiseId}`)
          .then((resp) => {
            const arr = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
            const statusMap = new Map(arr.map((s) => [s.rollNumber, s.status]));
            setStudents((prev) => prev.map((st) => ({
              ...st,
              status: statusMap.get(st.rollNumber) ?? st.status ?? 'active',
            })));
          })
          .catch((e) => console.error('Error merging statuses into fee students:', e));
      })
      .catch((error) => console.error("Error fetching students:", error));

 
    // Fetch installment students
    axios
      .get(`${API_BASE_URL}/api/v1/institute_fees/installments/students?franchiseId=${franchiseId}`)
      .then((response) => {
        console.log("Installment data:", response);
        if (response.data.success) {
          const list = response.data.data || [];
          setInstallmentStudents(list);
          
          // Fetch initial payments for installment students
          const studentIds = list.map(student => student._id);
          if (studentIds.length > 0) {
            // Directly fetch fee transactions for installment students
            const fetchPromises = studentIds.map(studentId => 
              axios.get(`${API_BASE_URL}/api/v1/institute_fees/transactions/${studentId}`)
                .then(response => ({ studentId, transactions: response.data.data || [] }))
                .catch(error => {
                  console.error(`Error fetching transactions for student ${studentId}:`, error);
                  return { studentId, transactions: [] };
                })
            );
            
            Promise.all(fetchPromises)
              .then(results => {
                const initialPaymentsMap = {};
                results.forEach(({ studentId, transactions }) => {
                  if (transactions.length > 0) {
                    initialPaymentsMap[studentId] = transactions;
                  }
                });
                console.log("Initial payments map:", initialPaymentsMap);
                setStudentInitialPayments(initialPaymentsMap);
              })
              .catch(error => {
                console.error("Error processing initial payments:", error);
              });
          }
          
          // Merge statuses into installment students too
          axios
            .get(`${API_BASE_URL}/api/v1/institute_student/get_students?franchiseId=${franchiseId}`)
            .then((resp) => {
              const arr = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
              const statusMap = new Map(arr.map((s) => [s.rollNumber, s.status]));
              setInstallmentStudents((prev) => prev.map((st) => ({
                ...st,
                status: statusMap.get(st.rollNumber) ?? st.status ?? 'active',
              })));
            })
            .catch((e) => console.error('Error merging statuses into installment students:', e));
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
        exportData = prepareTransactionExportData(statusFilteredStudents);
        fileName = `Fee_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
      } else {
        exportData = prepareInstallmentExportData(statusFilteredInstallmentStudents);
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
        exportData = prepareTransactionExportData(statusFilteredStudents);
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
        exportData = prepareInstallmentExportData(statusFilteredInstallmentStudents);
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

  const StatCard = ({ title, value, color, icon: Icon }) => {
    // Calculate percentage with clear logic - handle both Fee and Installment calculations
    let percentage, numerator, denominator, calculationText;
    
    // Determine if this is an installment card or fee card
    const isInstallmentCard = title.includes('Installment');
    
    if (title.includes('Paid')) {
      numerator = value;
      if (isInstallmentCard) {
        denominator = totalInstallmentAmount || 1;
      } else {
        denominator = totalFee || 1;
      }
      percentage = Math.round((numerator / denominator) * 100);
      calculationText = `₹${numerator.toLocaleString()} ÷ ₹${denominator.toLocaleString()}`;
    } else if (title.includes('Due')) {
      numerator = value;
      if (isInstallmentCard) {
        denominator = totalInstallmentAmount || 1;
      } else {
        denominator = totalFee || 1;
      }
      percentage = Math.round((numerator / denominator) * 100);
      calculationText = `₹${numerator.toLocaleString()} ÷ ₹${denominator.toLocaleString()}`;
    } else {
      // Total card - show collection efficiency
      if (isInstallmentCard) {
        numerator = totalInstallmentPaid;
        denominator = totalInstallmentAmount || 1;
      } else {
        numerator = totalPaid;
        denominator = totalFee || 1;
      }
      percentage = Math.round((numerator / denominator) * 100);
      calculationText = `₹${numerator.toLocaleString()} ÷ ₹${denominator.toLocaleString()}`;
    }
    
    return (
      <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 overflow-hidden min-h-[200px] flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full -mr-16 -mt-16 opacity-30"></div>
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className={`p-4 rounded-2xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="text-right flex-1 ml-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
              <p className="text-4xl font-bold text-gray-900 leading-none">₹{value.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Progress Section */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {title.includes('Total') ? 'Collection Rate' : 
                 title.includes('Paid') ? 'Payment Progress' : 
                 'Outstanding Amount'}
              </span>
              <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 font-mono">{calculationText}</span>
                  <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-full">{percentage}%</span>
                </div>
                <span className="text-xs text-gray-400">
                  {title.includes('Total') ? 'Collection Efficiency' : 
                   title.includes('Paid') ? 'Payment Ratio' : 
                   'Outstanding Ratio'}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
              <div 
                className={`h-2.5 rounded-full ${color.replace('bg-gradient-to-r from-', 'bg-gradient-to-r from-').replace(' to-', ' to-')} transition-all duration-1000 shadow-sm`} 
                style={{width: `${Math.min(percentage, 100)}%`}}
              ></div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  {title.includes('Total') ? 'Total Amount' : 
                   title.includes('Paid') ? 'Amount Received' : 
                   'Outstanding Balance'}
                </span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${color.replace('bg-gradient-to-r from-', 'bg-').replace(' to-blue-600', '-500').replace(' to-green-600', '-500').replace(' to-red-600', '-500')}`}></div>
                  <span className="font-semibold text-gray-700">
                    {statusFilteredStudents.length} student{statusFilteredStudents.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Student Fee Management</h1>
            <p className="text-gray-600 mt-2">Comprehensive fee tracking and payment management system</p>
          </div>
          
          {/* Export Button with Dropdown */}
          <div className="relative export-dropdown-container">
            <button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
              onClick={toggleExportDropdown}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Data</span>
              <span className={`transition-transform duration-200 ${
                showExportDropdown ? 'rotate-180' : ''
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            
            {/* Export Dropdown Menu */}
            {showExportDropdown && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 overflow-hidden">
                <div className="py-2">
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 flex items-center space-x-3"
                    onClick={exportToExcel}
                  >
                    <span className="text-green-500">📊</span>
                    <span className="font-medium">Export to Excel</span>
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 flex items-center space-x-3"
                    onClick={exportToPDF}
                  >
                    <span className="text-red-500">📄</span>
                    <span className="font-medium">Export to PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`relative py-3 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 ${
                  activeTab === "transactions"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Fee Transactions</span>
                {activeTab === "transactions" && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("installments")}
                className={`relative py-3 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 ${
                  activeTab === "installments"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>Installment Management</span>
                {activeTab === "installments" && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            </div>
          </div>
        </div>


      {/* Fee Transactions Tab */}
      {activeTab === "transactions" && (
        <div>
          {/* Status Filter Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Showing calculations for: <span className="font-bold">
                      {studentStatusFilter === 'active' ? 'Active Students Only' : 
                       studentStatusFilter === 'inactive' ? 'Inactive Students Only' : 
                       'All Students (Active + Inactive)'}
                    </span>
                  </p>
                  <p className="text-xs text-blue-600">
                    {studentStatusFilter === 'active' ? 'Only active student fees are included in totals' :
                     studentStatusFilter === 'inactive' ? 'Only inactive student fees are included in totals' :
                     'Both active and inactive student fees are included in totals'}
                  </p>
                </div>
              </div>
              <div className="text-sm text-blue-700 font-medium">
                {statusFilteredStudents.length} student{statusFilteredStudents.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Top Section: Stats and Pie Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Fee (Student Fee)" value={totalFee} color="bg-gradient-to-r from-blue-500 to-blue-600" icon={IndianRupee} />
              <StatCard title="Paid Fee" value={totalPaid} color="bg-gradient-to-r from-green-500 to-green-600" icon={CheckCircle} />
              <StatCard title="Due Fee" value={totalDue} color="bg-gradient-to-r from-red-500 to-red-600" icon={XCircle} />
            </div>
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-full">
                <FeeTransactionPieChart totalFee={totalFee} totalPaid={totalPaid} totalDue={totalDue} />
              </div>
            </div>
          </div>


          {/* Search and Filter */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name, ID, or Course"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value)}
              >
                <option value="active">Active Students Only</option>
                <option value="inactive">Inactive Students Only</option>
                <option value="all">All Students</option>
              </select>
              
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
              
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="studentName">Sort by Name</option>
                <option value="totalFee">Sort by Total Fee</option>
                <option value="paidFee">Sort by Paid Fee</option>
                <option value="dueFee">Sort by Due Fee</option>
              </select>
            </div>
            
            {timeFilter === "custom" && (
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-700">Date Range:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>


          {/* Fee Transactions Table */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-white uppercase tracking-wider">Student ID</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-white uppercase tracking-wider">Student Name</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-white uppercase tracking-wider">Course</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-white uppercase tracking-wider">Course Fee</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-white uppercase tracking-wider">Student Fee</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-white uppercase tracking-wider">Paid Fee</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-white uppercase tracking-wider">Due Fee</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {statusFilteredStudents.map((student) => (
                  <React.Fragment key={student.id}>
                    <tr
                      onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                      className={`cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:shadow-md ${
                        !isActiveStatus(student) 
                          ? 'bg-red-50 border-l-4 border-red-400' 
                          : 'bg-white hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-400'
                      } ${selectedStudent === student.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                    >
                      <td className="py-4 px-6 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <span className="font-mono text-sm font-medium text-gray-700">{student.rollNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">{student.studentName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{student.studentName}</div>
                            <div className="text-xs text-gray-500">{!isActiveStatus(student) ? 'Inactive' : 'Active'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100">
                        <div className="text-sm text-gray-900 font-medium">{student.course.courseName}</div>
                        <div className="text-xs text-gray-500">{student.course.courseCode || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                          ₹{student.courseFee.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          ₹{student.totalFee.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          ₹{student.paidFee.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                          ₹{student.dueFee.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUpdateFeeModal(student.id);
                          }}
                          disabled={student.dueFee === 0}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Update Fee
                        </button>
                      </td>
                    </tr>
                    {selectedStudent === student.id && (
                      <tr>
                        <td colSpan="8" className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-0">
                          <div className="p-6">
                            <div className="flex items-center mb-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Fee History</h3>
                            </div>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 backdrop-blur-sm">
                              <table className="min-w-full text-left">
                                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                                  <tr>
                                    <th className="py-4 px-6 font-semibold text-white text-sm tracking-wide">
                                      <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        <span>Amount</span>
                                      </div>
                                    </th>
                                    <th className="py-4 px-6 font-semibold text-white text-sm tracking-wide">
                                      <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
                                        </svg>
                                        <span>Date</span>
                                      </div>
                                    </th>
                                    <th className="py-4 px-6 font-semibold text-white text-sm tracking-wide">
                                      <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        <span>Payment Mode</span>
                                      </div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {student.transactions.length > 0 ? (
                                    student.transactions.map((transaction, idx) => (
                                      <tr key={idx} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
                                        <td className="py-4 px-6 border-b border-gray-100">
                                          <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                                            <span className="font-bold text-green-600 text-lg">₹{transaction.amount.toLocaleString()}</span>
                                          </div>
                                        </td>
                                        <td className="py-4 px-6 border-b border-gray-100">
                                          <div className="flex items-center space-x-2">
                                            <div className="bg-blue-100 p-1.5 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                                              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
                                              </svg>
                                            </div>
                                            <span className="font-medium text-gray-700">{new Date(transaction.date).toLocaleDateString()}</span>
                                          </div>
                                        </td>
                                        <td className="py-4 px-6 border-b border-gray-100">
                                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                            transaction.paymentMode === 'Cash' ? 'bg-green-100 text-green-800' :
                                            transaction.paymentMode === 'Card' ? 'bg-blue-100 text-blue-800' :
                                            transaction.paymentMode === 'UPI' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {transaction.paymentMode === 'Cash' && (
                                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                              </svg>
                                            )}
                                            {transaction.paymentMode === 'Card' && (
                                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                              </svg>
                                            )}
                                            {transaction.paymentMode === 'UPI' && (
                                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                              </svg>
                                            )}
                                            {transaction.paymentMode}
                                          </span>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="3" className="text-center py-12">
                                        <div className="flex flex-col items-center">
                                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                          </div>
                                          <h3 className="text-lg font-medium text-gray-600 mb-2">No Transaction History</h3>
                                          <p className="text-gray-500">No payments have been recorded yet.</p>
                                        </div>
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
          {/* Status Filter Info Banner */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-500 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    Showing calculations for: <span className="font-bold">
                      {studentStatusFilter === 'active' ? 'Active Students Only' : 
                       studentStatusFilter === 'inactive' ? 'Inactive Students Only' : 
                       'All Students (Active + Inactive)'}
                    </span>
                  </p>
                  <p className="text-xs text-purple-600">
                    {studentStatusFilter === 'active' ? 'Only active student installments are included in totals' :
                     studentStatusFilter === 'inactive' ? 'Only inactive student installments are included in totals' :
                     'Both active and inactive student installments are included in totals'}
                  </p>
                </div>
              </div>
              <div className="text-sm text-purple-700 font-medium">
                {statusFilteredInstallmentStudents.length} student{statusFilteredInstallmentStudents.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Top Section: Stats and Pie Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Installment" value={totalInstallmentAmount} color="bg-gradient-to-r from-purple-500 to-purple-600" icon={IndianRupee} />
              <StatCard title="Paid Installment" value={totalInstallmentPaid} color="bg-gradient-to-r from-green-500 to-green-600" icon={CheckCircle} />
              <StatCard title="Due Installment" value={totalInstallmentDue} color="bg-gradient-to-r from-red-500 to-red-600" icon={XCircle} />
            </div>
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-full">
                <InstallmentPieChart totalAmount={totalInstallmentAmount} paidAmount={totalInstallmentPaid} dueAmount={totalInstallmentDue} />
              </div>
            </div>
          </div>


          {/* Search and Filter */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name, ID, or Course"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value)}
              >
                <option value="active">Active Students Only</option>
                <option value="inactive">Inactive Students Only</option>
                <option value="all">All Students</option>
              </select>
              
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
              
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="studentName">Sort by Name</option>
                <option value="totalInstallmentAmount">Sort by Total</option>
                <option value="paidInstallmentAmount">Sort by Paid</option>
                <option value="dueInstallmentAmount">Sort by Due</option>
              </select>
            </div>
            
            {timeFilter === "custom" && (
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-700">Date Range:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}
          </div>


          {/* Installment Students Table */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-white uppercase tracking-wider">Student ID</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-white uppercase tracking-wider">Student Name</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-white uppercase tracking-wider">Course</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-white uppercase tracking-wider">Total Amount</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-white uppercase tracking-wider">Paid Amount</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-white uppercase tracking-wider">Due Amount</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {statusFilteredInstallmentStudents.map((student, index) => (
                  <React.Fragment key={student._id}>
                    <tr
                      onClick={() =>
                        setSelectedInstallmentStudent(
                          selectedInstallmentStudent === student._id ? null : student._id
                        )
                      }
                      className={`cursor-pointer transition-all duration-200 hover:bg-purple-50 hover:shadow-md ${
                        !isActiveStatus(student) 
                          ? 'bg-red-50 border-l-4 border-red-400' 
                          : 'bg-white hover:bg-purple-50 border-l-4 border-transparent hover:border-purple-400'
                      } ${selectedInstallmentStudent === student._id ? 'bg-purple-100 border-l-4 border-purple-500' : ''}`}
                    >
                      <td className="py-4 px-6 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                          <span className="font-mono text-sm font-medium text-gray-700">{student.rollNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">{student.studentName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{student.studentName}</div>
                            <div className="text-xs text-gray-500">{!isActiveStatus(student) ? 'Inactive' : 'Active'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100">
                        <div className="text-sm text-gray-900 font-medium">{student.course.courseName}</div>
                        <div className="text-xs text-gray-500">{student.course.courseCode || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-center">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          ₹{(
                            student.totalInstallmentAmount + 
                            (studentInitialPayments[student._id] ? 
                              studentInitialPayments[student._id].reduce((sum, payment) => sum + payment.amount, 0) : 0)
                          ).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-center">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          ₹{(
                            student.paidInstallmentAmount + 
                            (studentInitialPayments[student._id] ? 
                              studentInitialPayments[student._id].reduce((sum, payment) => sum + payment.amount, 0) : 0)
                          ).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-center">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                          ₹{student.dueInstallmentAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInstallmentStudent(student._id);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                      </td>
                    </tr>
                    {selectedInstallmentStudent === student._id && (
                      <tr>
                        <td colSpan="7" className="bg-gray-50">
                          <div className="p-4">
                            <h3 className="text-lg font-semibold mb-3">Complete Payment History</h3>
                            
                            {/* Initial Payment History Section */}
                            {studentInitialPayments[student._id] && studentInitialPayments[student._id].length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-md font-medium mb-2 text-blue-600">Initial Registration Payments</h4>
                                <div className="bg-blue-50 rounded-lg overflow-hidden border border-blue-200 mb-4">
                                  <table className="min-w-full text-left border-collapse">
                                    <thead className="bg-blue-100">
                                      <tr>
                                        <th className="py-2 px-4 border-b font-medium text-blue-800">Payment Type</th>
                                        <th className="py-2 px-4 border-b font-medium text-blue-800">Amount</th>
                                        <th className="py-2 px-4 border-b font-medium text-blue-800">Date</th>
                                        <th className="py-2 px-4 border-b font-medium text-blue-800">Payment Mode</th>
                                        <th className="py-2 px-4 border-b font-medium text-blue-800">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {studentInitialPayments[student._id].map((payment, idx) => (
                                        <tr key={`initial-${idx}`} className="hover:bg-blue-50">
                                          <td className="py-2 px-4 border-b text-blue-700 font-medium">Initial Payment</td>
                                          <td className="py-2 px-4 border-b text-blue-700">₹{payment.amount.toLocaleString()}</td>
                                          <td className="py-2 px-4 border-b text-blue-700">{new Date(payment.date).toLocaleDateString()}</td>
                                          <td className="py-2 px-4 border-b text-blue-700">{payment.paymentMode}</td>
                                          <td className="py-2 px-4 border-b">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                              Completed
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                            
                            {/* Installment Details Section */}
                            <div className="flex items-center mb-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <h4 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Installment Payments</h4>
                            </div>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 backdrop-blur-sm">
                              <table className="min-w-full text-left border-collapse">
                                <thead className="bg-gradient-to-r from-purple-600 to-pink-600">
                                  <tr>
                                    <th className="py-4 px-6 font-semibold text-white text-sm tracking-wide">
                                      <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
                                        </svg>
                                        <span>Installment Name</span>
                                      </div>
                                    </th>
                                    <th className="py-4 px-6 font-semibold text-white text-sm tracking-wide">
                                      <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        <span>Amount</span>
                                      </div>
                                    </th>
                                    <th className="py-4 px-6 font-semibold text-white text-sm tracking-wide">
                                      <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Paid Amount</span>
                                      </div>
                                    </th>
                                    <th className="py-4 px-6 font-semibold text-white text-sm tracking-wide">
                                      <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
                                        </svg>
                                        <span>Due Date</span>
                                      </div>
                                    </th>
                                    <th className="py-4 px-6 font-semibold text-white text-sm tracking-wide">
                                      <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Status</span>
                                      </div>
                                    </th>
                                    <th className="py-4 px-6 font-semibold text-white text-sm tracking-wide">
                                      <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                        <span>Actions</span>
                                      </div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {student.installments.map((installment) => {
                                    const remainingAmount = installment.amount - (installment.paidAmount || 0);
                                    const isFullyPaid = installment.paid || remainingAmount <= 0;
                                    const isPartiallyPaid = installment.paidAmount > 0 && !isFullyPaid;
                                    
                                    return (
                                      <tr key={installment._id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group">
                                        <td className="py-4 px-6 border-b border-gray-100">
                                          <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                                            <span className="font-semibold text-gray-800">{installment.installmentName}</span>
                                          </div>
                                        </td>
                                        <td className="py-4 px-6 border-b border-gray-100">
                                          <div className="flex items-center space-x-2">
                                            <div className="bg-purple-100 p-1.5 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                                              <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                              </svg>
                                            </div>
                                            <span className="font-bold text-purple-600 text-lg">₹{installment.amount.toLocaleString()}</span>
                                          </div>
                                        </td>
                                        <td className="py-4 px-6 border-b border-gray-100">
                                          <div className="flex flex-col space-y-1">
                                            <div className="flex items-center space-x-2">
                                              <div className="bg-green-100 p-1 rounded-full">
                                                <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                              </div>
                                              <span className="font-bold text-green-600">₹{(installment.paidAmount || 0).toLocaleString()}</span>
                                            </div>
                                            {remainingAmount > 0 && (
                                              <div className="flex items-center space-x-2">
                                                <div className="bg-red-100 p-1 rounded-full">
                                                  <svg className="w-2 h-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                  </svg>
                                                </div>
                                                <span className="text-sm font-medium text-red-600">
                                                  Due: ₹{remainingAmount.toLocaleString()}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-4 px-6 border-b border-gray-100">
                                          <div className="flex items-center space-x-2">
                                            <div className="bg-indigo-100 p-1.5 rounded-lg group-hover:bg-indigo-200 transition-colors duration-200">
                                              <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
                                              </svg>
                                            </div>
                                            <span className="font-medium text-gray-700">{installment.date}</span>
                                          </div>
                                        </td>
                                        <td className="py-4 px-6 border-b border-gray-100">
                                          <span
                                            className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-bold shadow-lg transform transition-all duration-200 hover:scale-105 ${
                                              installment.status === "Fully_Paid_Early"
                                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                                : isFullyPaid
                                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                                                : isPartiallyPaid
                                                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                                                : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                                            }`}
                                          >
                                            {installment.status === "Fully_Paid_Early" && (
                                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                              </svg>
                                            )}
                                            {isFullyPaid && installment.status !== "Fully_Paid_Early" && (
                                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                            )}
                                            {isPartiallyPaid && !isFullyPaid && (
                                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                            )}
                                            {!isFullyPaid && !isPartiallyPaid && (
                                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                              </svg>
                                            )}
                                            {installment.status === "Fully_Paid_Early" 
                                              ? "Paid Early" 
                                              : isFullyPaid 
                                              ? "Paid" 
                                              : isPartiallyPaid 
                                              ? "Partial" 
                                              : "Pending"}
                                          </span>
                                        </td>
                                        <td className="py-4 px-6 border-b border-gray-100">
                                          <div className="flex gap-2">
                                            {!isFullyPaid && (
                                              <>
                                                <button
                                                  onClick={() => {
                                                    handlePaymentModeChange("normal", student, installment);
                                                    setShowInstallmentModal(student._id);
                                                  }}
                                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                                                  title="Pay remaining amount for this installment"
                                                >
                                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                  <span>Pay</span>
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    handlePaymentModeChange("full_payment", student, installment);
                                                    setShowInstallmentModal(student._id);
                                                  }}
                                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                                                  title="Pay all remaining fees"
                                                >
                                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                  </svg>
                                                  <span>Pay All</span>
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    handlePaymentModeChange("custom", student, installment);
                                                    setShowInstallmentModal(student._id);
                                                  }}
                                                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                                                  title="Pay custom amount"
                                                >
                                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                                  </svg>
                                                  <span>Custom</span>
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
                                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                                                title="View payment history"
                                              >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>History</span>
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
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
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
                                : payment.paymentMode === 'UPI'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
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
    </div>
  );
};

export default FeesManagementSystem;
