import express from "express";
import {loginStudent , getAllStudents, getStudentById, requestCertificate, getCourseDuration, getFranchiseLogo, getStudentImage , sendOtp,
  verifyOtp,
  resetPassword,} from "../controllers/studentController.js";

const router = express.Router();

// Route to get all students
router.get("/all", getAllStudents);
router.post("/login", loginStudent);
router.get("/:id", getStudentById);
// ✅ Request Certificate
router.post("/:id/request-certificate", requestCertificate);
router.post("/course-duration", getCourseDuration);

router.get("/sidebar/logo/:id", getFranchiseLogo);
router.get("/profile/image/:rollNumber", getStudentImage);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);


export default router;
