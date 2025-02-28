import express from "express"
import { createExam, getAllExams, deleteExam, updateExamStatus } from "../controllers/examControllers.js"

const router = express.Router();

router.post("/exams", createExam);

// Route to fetch all exams
router.get("/exams", getAllExams);

router.put("/exams/:id/status", updateExamStatus);
router.delete("/exams/:id", deleteExam); // ✅ Ensure this exists!

export default router;
