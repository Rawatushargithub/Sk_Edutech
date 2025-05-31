import QuestionBank from '../models/Questionbank.model.js';

// Create a new question
export const createQuestionBank = async (req, res) => {
  try {
    const { courseCode, courseName, question, options, answer, qNo } = req.body;
    // Validate required fields
    if (!courseCode || !courseName || !question || !options || !answer || !qNo) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newQuestion = new QuestionBank({
      courseCode,
      courseName,
      question: {
        qNo,
        question,
        options,
        answer
      }
    });

    await newQuestion.save();
    res.status(201).json({ message: 'Question created successfully', data: newQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all questions for a particular course
export const getQuestionsByCourse = async (req, res) => {
  try {
    const { selectedCourseCode } = req.params;
    const questions = await QuestionBank.find({ courseCode: selectedCourseCode });
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this course' });
    }
    // Return array of question objects
    res.json({ data: questions.map(q => ({ _id: q._id, ...q.question })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit a question for a course
export const editQuestion = async (req, res) => {
  try {
    console.log("Editing question with params:", req.params);
    console.log("Request body:", req.body);
    const { selectedCourseCode, questionId } = req.params;
    const { question, options, answer, qNo } = req.body;

    const updated = await QuestionBank.findOneAndUpdate(
      { courseCode:selectedCourseCode , _id: questionId },
      {
        $set: {
          'question.qNo': qNo,
          'question.question': question,
          'question.options': options,
          'question.answer': answer
        }
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Question not found' });

    res.json({ message: 'Question updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a question for a course
export const deleteQuestion = async (req, res) => {
  try {
    const { courseCode, questionId } = req.params;

    const deleted = await QuestionBank.findOneAndDelete({ courseCode, _id: questionId });
    if (!deleted) return res.status(404).json({ message: 'Question not found' });

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};