import express from 'express';
import {  getCourses , createCourse , getCoursesCount , getRecentCourses, updateCourseById, getCourseById, addNoteToCourse, addVideoLinkToCourse, deleteVideoFromCourse, deleteNoteFromCourse } from '../controllers/courses.controller.js';
import { uploadCourseFiles, uploadSingleNoteFile } from '../middlewares/course.multer.middleware.js'; 

const router = express.Router();

// Routes

router.post('/createCourse', uploadCourseFiles, createCourse); 
router.get('/getCourses', getCourses);
router.get('/count' , getCoursesCount); 
router.get('/recent', getRecentCourses); 
router.get('/course/:courseId', getCourseById); 
router.put('/update/:courseId', uploadCourseFiles, updateCourseById); 

router.post('/:courseId/notes', uploadSingleNoteFile, addNoteToCourse); 
router.post('/:courseId/videos', addVideoLinkToCourse); // New route to add a video link to a course

// Delete routes
router.delete('/:courseId/videos/:videoId', deleteVideoFromCourse); // Delete a specific video from a course
router.delete('/:courseId/notes/:noteId', deleteNoteFromCourse); // Delete a specific note from a course

// router.delete('/:id', deleteCourse);

export default router;
