import express from "express";
import { getStudentRating } from "../controllers/star.controller.js";

const router = express.Router();

// GET student rating
// Example: /api/exams/rating?courseCode=CS101&franchiseId=F123&rollNumber=R001
router.get("/rating", getStudentRating);

export default router;
