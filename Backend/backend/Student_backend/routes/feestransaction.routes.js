import express from "express";
import { getFeeHistoryByStudent } from "../controllers/feestransaction.controller.js";

const router = express.Router();

// GET /api/fees/history/:studentId
router.get("/history/:studentId", getFeeHistoryByStudent);

export default router;
