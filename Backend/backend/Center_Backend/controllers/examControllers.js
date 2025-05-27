import Exam from "../models/Exam.models.js"
import Student from "../models/Student/Student_Detais.model.js";
import { asyncHandler } from "../utils/asynchanlder.js";
import mongoose from "mongoose";

// export const createExam = asyncHandler(async (req, res) => {
//   try {
//     const {
//       courseCode,
//       batch,
//       examDate,
//       examDurationMinutes,
//       totalQuestions,
//       passingMarks,
//       examMode = "Offline", // Default to Offline mode
//       status = "Active", // Default to Active status
//     } = req.body;

//     // Validate required fields
//     if (!courseCode || !batch || !examDate || !examDurationMinutes || !totalQuestions || !passingMarks) {
//       return res.status(400).json({ 
//         message: "All fields are required: courseCode, batch, examDate, examDurationMinutes, totalQuestions, and passingMarks" 
//       });
//     }

//     // Check if batch is an array
//     if (!Array.isArray(batch)) {
//       return res.status(400).json({
//         message: "Batch must be provided as an array"
//       });
//     }
  
//     // Extract day from the examDate
//     const examDay = new Date(examDate).getDate();
    
//     // Create an array to hold all created exams
//     const createdExams = [];
    
//     // For each batch, create a separate exam document
//     for (const batchItem of batch) {
//       // Generate ExamID in the format: courseCode + batchName + day (e.g., BCA01B112)
//       const examID = `${courseCode}${batchItem}${examDay}`;
      
//       const newExam = new Exam({
//         ExamID: examID,
//         courseCode,
//         batch: batchItem, // Store single batch per document
//         examDate,
//         examDurationMinutes,
//         totalQuestions,
//         passingMarks,
//         examMode,
//         status,
//         createdAt: new Date(),
//         results: [] // Initialize with empty results array
//       });

//       // Save the exam to the database
//       await newExam.save();
//       createdExams.push(newExam);
//     }

//     console.log(`Added ${createdExams.length} exams successfully to database`);
//     res.status(201).json({ 
//       message: `${createdExams.length} exams added successfully`, 
//       exams: createdExams 
//     });

//   } catch (error) {
//     console.error("Error creating exam:", error);
//     res.status(500).json({ 
//       message: "Server error while creating exam", 
//       error: error.message 
//     });
//   }
// });


export const createExam = asyncHandler(async (req, res) => {
  try {
    const {
      courseCode,
      batch,
      examDate,
      examDurationMinutes,
      totalQuestions,
      totalMarks,
      passingMarks,
      examMode = "Offline", // Default to Offline mode
      status = "Active", // Default to Active status
    } = req.body;

    // Validate required fields
    if (!courseCode || !batch || !examDate || !examDurationMinutes || !totalQuestions || !passingMarks || !totalMarks) {
      return res.status(400).json({ 
        message: "All fields are required: courseCode, batch, examDate, examDurationMinutes, totalQuestions, and passingMarks and totalMarks" 
      });
    }

    // Check if batch is an array
    if (!Array.isArray(batch)) {
      return res.status(400).json({
        message: "Batch must be provided as an array"
      });
    }
  console.log("Batch:", batch);
    // Extract day from the examDate
    const examDay = new Date(examDate).getDate();
    
    // Create an array to hold all created exams
    const createdExams = [];
    
    // Helper function to convert batch name to short code (e.g., "BATCH 3" to "B3")
    const getBatchCode = (batchName) => {
      if (!batchName) return "";
      
      // Extract batch number from the name
      const batchNameUpperCase = batchName.toUpperCase();
      const matches = batchNameUpperCase.match(/BATCH\s+(\d+)/i);
      
      if (matches && matches[1]) {
        return `B${matches[1]}`; // Format as B + number (e.g., B3)
      }
      
      // Fallback: if the format is different, just use first letter + first number found
      const letterMatch = batchNameUpperCase.match(/[A-Z]/);
      const numberMatch = batchNameUpperCase.match(/\d+/);
      
      if (letterMatch && numberMatch) {
        return `${letterMatch[0]}${numberMatch[0]}`;
      }
      
      return batchNameUpperCase.slice(0, 2); // Last resort: take first two characters
    };
    
    // For each batch, create a separate exam document
    for (const batchItem of batch) {
      // Extract the batch code from the name (e.g., "BATCH 3" to "B3")
      console.log("Batch Item:", batchItem);
      const batchCode = getBatchCode(batchItem.name);

      // Generate ExamID in the format: courseCode + batchCode + day (e.g., BCA01B312)
      const examID = `${courseCode}_${batchCode}_${examDay}`;
      
      const newExam = new Exam({
        ExamID: examID,
        courseCode,
        batch: batchItem, // Store complete batch object as JSON string
        examDate,
        examDurationMinutes,
        totalQuestions,
        totalMarks,
        passingMarks,
        examMode,
        status,
        createdAt: new Date(),
        results: [] // Initialize with empty results array
      });

      // Save the exam to the database
      await newExam.save();
      createdExams.push(newExam);
    }

    res.status(201).json({ 
      message: `${createdExams.length} exams added successfully`, 
      exams: createdExams  
    });

  } catch (error) {
    console.error("Error creating exam:", error);
    res.status(500).json({ 
      message: "Server error while creating exam", 
      error: error.message 
    });
  }
});

// Fetch all exams
export const getAllExams = asyncHandler(async (req, res) => {
  try {
    const exams = await Exam.find().limit(10);;
    
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
})

export const deleteExam = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExam = await Exam.findByIdAndDelete(id);

    if (!deletedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete exam", error });
  }
})

// PATCH /api/v1/institute_exam/exams/:examId/status - Update exam status
export const updateExamStatus = asyncHandler(async (req, res) => {
  try {
    const { examId } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be either "Active" or "Inactive"' 
      });
    }
    
    const updatedExam = await Exam.findOneAndUpdate(
      { ExamID: examId },
      { status },
      { new: true }
    );
    
    if (!updatedExam) {
      return res.status(404).json({ 
        message: 'Exam not found' 
      });
    }
    
    res.status(200).json({
      message: 'Exam status updated successfully',
      exam: updatedExam
    });
  } catch (error) {
    console.error('Error updating exam status:', error);
    res.status(500).json({ 
      message: 'Failed to update exam status', 
      error: error.message 
    });
  }
});


export const getStudentsByCourseAndBatch = async (req, res) => {
  try {
    const { courseCode, batch } = req.query;

    console.log("Course Code:", courseCode);
    console.log("Batch ID:", batch);

    if (!courseCode || !batch) {
      return res.status(400).json({ message: 'courseName and batch are required' });
    }

   if (!mongoose.Types.ObjectId.isValid(batch)) {
  return res.status(400).json({ message: 'Invalid batch ID' });
}
const batchObjectId = new mongoose.Types.ObjectId(batch);

console.log("Batch Object ID:", batchObjectId);
    const students = await Student.find({
      courseInterested: courseCode,
      selectedBatch: batchObjectId,
    });
console.log("Students Found:", students);
    const formatted = {
      timings: students[0]?.selectedBatch?.timings || '',
      name: students[0]?.selectedBatch?.name || '',
      id: students[0]?.selectedBatch?._id || '',
      students: students.map(student => ({
        rollNumber: student.rollNumber,
        studentName: student.studentName
      }))
    };

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
