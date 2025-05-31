// batchRoutes.js 
import express from 'express';
import { createQuestionBank , getQuestionsByCourse , editQuestion ,deleteQuestion} from '../controllers/questionBank.controller.js';

const router = express.Router();
 
// Get all batches (for dropdown) 
router.post('/create-question',createQuestionBank );
router.get('/:selectedCourseCode/questions', getQuestionsByCourse);
router.put('/:selectedCourseCode/questions/:questionId', editQuestion);
router.delete('/:courseCode/questions/:questionId', deleteQuestion);


export default router;