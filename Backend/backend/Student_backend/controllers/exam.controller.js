
import Exam from "../../Center_Backend/models/Exam.models.js";
import QuestionBank from "../../Center_Backend/models/Questionbank.model.js";

export const getExamsByCourseCode = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const exams = await Exam.find({ courseCode: courseCode.trim().toUpperCase(),});

    if (!exams || exams.length === 0) {
      return res.status(404).json({ message: "No exams found for this course" });
    }
    
    res.status(200).json({
      message: "Exams fetched successfully",
      exams,
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};


// ✅ GET /exams/:id — Get exam by ID
export const getExamById = async (req, res) => {
  try {
    // console.log("Fetching exam with ID:", req.params.id);
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.json({ exam });
  } catch (err) {
    console.error("Error fetching exam by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// import Exam from "../models/exam.model.js";
// import QuestionBank from "../models/QuestionBank.model.js";

export const getExamQuestionsForExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const { courseCode, questions: qNos } = exam;

    const course = await QuestionBank.findOne({ courseCode });
    if (!course) return res.status(404).json({ message: "Question bank not found" });

    // Filter only those questions whose qNo is in exam.questions
    const selectedQuestions = course.questions.filter(q => qNos.includes(q.qNo));

    res.status(200).json({ questions: selectedQuestions });
  } catch (error) {
    console.error("Error in getExamQuestionsForExam:", error);
    res.status(500).json({ message: "Server error" });
  }
};




export const getExamWithQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find exam
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // 2. Get courseCode and qNo list
    const { courseCode, questions: examQNos } = exam;

    // 3. Get the question bank for that course
    const questionBank = await QuestionBank.findOne({ courseCode });
    if (!questionBank) {
      return res.status(404).json({ message: "Question bank not found for this course" });
    }

    // 4. Filter questions by qNo
    const matchedQuestions = questionBank.questions.filter(q =>
      examQNos.includes(q.qNo)
    );

    return res.status(200).json({
      exam,
      questions: matchedQuestions
    });

  } catch (error) {
    console.error("Error in getExamWithQuestions:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// ✅ POST /exams/:id/submit — Submit exam result
// import Exam from "../models/exam.model.js";
// import QuestionBank from "../models/questionBank.model.js";

export const submitExamAnswers = async (req, res) => {
  const { id } = req.params;
  const { answers, rollNumber } = req.body;

  try {
    // Step 1: Fetch the exam
    const exam = await Exam.findById(id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // Step 2: Get the question numbers
    const questionNumbers = exam.questions;

    // Step 3: Fetch question bank
    const questionBank = await QuestionBank.findOne({ courseCode: exam.courseCode });
    if (!questionBank) return res.status(404).json({ message: "Question bank not found" });

    const correctQuestions = questionBank.questions.filter(q => questionNumbers.includes(q.qNo));

    // Step 4: Compare answers
    let correctCount = 0;

    for (const q of correctQuestions) {
      if (answers[q.qNo] && answers[q.qNo].toLowerCase() === q.answer.toLowerCase()) {
        correctCount++;
      }
    }

    const perQuestionMarks = exam.totalMarks / exam.totalQuestions;
    const marksObtained = correctCount * perQuestionMarks;

    const resultStatus = marksObtained >= exam.passingMarks ? "Passed" : "Failed";

    // Step 5: Save result inside exam.results[]
    exam.results.push({
      rollNumber,
      marksObtained,
      status: resultStatus
    });

    await exam.save();

    return res.status(200).json({
      message: "Test submitted successfully",
      marksObtained,
      status: resultStatus
    });

  } catch (error) {
    console.error("Error submitting exam:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
