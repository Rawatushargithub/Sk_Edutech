import express from "express"
import { createExam, getAllExams, deleteExam, updateExamStatus ,getStudentsByCourseAndBatch, uploadMarks ,updateExam ,getExamQuestions ,addQuestionToExam ,removeQuestionFromExam } from "../controllers/examControllers.js"

const router = express.Router();

router.post("/create-exams", createExam);
router.get("/students", getStudentsByCourseAndBatch); // ✅ Ensure this exists!
 
router.get("/exams", getAllExams); 
router.patch("/exams/:examId/status", updateExamStatus); // ✅ Ensure this exists!
router.delete("/exams/:id", deleteExam); // ✅ Ensure this exists!
router.post("/exams/:selectedExam/marks", uploadMarks); 
router.put("/exams/updateExam/:examId", updateExam);  

// Get questions for a specific exam
router.get('/exams/:examId/questions', getExamQuestions);

// Add a question to an exam (by question number)
router.post('/exams/:examId/questions', addQuestionToExam);

// Remove a question from an exam
router.delete('/exams/:examId/questions/:qNo', removeQuestionFromExam);

export default router; 
