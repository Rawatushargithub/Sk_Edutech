import Student from "../../../Admin_Backend/models/Student/Student_Details.model.js";
import Fee from "../../models/Student/Fees_student.model.js";
import FeeTransaction from "../../models/Student/FeeTransaction.model.js";
import Installment from "../../models/Student/installment.model.js";
import mongoose from "mongoose";

export const getAllStudentsFeeDetails = async (req, res) => {
    try {
      // Query parameters for filtering and pagination
      const { page = 1, limit = 10, search = "", course = "" , franchiseId } = req.query;
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      // Build the filter query
      const query = {};
      console.log("franchiseId value :: ", franchiseId);
      // Add franchiseId filter - this is mandatory
    if (franchiseId) {
      query.franchiseId = franchiseId;
    } else {
      // If no franchiseId is provided, return an error
      return res.status(400).json({
        success: false,
        message: "FranchiseID is required"
      });
    }

      // Add search functionality
      if (search) {
        query.studentName = { $regex: search, $options: 'i' };
      }
      
      // Add course filter
      if (course) {
        query.courseInterested = course;
      }
      
      // Find all students with populated fee details, excluding those with installments
      const students = await Student.find({
        ...query,
        $or: [
          { installmentDetails: { $exists: false } },
          { installmentDetails: { $size: 0 } }
        ]
      })
        .populate('feeDetails')
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .sort({ createdAt: -1 }); 
        
      // Count total documents for pagination
      const totalStudents = await Student.countDocuments(query);

      // Get all student IDs for fetching transactions
    const studentIds = students.map(student => student._id);
    
    // Fetch all transactions for these students in one query
    const allTransactions = await FeeTransaction.find({
      studentId: { $in: studentIds }
    }).sort({ date: -1 });
    
    // Group transactions by student ID
    const transactionsByStudent = {};
    allTransactions.forEach(transaction => {
      if (!transactionsByStudent[transaction.studentId]) {
        transactionsByStudent[transaction.studentId] = [];
      }
      transactionsByStudent[transaction.studentId].push({
        amount: transaction.amount,
        date: transaction.date,
        paymentMode: transaction.paymentMode,
        remarks: transaction.remarks
      });
    });
      
      // Map student data to return only necessary information
    const studentFeeData = students.map(student => ({
      id: student._id,
      studentName: student.studentName,
      course: student.courseInterested,
      courseFee: student.feeDetails ? student.feeDetails.courseFees : 0,
      totalFee: student.feeDetails ? student.feeDetails.totalFees : 0,
      paidFee: student.feeDetails ? student.feeDetails.feesReceived : 0,
      dueFee: student.feeDetails ? student.feeDetails.balance : 0,
      admissionDate: student.admissionDate,
      rollNumber: student.rollNumber,
      transactions: transactionsByStudent[student._id] || []
    }));
      
      // Get course list for filtering
      const courses = await Student.distinct("courseInterested");
      
      return res.status(200).json({
        success: true,
        data: studentFeeData,
        pagination: {
          total: totalStudents,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalStudents / limitNumber)
        },
        filters: {
          courses
        }
      });
    } catch (error) {
      console.error("Error fetching all students fee details:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
  // Add this to get fee statistics for dashboard
  export const getFeesStatistics = async (req, res) => {
    try {
      // Get overall fee statistics
      const allFees = await Fee.find();
      
      // Calculate total amounts
      const totalCourseFees = allFees.reduce((sum, fee) => sum + fee.courseFees, 0);
      const totalFeesReceived = allFees.reduce((sum, fee) => sum + fee.feesReceived, 0);
      const totalDueFees = allFees.reduce((sum, fee) => sum + fee.balance, 0);
      
      // Get payment statistics by month for current year
      const currentYear = new Date().getFullYear();
      const transactions = await FeeTransaction.find({
        date: { $regex: `^${currentYear}` }
      });
      
      // Group transactions by month
      const monthlyPayments = {};
      transactions.forEach(transaction => {
        const month = transaction.date.slice(0, 7); // Format: YYYY-MM
        if (!monthlyPayments[month]) {
          monthlyPayments[month] = 0;
        }
        monthlyPayments[month] += transaction.amount;
      });
      
      // Format for chart data
      const chartData = Object.keys(monthlyPayments).map(month => ({
        month,
        amount: monthlyPayments[month]
      })).sort((a, b) => a.month.localeCompare(b.month));
      
      // Get payment mode statistics
      const paymentModes = await FeeTransaction.aggregate([
        { $group: { _id: "$paymentMode", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } }
      ]);
      
      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalCourseFees,
            totalFeesReceived,
            totalDueFees,
            collectionPercentage: (totalFeesReceived / totalCourseFees * 100).toFixed(2)
          },
          monthlyPayments: chartData,
          paymentModes: paymentModes.map(mode => ({
            mode: mode._id,
            amount: mode.total
          }))
        }
      });
    } catch (error) {
      console.error("Error fetching fee statistics:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  export const updateStudentFeeWithTransaction = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { amount, date, paymentMode } = req.body;
console.log(req.body);

      
      // Validate required fields
      if (!amount || !date || !paymentMode) {
        return res.status(400).json({
          success: false,
          message: "Amount, date, and payment mode are required"
        });
      }
      
      // Validate amount
      const paymentAmount = Number(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a positive number"
        });
      }
      
     
      const feeDetails = await Fee.findOne({studentId});
      if (!feeDetails) {
        return res.status(404).json({
          success: false,
          message: "Fee record not found"
        });
      }
      
      // Check if payment exceeds balance
      if (paymentAmount > feeDetails.balance) {
        return res.status(400).json({
          success: false,
          message: "Payment amount exceeds due balance"
        });
      }
      
      // Create new transaction
      const transaction = new FeeTransaction({
        studentId,
        feeId: feeDetails._id,
        amount: paymentAmount,
        date,
        paymentMode,
      });
      await transaction.save();
      
      // Update fee details
      feeDetails.feesReceived += paymentAmount;
      feeDetails.balance -= paymentAmount;
      
      // If balance becomes zero, mark as paid in full (instead of deleting)
      // const feeStatus = feeDetails.balance === 0 ? "PAID_IN_FULL" : "PARTIAL";
      // feeDetails.status = feeStatus;
      
      await feeDetails.save();
      
      // Get updated fee transactions for this student
      const transactions = await FeeTransaction.find({ studentId })
        .sort({ date: -1 });
      
      return res.status(200).json({
        success: true,
        message: "Fee updated successfully",
        data: {
          transactions: transactions.map(t => ({
            amount: t.amount,
            date: t.date,
            paymentMode: t.paymentMode,
          }))
        }
      });
    } catch (error) {
      console.error("Error updating student fee:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };


// Get all students with their installments for a franchise
export const getInstallmentStudents = async (req, res) => {
  try {
    const { franchiseId, limit = 10, page = 1 } = req.query;

    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: "Franchise ID is required"
      });
    }

    const skip = (page - 1) * limit;

    // Find all students who have installments
    const studentsWithInstallments = await Student.find({
      franchiseId,
      installmentDetails: { $exists: true, $not: { $size: 0 } }
    })
    .populate({
      path: 'installmentDetails',
      model: 'Installment'
    })
    .populate('courseInterested', 'courseName courseCode')
    .limit(parseInt(limit))
    .skip(skip);

    // Transform the data to match your frontend structure
    const transformedData = studentsWithInstallments.map(student => {
      const installments = student.installmentDetails || [];
      
      const totalInstallmentAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);
      const paidInstallmentAmount = installments.reduce((sum, inst) => 
        sum + (inst.paidAmount || 0), 0
      );
      const dueInstallmentAmount = totalInstallmentAmount - paidInstallmentAmount;

      return {
        _id: student._id,
        studentName: student.studentName,
        rollNumber: student.rollNumber,
        course: {
          courseName: student.courseInterested.courseName,
          courseCode: student.courseInterested.courseCode
        },
        totalInstallmentAmount,
        paidInstallmentAmount,
        dueInstallmentAmount,
        installments: installments.map(inst => ({
          _id: inst._id,
          installmentName: inst.installmentName,
          amount: inst.amount,
          date: inst.date,
          paid: inst.paid || false,
          paidAmount: inst.paidAmount || 0,
          status: inst.status || "Pending",
          paymentMode: inst.paymentMode,
          paymentDate: inst.paymentDate,
          paymentHistory: inst.paymentHistory || []
        }))
      };
    });

    // Get total count for pagination
    const totalStudents = await Student.countDocuments({
      franchiseId,
      installmentDetails: { $exists: true, $not: { $size: 0 } }
    });

    res.status(200).json({
      success: true,
      message: "Installment students fetched successfully",
      data: transformedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalStudents / limit),
        totalStudents,
        hasNextPage: page * limit < totalStudents,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("Error fetching installment students:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Enhanced installment payment with flexible payment scenarios
export const updateInstallmentPayment = async (req, res) => {
  try {
    const { installmentId } = req.params;
    const { amount, paymentMode, date, paymentType = "normal" } = req.body;

    if (!installmentId) {
      return res.status(400).json({
        success: false,
        message: "Installment ID is required"
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required"
      });
    }

    const paymentAmount = Number(amount);

    // Find the current installment
    const currentInstallment = await Installment.findById(installmentId);
    if (!currentInstallment) {
      return res.status(404).json({
        success: false,
        message: "Installment not found"
      });
    }

    // Get all installments for this student, sorted by date
    const allInstallments = await Installment.find({ 
      studentId: currentInstallment.studentId 
    }).sort({ date: 1 });

    // Calculate total remaining amount across all installments
    const totalDueAmount = allInstallments.reduce((sum, inst) => {
      const remaining = inst.amount - (inst.paidAmount || 0);
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);

    // Find current installment index
    const currentIndex = allInstallments.findIndex(inst => 
      inst._id.toString() === installmentId
    );

    if (currentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Installment not found in student records"
      });
    }

    let remainingAmount = paymentAmount;
    const updatedInstallments = [];
    let paymentScenario = "";

    // Scenario A: Full payment of all fees in one installment
    if (paymentAmount >= totalDueAmount) {
      paymentScenario = "full_payment";
      
      // Pay all remaining installments
      for (let i = 0; i < allInstallments.length; i++) {
        const installment = allInstallments[i];
        const currentPaid = installment.paidAmount || 0;
        const remainingDue = installment.amount - currentPaid;

        if (remainingDue > 0) {
          const newPaidAmount = installment.amount;
          
          // Add payment to history
          const paymentHistoryEntry = {
            amount: remainingDue,
            paymentMode: paymentMode,
            paymentDate: date,
            remarks: i === currentIndex ? "Primary payment" : "Auto-paid from overflow"
          };

          const updatedInstallment = await Installment.findByIdAndUpdate(
            installment._id,
            {
              paidAmount: newPaidAmount,
              paid: true,
              paymentMode: paymentMode,
              paymentDate: date,
              remainingAmount: 0,
              status: i === currentIndex ? "Paid" : "Fully_Paid_Early",
              $push: { paymentHistory: paymentHistoryEntry }
            },
            { new: true }
          );

          updatedInstallments.push(updatedInstallment);
          remainingAmount -= remainingDue;
        }
      }
    }
    // Scenario B & C: Overpayment or underpayment in specific installment
    else {
      const currentPaid = currentInstallment.paidAmount || 0;
      const currentDue = currentInstallment.amount - currentPaid;

      if (paymentAmount > currentDue) {
        // Scenario B: Overpayment - distribute to next installments
        paymentScenario = "overpayment";
        
        for (let i = currentIndex; i < allInstallments.length && remainingAmount > 0; i++) {
          const installment = allInstallments[i];
          const instCurrentPaid = installment.paidAmount || 0;
          const instRemainingDue = installment.amount - instCurrentPaid;

          if (instRemainingDue > 0) {
            const paymentForThis = Math.min(remainingAmount, instRemainingDue);
            const newPaidAmount = instCurrentPaid + paymentForThis;
            
            const paymentHistoryEntry = {
              amount: paymentForThis,
              paymentMode: paymentMode,
              paymentDate: date,
              remarks: i === currentIndex ? "Primary payment" : "Overflow from previous installment"
            };

            const updatedInstallment = await Installment.findByIdAndUpdate(
              installment._id,
              {
                paidAmount: newPaidAmount,
                paid: newPaidAmount >= installment.amount,
                paymentMode: paymentMode,
                paymentDate: date,
                remainingAmount: installment.amount - newPaidAmount,
                status: newPaidAmount >= installment.amount ? "Paid" : "Partial",
                $push: { paymentHistory: paymentHistoryEntry }
              },
              { new: true }
            );

            updatedInstallments.push(updatedInstallment);
            remainingAmount -= paymentForThis;
          }
        }
      } else {
        // Scenario C: Underpayment or exact payment
        paymentScenario = paymentAmount === currentDue ? "exact_payment" : "underpayment";
        
        const newPaidAmount = currentPaid + paymentAmount;
        
        const paymentHistoryEntry = {
          amount: paymentAmount,
          paymentMode: paymentMode,
          paymentDate: date,
          remarks: paymentScenario === "exact_payment" ? "Full installment payment" : "Partial payment"
        };

        const updatedInstallment = await Installment.findByIdAndUpdate(
          installmentId,
          {
            paidAmount: newPaidAmount,
            paid: newPaidAmount >= currentInstallment.amount,
            paymentMode: paymentMode,
            paymentDate: date,
            remainingAmount: currentInstallment.amount - newPaidAmount,
            status: newPaidAmount >= currentInstallment.amount ? "Paid" : "Partial",
            $push: { paymentHistory: paymentHistoryEntry }
          },
          { new: true }
        );

        updatedInstallments.push(updatedInstallment);
        remainingAmount = 0;
      }
    }

    // Calculate updated student totals
    const updatedAllInstallments = await Installment.find({ 
      studentId: currentInstallment.studentId 
    });
    
    const totalInstallmentAmount = updatedAllInstallments.reduce((sum, inst) => sum + inst.amount, 0);
    const paidInstallmentAmount = updatedAllInstallments.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
    const dueInstallmentAmount = totalInstallmentAmount - paidInstallmentAmount;

    res.status(200).json({
      success: true,
      message: "Installment payment updated successfully",
      data: {
        updatedInstallments,
        paymentScenario,
        overpayment: remainingAmount > 0 ? remainingAmount : 0,
        totalProcessed: paymentAmount - remainingAmount,
        studentTotals: {
          totalInstallmentAmount,
          paidInstallmentAmount,
          dueInstallmentAmount
        }
      }
    });

  } catch (error) {
    console.error("Error updating installment payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get fee transactions for a specific student
export const getStudentFeeTransactions = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required"
      });
    }

    // Fetch all transactions for this student
    const transactions = await FeeTransaction.find({ studentId })
      .sort({ date: -1 });

    const formattedTransactions = transactions.map(transaction => ({
      amount: transaction.amount,
      date: transaction.date,
      paymentMode: transaction.paymentMode,
      remarks: transaction.remarks
    }));

    res.status(200).json({
      success: true,
      message: "Student fee transactions fetched successfully",
      data: formattedTransactions
    });

  } catch (error) {
    console.error("Error fetching student fee transactions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get installment details by student ID
export const getStudentInstallments = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required"
      });
    }

    const student = await Student.findById(studentId)
      .populate('installmentDetails')
      .populate('courseInterested', 'courseName courseCode');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const installments = student.installmentDetails || [];
    const totalAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);
    const paidAmount = installments.reduce((sum, inst) => 
      sum + (inst.paidAmount || 0), 0
    );

    res.status(200).json({
      success: true,
      message: "Student installments fetched successfully",
      data: {
        student: {
          _id: student._id,
          studentName: student.studentName,
          rollNumber: student.rollNumber,
          course: student.courseInterested
        },
        installments,
        summary: {
          totalAmount,
          paidAmount,
          dueAmount: totalAmount - paidAmount,
          totalInstallments: installments.length,
          paidInstallments: installments.filter(inst => inst.paid).length,
          pendingInstallments: installments.filter(inst => !inst.paid).length
        }
      }
    });

  } catch (error) {
    console.error("Error fetching student installments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};