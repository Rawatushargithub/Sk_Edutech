
import express from "express";
import { getExamsByStudentDetails, getExamById,
  submitExamAnswers, getExamWithQuestions, getExamQuestionsForExam } from "../controllers/exam.controller.js";

const router = express.Router();

router.post("/by-student-details", getExamsByStudentDetails);
router.get("/online/:id", getExamById);

// routes/exam.routes.js
router.post("/online/:id/submit", submitExamAnswers);

router.get("/online/exam-with-questions/:id", getExamWithQuestions);
router.get("/online/:id/questions", getExamQuestionsForExam);


export default router;
