import express from "express";
import {generateAdmitCard} from "../controllers/AdmitCard.controller.js"
const router = express.Router();

router.get("/generate/:examId/:rollNumber", generateAdmitCard);


export default router;
