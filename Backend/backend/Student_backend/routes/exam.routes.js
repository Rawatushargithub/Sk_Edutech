
import express from "express";
import { getExamsByCourseCode } from "../controllers/exam.controller.js";

const router = express.Router();

router.get("/by-course/:courseCode", getExamsByCourseCode);

export default router;
