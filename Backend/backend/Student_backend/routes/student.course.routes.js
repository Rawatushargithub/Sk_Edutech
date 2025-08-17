import express from "express";
import { getCourseByCode } from "../controllers/student.course.controller.js";

const router = express.Router();

// Route -> /api/courses/:courseCode
router.get("/:courseCode", getCourseByCode);

export default router;
