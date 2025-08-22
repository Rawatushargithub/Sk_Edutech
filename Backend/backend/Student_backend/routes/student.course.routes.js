import express from "express";
import { getCourseByCode, getCoursesByFranchise } from "../controllers/student.course.controller.js";

const   router = express.Router();

// Route -> /api/courses/:courseCode
router.get("/:courseCode", getCourseByCode);
router.get("/list/:franchiseId", getCoursesByFranchise);

export default router;
