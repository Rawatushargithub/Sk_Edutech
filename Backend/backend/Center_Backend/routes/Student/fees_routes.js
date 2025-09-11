// feeRoutes.js
import express from "express";
import { 
//   getStudentFeeDetails, 
updateStudentFeeWithTransaction, 
//   createStudentFee,
  getAllStudentsFeeDetails,
  getInstallmentStudents,
  updateInstallmentPayment,
  getStudentInstallments,
  getStudentFeeTransactions
//   getFeesStatistics
} from "../../controllers/Student_controller/FeeController.js";

const router = express.Router(); 

// Get all students fee details (with pagination and filtering)
router.route("/students").get( getAllStudentsFeeDetails);

// Get fee statistics for dashboard
// router.get("/statistics", getFeesStatistics);

// Get single student fee details including history
// router.get("/student/:studentId", getStudentFeeDetails);

// Update fee (add payment)
router.post("/:studentId/update-fee", updateStudentFeeWithTransaction);

// Installment routes
router.get("/installments/students", getInstallmentStudents);
router.put("/installments/:installmentId/update-payment", updateInstallmentPayment);
router.get("/installments/student/:studentId", getStudentInstallments);

// Get fee transactions for a specific student
router.get("/transactions/:studentId", getStudentFeeTransactions);

// Create initial fee record
// router.post("/student/:studentId", createStudentFee);

export default router;