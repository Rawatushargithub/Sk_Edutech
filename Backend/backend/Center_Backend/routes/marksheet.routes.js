import express from 'express';
import {
    getFranchiseCourses,
    getCourseStudents,
    createOrUpdateMarksheet,
    getStudentMarksheet,
    getFranchiseMarksheets,
    deleteMarksheet,
    publishMarksheet,
    downloadApprovedMarksheet
} from '../controllers/marksheet.controller.js';

const router = express.Router();

// Get all courses for franchise
router.get('/courses', getFranchiseCourses);

// Get students for a specific course
router.get('/students/:courseId', getCourseStudents);

// Create or update marksheet
router.post('/create', createOrUpdateMarksheet);

// Get specific student marksheet
router.get('/student/:studentId/course/:courseCode', getStudentMarksheet);

// Get all marksheets for franchise
router.get('/all', getFranchiseMarksheets);

// Publish marksheet
router.patch('/publish/:marksheetId', publishMarksheet);

// Delete marksheet
router.delete('/:marksheetId', deleteMarksheet);

// Download approved marksheet
router.get('/download/:studentId/:courseCode', downloadApprovedMarksheet);

export default router;
