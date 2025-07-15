
import express from "express";
import { getExamsByCourseCode, getExamById,
  submitExamAnswers, getExamWithQuestions, getExamQuestionsForExam } from "../controllers/exam.controller.js";

const router = express.Router();

router.get("/by-course/:courseCode", getExamsByCourseCode);
router.get("/online/:id", getExamById);

// routes/exam.routes.js
router.post("/online/:id/submit", submitExamAnswers);

router.get("/online/exam-with-questions/:id", getExamWithQuestions);
router.get("/online/:id/questions", getExamQuestionsForExam);


export default router;
