import express from "express";
import {
  getCourseResources,
  getLatestExam,
} from "../controllers/recent.videos.exam.notes.js"; // ✅ add .js

const router = express.Router();

// Route to fetch course resources
router.get("/course/resources/:courseCode", getCourseResources);

// Route to fetch latest exam by course and batch
router.get("/course/exam/:rollNumber/:franchiseId", getLatestExam);

export default router;
