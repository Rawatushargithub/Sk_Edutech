import express from 'express';
import {
    getAllCoursesAdmin,
    updateCourseAdminStatus,
    getCourseByIdAdmin,
    getCoursesCount,
    getRecentCourses
} from '../controllers/courses.controller.js';
// import { verifyJWTAdmin } from '../middlewares/admin.auth.middleware.js'; // Assuming you have admin auth middleware

const router = express.Router();

// Apply admin authentication middleware to all routes in this file
// router.use(verifyJWTAdmin); // Uncomment and use your actual admin auth middleware

// Admin routes for courses
router.get('/', getAllCoursesAdmin); // Get all courses, can filter by ?status=pending
router.get('/:courseId', getCourseByIdAdmin); // Get a single course by ID
router.patch('/:courseId/status', updateCourseAdminStatus); // Update admin approval status (approved/rejected)
router.get('/courses/count' , getCoursesCount);
router.get('/courses/recent', getRecentCourses); 


export default router;
