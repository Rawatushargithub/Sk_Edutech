// import express from "express";
// import {
//   fetchCertificateData,
//   requestCertificate, approveStudentCertificate, checkCertificateStatus,
//   getAllCertificates,
//   getRequestedCertificates,
//   getApprovedCertificates,
//   getActiveFranchises,
// } from "../controllers/certificate.controller.js";
// import Exam from "../models/Exam.models.js";

// const router = express.Router();

// // ✅ Get all exams by franchiseId (for dropdown)
// router.get("/exams/by-franchise/:franchiseId", async (req, res) => {
//   try {
//     const { franchiseId } = req.params;
//     const exams = await Exam.find({ "franchiseId": franchiseId });
//     res.json(exams);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching exams", error: error.message });
//   }
// });

// // ✅ Get processed student data for certificate request
// router.get("/certificates/fetch", fetchCertificateData);

// // ✅ Submit certificate request
// router.post("/certificates/request", requestCertificate);
// router.get("/certificates/all", getAllCertificates);
// router.put("/certificates/approve/student", approveStudentCertificate);
// router.get("/certificates/status", checkCertificateStatus);

// router.get('/certificates/requested', getRequestedCertificates);
// router.get('/certificates/approved', getApprovedCertificates);
// router.get('/franchises/active', getActiveFranchises);

// // Keep existing routes
// // router.get('/certificates/all', getAllCertificates);
// // router.put('/certificates/approve/student', approveStudentCertificate);


// export default router;

import express from "express";
import {
  fetchCertificateData,
  requestCertificate, 
  approveStudentCertificate, 
  checkCertificateStatus,
  getAllCertificates,
  getRequestedCertificates,
  getApprovedCertificates,
  getActiveFranchises,
} from "../controllers/certificate.controller.js";
import Exam from "../models/Exam.models.js";
import Course from "../models/Courses/Courses.models.js";

const router = express.Router();

// ✅ Get all courses by franchiseId (for dropdown)
router.get("/courses/by-franchise/:franchiseId", async (req, res) => {
  try {
    const { franchiseId } = req.params;
    
    // Get all unique course codes from exams for this franchise
    const exams = await Exam.find({ "franchiseId": franchiseId }).distinct('courseCode');
    
    // Get course details for these course codes
    const courses = await Course.find({ courseCode: { $in: exams } });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error: error.message });
  }
});

// ✅ Get all exams by franchiseId and courseCode (for dropdown)
router.get("/exams/by-course/:franchiseId/:courseCode", async (req, res) => {
  try {
    const { franchiseId, courseCode } = req.params;
    const exams = await Exam.find({ 
      "franchiseId": franchiseId,
      "courseCode": courseCode 
    });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching exams by course", error: error.message });
  }
});

// ✅ Get all exams by franchiseId (for dropdown) - keeping for backward compatibility
router.get("/exams/by-franchise/:franchiseId", async (req, res) => {
  try {
    const { franchiseId } = req.params;
    const exams = await Exam.find({ "franchiseId": franchiseId });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching exams", error: error.message });
  }
});

// ✅ Get processed student data for certificate request
router.get("/certificates/fetch", fetchCertificateData);

// ✅ Submit certificate request
router.post("/certificates/request", requestCertificate);
router.get("/certificates/all", getAllCertificates);
router.put("/certificates/approve/student", approveStudentCertificate);
router.get("/certificates/status", checkCertificateStatus);

router.get('/certificates/requested', getRequestedCertificates);
router.get('/certificates/approved', getApprovedCertificates);
router.get('/franchises/active', getActiveFranchises);

export default router;