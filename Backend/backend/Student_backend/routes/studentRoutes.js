import express from "express";
import {loginStudent , getAllStudents, getStudentById, requestCertificate, getCourseDuration} from "../controllers/studentController.js";

const router = express.Router();

// Route to get all students
router.get("/all", getAllStudents);
router.post("/login", loginStudent);
router.get("/:id", getStudentById);
// ✅ Request Certificate
router.post("/:id/request-certificate", requestCertificate);
router.post("/course-duration", getCourseDuration);


export default router;
