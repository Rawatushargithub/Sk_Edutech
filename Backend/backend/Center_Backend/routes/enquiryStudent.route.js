import express from 'express';
import { addStudent, getStudents, deleteStudent, updateEnquiryStatus } from '../controllers/enquiry.controller.js';

const router = express.Router();

// @route   POST /api/students
// @desc    Add new student enquiry
router.post('/', addStudent);


// @route   GET /api/students
// @desc    Get all student enquiries
router.get('/', getStudents);

// @route   DELETE /api/students/:id
// @desc    Delete a student enquiry by ID
router.delete('/:id', deleteStudent);

router.put('/:id/status', updateEnquiryStatus);

// router.get('/status-summary', getStatusSummary);
// router.get('/ready-to-contact', getReadyToContact);

export default router;
