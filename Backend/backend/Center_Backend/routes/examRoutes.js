import express from "express"
import { createExam, getAllExams, deleteExam, updateExamStatus ,getStudentsByCourseAndBatch, uploadMarks ,updateExam } from "../controllers/examControllers.js"

const router = express.Router();

router.post("/exams", createExam);
router.get("/students", getStudentsByCourseAndBatch); // ✅ Ensure this exists!

router.get("/exams", getAllExams); 
router.patch("/exams/:examId/status", updateExamStatus); // ✅ Ensure this exists!
router.delete("/exams/:id", deleteExam); // ✅ Ensure this exists!
router.post("/exams/:selectedExam/marks", uploadMarks); 
router.put("/exams/updateExam", updateExam); 

export default router; 
