import QuestionBank from '../models/Questionbank.model.js';

// Add a new question to a course's question bank
export const createQuestionBank = async (req, res) => {
  try {
    const { courseCode, courseName, qNo, question, options, answer, franchiseId } = req.body;
    if (!courseCode || !courseName || !qNo || !question || !options || !answer) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    console.log("Received data:", req.body);
    // Find or create the course's question bank
    let qb = await QuestionBank.findOne({ courseCode });
    if (!qb) {
      qb = new QuestionBank({
        courseCode,
        courseName,
        questions: [],
        
      });
    }

    qb.courseName = courseName; // update courseName if changed

    qb.questions.push({ qNo, question, options, answer, franchiseId });
    await qb.save();

    res.status(201).json({ message: 'Question added successfully', data: qb });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all questions for a particular course
export const getQuestionsByCourse = async (req, res) => {
  try { 
    const { selectedCourseCode } = req.params;
    const qb = await QuestionBank.findOne({ courseCode: selectedCourseCode });
    if (!qb) {
      return res.status(404).json({ message: 'No questions found for this course' });
    }
    // Return array of question objects with their _id
    res.json({ data: qb.questions.map(q => ({ ...q.toObject(), _id: q._id })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit a question for a course
export const editQuestion = async (req, res) => {
  try {
    const { selectedCourseCode, questionId } = req.params;
    const { qNo, question, options, answer } = req.body;

    const qb = await QuestionBank.findOne({ courseCode: selectedCourseCode });
    if (!qb) return res.status(404).json({ message: 'Course not found' });

    const q = qb.questions.id(questionId);
    if (!q) return res.status(404).json({ message: 'Question not found' });

    q.qNo = qNo;
    q.question = question;
    q.options = options;
    q.answer = answer;

    await qb.save();
    res.json({ message: 'Question updated successfully', data: q });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a question for a course
export const deleteQuestion = async (req, res) => {
  try {
    const { selectedCourseCode, questionId } = req.params;

    const qb = await QuestionBank.findOne({ courseCode: selectedCourseCode });
    if (!qb) return res.status(404).json({ message: 'Course not found' });

    const q = qb.questions.id(questionId);
    if (!q) return res.status(404).json({ message: 'Question not found' });

    q.remove();
    await qb.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// No changes needed for this feature