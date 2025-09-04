import express from "express";
import { getAllMarksheets, updateApprovalStatus } from "../controllers/admin.marksheet.controller.js";
import { downloadMarksheetPDF  } from "../controllers/generate.marksheet.js";
const router = express.Router();

// GET all marksheets
router.get("/marksheetlist", getAllMarksheets);

// PUT update approval status for a student
router.put("/adminside/:marksheetId/:courseCode/:studentId", updateApprovalStatus);

router.get('/download', downloadMarksheetPDF);
export default router;
