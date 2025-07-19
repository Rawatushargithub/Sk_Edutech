import express from "express";
import { requestCertificate, getCertificates, updateCertificateStatus, getCertificateDetails, verifyCertificateById } from "../controllers/certificateController.js";

const router = express.Router();

router.post("/:id/request-certificate", requestCertificate);
router.get("/", getCertificates);
router.put("/:id/status", updateCertificateStatus);
router.post('/approvedcertificate', getCertificateDetails);
router.get("/verify-certificate/:id", verifyCertificateById);

export default router;
