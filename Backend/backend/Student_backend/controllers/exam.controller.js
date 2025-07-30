
import Exam from "../../Center_Backend/models/Exam.models.js";
import QuestionBank from "../../Center_Backend/models/Questionbank.model.js";
import Student from "../../Center_Backend/models/Student/Student_Detais.model.js"


export const getExamsByStudentDetails = async (req, res) => {
  try {
    const { rollNumber, courseCode } = req.body;
    console.log("Fetching exams for student:", { rollNumber, courseCode });
    if (!rollNumber || !courseCode) {
      return res.status(400).json({ 
        message: "Roll number and course code are required" 
      });
    }

    // First, find the student to get their batch information
    const student = await Student.findOne({ 
      rollNumber: rollNumber.trim(), 
      'courseInterested.courseCode': courseCode.trim().toUpperCase() 
    }).populate('selectedBatch');
    
    if (!student) {
      return res.status(404).json({ 
        message: "Student not found with provided roll number and course code" 
      });
    }

    const batchName = student.selectedBatch?.batchName;

    // Find exams that match both course code and student's batch
    const exams = await Exam.find({ 
      courseCode: courseCode.trim().toUpperCase(),
      'batch.name': batchName, // Assuming student has batchId field
      // Alternative if student has batch object: 'batch.id': student.batch.id
    }).sort({ examDate: 1 }); // Sort by exam date

    if (!exams || exams.length === 0) {
      return res.status(404).json({ 
        message: "No exams found for this student's course and batch" 
      });
    }
    
    res.status(200).json({
      message: "Exams fetched successfully",
      exams,
      studentBatch: student.batch || student.batchId, // Return batch info for reference
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// export const getExamsByCourseCode = async (req, res) => {
//   try {
//     const { courseCode } = req.params;
//     const exams = await Exam.find({ courseCode: courseCode.trim().toUpperCase(),});

//     if (!exams || exams.length === 0) {
//       return res.status(404).json({ message: "No exams found for this course" });
//     }
    
//     res.status(200).json({
//       message: "Exams fetched successfully",
//       exams,
//     });
//   } catch (error) {
//     console.error("Error fetching exams:", error);
//     res.status(500).json({ message: "Internal Server Error", error });
//   }
// };


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
  const { 
    answers, 
    rollNumber, 
    autoSubmitted = false, 
    reason = "", 
    violations = 0 
  } = req.body;

  try {
    console.log("Submitting exam:", { id, rollNumber, autoSubmitted, reason });
    console.log("Received answers:", answers);

    // Validation
    if (!rollNumber) {
      return res.status(400).json({ message: "Roll number is required" });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: "Valid answers are required" });
    }

    // Step 1: Fetch the exam
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    console.log("Exam found:", {
      courseCode: exam.courseCode,
      totalMarks: exam.totalMarks,
      totalQuestions: exam.totalQuestions,
      passingMarks: exam.passingMarks,
      questionsCount: exam.questions?.length
    });

    // Step 2: Get the question numbers
    const questionNumbers = exam.questions;
    if (!questionNumbers || !Array.isArray(questionNumbers) || questionNumbers.length === 0) {
      return res.status(400).json({ message: "No questions found in exam" });
    }

    // Step 3: Fetch question bank
    const questionBank = await QuestionBank.findOne({ courseCode: exam.courseCode });
    if (!questionBank) {
      return res.status(404).json({ message: "Question bank not found" });
    }

    if (!questionBank.questions || !Array.isArray(questionBank.questions)) {
      return res.status(400).json({ message: "No questions found in question bank" });
    }

    const correctQuestions = questionBank.questions.filter(q => 
      questionNumbers.includes(q.qNo)
    );

    console.log("Questions found:", {
      totalInBank: questionBank.questions.length,
      selectedQuestions: correctQuestions.length,
      questionNumbers: questionNumbers
    });

    if (correctQuestions.length === 0) {
      return res.status(400).json({ message: "No matching questions found" });
    }

    // Step 4: Compare answers and calculate score
    let correctCount = 0;
    const answerDetails = [];

    for (const q of correctQuestions) {
      const studentAnswer = answers[q.qNo];
      const correctAnswer = q.answer;
      const isCorrect = studentAnswer && correctAnswer && 
        studentAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      
      if (isCorrect) {
        correctCount++;
      }

      answerDetails.push({
        qNo: q.qNo,
        studentAnswer: studentAnswer || 'Not answered',
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
      });

      console.log(`Q${q.qNo}: Student: "${studentAnswer}", Correct: "${correctAnswer}", Match: ${isCorrect}`);
    }

    // Step 5: Calculate marks with proper validation
    const totalQuestions = correctQuestions.length;
    const totalMarks = exam.totalMarks && exam.totalMarks > 0 ? exam.totalMarks : totalQuestions;
    const passingMarks = exam.passingMarks && exam.passingMarks > 0 ? exam.passingMarks : (totalMarks * 0.4);

    // Calculate marks per question
    let perQuestionMarks = 1; // Default value
    if (totalMarks > 0 && totalQuestions > 0) {
      perQuestionMarks = totalMarks / totalQuestions;
    }

    // Calculate final marks
    let marksObtained = correctCount * perQuestionMarks;

    // Ensure marksObtained is a valid number
    if (isNaN(marksObtained) || !isFinite(marksObtained) || marksObtained < 0) {
      console.warn("Invalid marksObtained calculated:", marksObtained);
      marksObtained = 0;
    }

    // Round to 2 decimal places
    marksObtained = Math.round(marksObtained * 100) / 100;

    // Calculate percentage
    let percentage = 0;
    if (totalMarks > 0) {
      percentage = Math.round((marksObtained / totalMarks) * 100 * 100) / 100;
    }

    // Determine status
    const resultStatus = marksObtained >= passingMarks ? "Passed" : "Failed";

    console.log("Final calculation:", {
      correctCount,
      totalQuestions,
      totalMarks,
      perQuestionMarks,
      marksObtained,
      percentage,
      passingMarks,
      resultStatus
    });

    // Validate final values before saving
    if (isNaN(marksObtained)) {
      console.error("marksObtained is NaN - using 0 instead");
      marksObtained = 0;
    }

    // Step 6: Check if student already submitted
    const existingResultIndex = exam.results.findIndex(
      result => result.rollNumber === rollNumber
    );

    const resultData = {
      rollNumber,
      marksObtained,
      status: resultStatus,
      submittedAt: new Date(),
      autoSubmitted,
      reason: reason || null,
      violations: violations || 0,
      correctAnswers: correctCount,
      totalQuestions: totalQuestions,
      percentage: percentage
    };

    if (existingResultIndex >= 0) {
      // Update existing result
      exam.results[existingResultIndex] = resultData;
      console.log("Updated existing result for rollNumber:", rollNumber);
    } else {
      // Add new result
      exam.results.push(resultData);
      console.log("Added new result for rollNumber:", rollNumber);
    }

    // Save the exam
    await exam.save();

    console.log("Exam saved successfully");

    // Return success response
    return res.status(200).json({
      message: autoSubmitted ? 
        `Test auto-submitted successfully. Reason: ${reason}` : 
        "Test submitted successfully",
      marksObtained,
      totalMarks,
      percentage,
      status: resultStatus,
      correctAnswers: correctCount,
      totalQuestions,
      autoSubmitted,
      reason: reason || null
    });

  } catch (error) {
    console.error("Error submitting exam:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      message: "Server error while submitting exam",
      error: error.message 
    });
  }
};

// Helper function to validate numeric values
const validateNumber = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? fallback : num;
};