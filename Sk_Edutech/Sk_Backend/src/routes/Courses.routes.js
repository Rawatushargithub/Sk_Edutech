import express from 'express';
import { getCourses, createCourse, getCoursesCount, getRecentCourses, getAllCourses, getCourseById, updateCourse, deleteCourse } from '../controllers/courses.controller.js';
import { upload } from '../middlewares/multer.middleware.js'; // Import multer middleware

const router = express.Router();

// Configure multer for file uploads
const courseUpload = upload.fields([
  { name: 'courseImage', maxCount: 1 },
  { name: 'courseMaterials', maxCount: 10 }
]);

// Routes
router.post('/createCourses', courseUpload, createCourse);
router.get('/getCourses', getCourses);
router.get('/getAllCourses', getAllCourses); // New route for getting all course details
router.get('/count', getCoursesCount);
router.get('/recent', getRecentCourses);
router.get('/:id', getCourseById);
router.put('/:id', courseUpload, updateCourse);
router.delete('/:id', deleteCourse);

export default router;