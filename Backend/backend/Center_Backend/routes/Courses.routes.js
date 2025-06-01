import express from 'express';
import {  getCourses , createCourse , getCoursesCount , getRecentCourses, updateCourseById, getCourseById, addNoteToCourse } from '../controllers/courses.controller.js';
import { uploadCourseFiles, uploadSingleNoteFile } from '../middlewares/course.multer.middleware.js'; // Import the new multer middleware

const router = express.Router();

// Routes
router.post('/createCourses', uploadCourseFiles, createCourse); 
router.get('/getCourses', getCourses);
router.get('/count' , getCoursesCount);
router.get('/recent', getRecentCourses);
router.get('/course/:courseId', getCourseById); 
router.put('/update/:courseId', uploadCourseFiles, updateCourseById); 
router.post('/:courseId/notes', uploadSingleNoteFile, addNoteToCourse); // New route to add a note to a course

// router.delete('/:id', deleteCourse);

export default router;
