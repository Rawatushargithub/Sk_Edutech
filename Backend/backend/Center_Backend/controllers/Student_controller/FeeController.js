import Student from "../../../Admin_Backend/models/Student/Student_Details.model.js";
import Fee from "../../models/Student/Fees_student.model.js";
import FeeTransaction from "../../models/Student/FeeTransaction.model.js";
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
      
      // Find all students with populated fee details
      const students = await Student.find(query)
        .populate('feeDetails')
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .sort({ createdAt: -1 });
        if(students)
          {
            console.log("student data get fetched" , students)
          }
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
