import express from 'express';
import {
    getAdminCourses,
    getAdminCoursesWithFilters,
    getAdminCourseById,
    getAdminCoursesStats,
    deleteAdminCourse,
    updateAdminCourseStatus
} from '../controllers/admin.course.controller.js'; // Adjust path as needed

// Import your auth middleware
// import { authenticateAdmin } from '../middleware/authMiddleware.js'; // Adjust path as needed

const router = express.Router();

// Routes for admin courses management

// GET /api/v1/institute_courses/admin-courses
// Get all courses created by admin (simple)
router.get('/admin-courses',  getAdminCourses);

// GET /api/v1/institute_courses/admin-courses/filtered
// Get admin courses with filters, search, and pagination
router.get('/admin-courses/filtered', getAdminCoursesWithFilters);

// GET /api/v1/institute_courses/admin-courses/stats
// Get admin courses statistics
router.get('/admin-courses/stats',  getAdminCoursesStats);

// GET /api/v1/institute_courses/admin-course/:courseId
// Get single admin course by ID
router.get('/admin-course/:courseId', getAdminCourseById);

// DELETE /api/v1/institute_courses/delete/:courseId
// Delete admin course (this route already exists in your frontend)
router.delete('/delete/:courseId', deleteAdminCourse);

// PATCH /api/v1/institute_courses/admin-course/:courseId/status
// Update admin course status
router.patch('/admin-course/:courseId/status',  updateAdminCourseStatus);

export default router;

// If you're adding these to an existing routes file, just add the individual routes:
/*
// Add these lines to your existing course routes file:

// Admin courses routes
router.get('/admin-courses', authenticateAdmin, getAdminCourses);
router.get('/admin-courses/filtered', authenticateAdmin, getAdminCoursesWithFilters);
router.get('/admin-courses/stats', authenticateAdmin, getAdminCoursesStats);
router.get('/admin-course/:courseId', authenticateAdmin, getAdminCourseById);
router.delete('/delete/:courseId', authenticateAdmin, deleteAdminCourse);
router.patch('/admin-course/:courseId/status', authenticateAdmin, updateAdminCourseStatus);
*/