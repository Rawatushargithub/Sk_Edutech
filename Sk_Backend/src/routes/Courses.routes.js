import express from 'express';
import {  getCourses , createCourse } from '../controllers/courses.controller.js';
//import upload from '../middlewares/multer.js'; // Multer for file uploads

const router = express.Router();

// Routes
router.post('/createCourses', createCourse);
router.get('/getCourses', getCourses);
// router.get('/:id', getCourseById);
// router.put('/:id', updateCourse);
// router.delete('/:id', deleteCourse);

export default router;
