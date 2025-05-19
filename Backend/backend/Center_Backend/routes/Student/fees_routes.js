// feeRoutes.js
import express from "express";
import { 
//   getStudentFeeDetails, 
updateStudentFeeWithTransaction, 
//   createStudentFee,
  getAllStudentsFeeDetails,
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

// Create initial fee record
// router.post("/student/:studentId", createStudentFee);

export default router;