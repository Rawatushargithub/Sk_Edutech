import express from 'express';
import { 
  requestCertificate,
  bulkRequestCertificates,
  getCertificates,
  updateCertificateStatus,
  generateCertificatePDF
} from '../controllers/certificate.controller.js';

const router = express.Router();

// Get all certificates with filters
router.get('/', getCertificates);

// Request a certificate
router.post('/request', requestCertificate);

// Request certificates in bulk
router.post('/request-bulk', bulkRequestCertificates);

// Update certificate status (approve/reject)
router.put('/:id/status', updateCertificateStatus);

// Generate certificate PDF
router.get('/:id/generate', generateCertificatePDF);

export default router;