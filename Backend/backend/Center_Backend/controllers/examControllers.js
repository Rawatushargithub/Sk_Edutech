import Exam from "../models/Exam.models.js"
import Student from "../models/Student/Student_Detais.model.js";
import { asyncHandler } from "../utils/asynchanlder.js";
import mongoose from "mongoose";


export const createExam = asyncHandler(async (req, res) => {
  try {
    const {
      courseCode,
      batch,
      examDate,
      franchiseId,
      examType = "Weekly Test", // New field for exam type
      examStartTime, // NEW REQUIRED FIELD
      examEndTime, // NEW REQUIRED FIELD
      examDurationMinutes,
      totalQuestions,
      totalMarks,
      passingMarks,
      examMode = "Offline", // Default to Offline mode
      status = "Active", // Default to Active status
      selectedQuestions // This is expected from frontend for online exams
    } = req.body;
    console.log(req.body);
    console.log("Type of :: ", typeof examStartTime, examStartTime);
    // Validate required fields (including new time fields)
    if (!courseCode || !batch || !examDate || !examStartTime || !examEndTime || !examDurationMinutes || !totalQuestions || !passingMarks || !totalMarks || !examType) {
      return res.status(400).json({ 
        message: "All fields are required: courseCode, batch, examDate, examType, examStartTime, examEndTime, examDurationMinutes, totalQuestions, passingMarks and totalMarks" 
      });
    }

    // Check if batch is an array
    if (!Array.isArray(batch)) {
      return res.status(400).json({
        message: "Batch must be provided as an array"
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(examStartTime)) {
      return res.status(400).json({
        message: "examStartTime must be in HH:MM format (24-hour)"
      });
    }
    
    if (!timeRegex.test(examEndTime)) {
      return res.status(400).json({
        message: "examEndTime must be in HH:MM format (24-hour)"
      });
    }

    // Validate that end time is after start time
    const [startHour, startMin] = examStartTime.split(':').map(Number);
    const [endHour, endMin] = examEndTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        message: "examEndTime must be after examStartTime"
      });
    }

    // Optional: Validate that duration matches the time difference
    const actualDuration = endMinutes - startMinutes;
    if (Math.abs(actualDuration - examDurationMinutes) > 1) { // Allow 1 minute tolerance
      return res.status(400).json({
        message: `examDurationMinutes (${examDurationMinutes}) should match the time difference between start and end times (${actualDuration} minutes)`
      });
    }

    // Validate exam type
    const validExamTypes = ["Weekly Test", "Monthly Test", "Final Test"];
    if (!validExamTypes.includes(examType)) {
      return res.status(400).json({
        message: "Invalid exam type. Must be one of: Weekly Test, Monthly Test, Final Test"
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
    
    // Helper function to get exam type code
    const getExamTypeCode = (examType) => {
      switch (examType) {
        case "Weekly Test":
          return "WT";
        case "Monthly Test":
          return "MT";
        case "Final Test":
          return "FT";
        default:
          return "EX";
      }
    };
    
    // For each batch, create a separate exam document
    for (const batchItem of batch) {
      // Validate batch structure according to new schema
      if (!batchItem.timings || !batchItem.name || !batchItem.id) {
        return res.status(400).json({
          message: "Each batch must have timings, name, and id properties"
        });
      }

      // Extract the batch code from the name (e.g., "BATCH 3" to "B3")
      const batchCode = getBatchCode(batchItem.name);
      const examTypeCode = getExamTypeCode(examType);
      
      // Updated ExamID format: CourseCode_ExamType_BatchCode_Day
      // Example: CS101_WT_B3_15 (Computer Science 101, Weekly Test, Batch 3, Day 15)
      const examID = `${courseCode}_${examTypeCode}_${batchCode}_${examDay}`;

      // Prepare exam object according to new schema
      const examObj = {
        ExamID: examID,
        courseCode, 
        batch: {
          timings: batchItem.timings,
          name: batchItem.name,
          id: batchItem.id
        },
        examDate,
        franchiseId, // Add franchiseId to the exam object
        examType, // Add exam type to the exam object
        examStartTime, // NEW: Add exam start time
        examEndTime, // NEW: Add exam end time
        examDurationMinutes,
        totalQuestions,
        totalMarks,
        passingMarks,
        examMode,
        status,
        createdAt: new Date(),
        results: []
      };

      // If online, add questions array (from selectedQuestions, which should be array of qNo)
      if (examMode === "Online" && Array.isArray(selectedQuestions)) {
        examObj.questions = selectedQuestions.map(q => Number(q));
      } else if (examMode === "Online") {
        // For online exams, questions array is required even if empty
        examObj.questions = [];
      }

      const newExam = new Exam(examObj);

      // Save the exam to the database
      await newExam.save();
      createdExams.push(newExam);
    }

    // Determine response message based on exam type and count
    let message = `${createdExams.length} ${examType.toLowerCase()}`;
    if (createdExams.length > 1) {
      message += `s added successfully across ${createdExams.length} batches`;
    } else {
      message += ` added successfully`;
    }

    res.status(201).json({
      message: message,
      examType: examType,
      examsCreated: createdExams.length,
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

export const getStudentsByCourseAndBatch = async (req, res) => {
  try {
    const { courseCode, batch, franchiseId } = req.query;

    console.log("Course Code:", courseCode);
    console.log("Batch ID:", batch);
    console.log("Franchise ID:", franchiseId);

    if (!courseCode || !batch) {
      return res.status(400).json({ message: 'courseCode and batch are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(batch)) {
      return res.status(400).json({ message: 'Invalid batch ID' });
    }
    
    const batchObjectId = new mongoose.Types.ObjectId(batch);
    console.log("Batch Object ID:", batchObjectId);

    // Build filter object
    let filter = { 
      'courseInterested.courseCode': courseCode,
      selectedBatch: batchObjectId,
    };
    
    // Add franchise filter if provided
    if (franchiseId) {
      filter.franchiseId = franchiseId;
    }

    // Find students by courseCode, selectedBatch, and optionally franchiseId
    const students = await Student.find(filter).populate('selectedBatch'); // Populate batch details

    console.log("Students Found:", students);

    if (students.length === 0) {
      return res.status(404).json({   
        message: 'No students found for the given course and batch combination' 
      });
    }

    // Format the response with batch details and student list
    const formatted = {
      totalStudents: students.length,
      students: students.map(student => ({
        id: student._id,
        rollNumber: student.rollNumber,
        studentName: student.studentName,
      })),
      franchiseId: franchiseId || 'all'
    };

    res.status(200).json(formatted);
    
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllExams = asyncHandler(async (req, res) => {
  try {
    const { examMode, franchiseId } = req.query; // Get examMode and franchiseId from query parameters
    console.log("Fetching exams with examMode:", examMode, "and franchiseId:", franchiseId);
    // Build filter object
    let filter = {};
    
    // Filter by examMode if provided
    if (examMode && (examMode === 'Online' || examMode === 'Offline')) {
      filter.examMode = examMode;
    }
    
    // Filter by franchiseId if provided
    if (franchiseId) {
      filter.franchiseId = franchiseId;
    }
  
    // Fetch exams based on filter
    const exams = await Exam.find(filter).limit(10);
    
    // Get counts for both modes with franchise filtering
    const countFilter = franchiseId ? { franchiseId } : {};
    const onlineCount = await Exam.countDocuments({ ...countFilter, examMode: 'Online' });
    const offlineCount = await Exam.countDocuments({ ...countFilter, examMode: 'Offline' });
    const totalCount = await Exam.countDocuments(countFilter);
    
    res.status(200).json({
      exams,
      counts: {
        online: onlineCount,
        offline: offlineCount,
        total: totalCount
      },
      currentFilter: examMode || 'all',
      franchiseId: franchiseId || 'all'
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

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

// Upload marks for a specific exam 
export const uploadMarks = async (req, res) => {
  try {
    console.log("upload is working")
    const { selectedExam } = req.params;
    const { results } = req.body;
console.log("Selected Exam ID:", selectedExam); 
    console.log("Results to upload:", results);
    // Validate input
    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Results array is required and cannot be empty"
      });
    }

    // Validate each result entry
    for (const result of results) {
      if (!result.rollNumber || result.marksObtained === undefined || result.marksObtained === null) {
        return res.status(400).json({
          success: false,
          message: "Each result must have rollNumber and marksObtained"
        });
      }
      
      if (typeof result.marksObtained !== 'number' || result.marksObtained < 0) {
        return res.status(400).json({
          success: false,
          message: "marksObtained must be a non-negative number"
        });
      }
    }

    // Find the exam
    const exam = await Exam.findById( selectedExam );
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    // Process each result
    const updatedResults = [];
    const newResults = [];

    for (const newResult of results) {
      // Determine pass/fail status
      const status = newResult.marksObtained >= exam.passingMarks ? "Passed" : "Failed";
      
      // Check if result already exists for this roll number
      const existingResultIndex = exam.results.findIndex(
        result => result.rollNumber === newResult.rollNumber
      );

      if (existingResultIndex !== -1) {
        // Update existing result
        exam.results[existingResultIndex].marksObtained = newResult.marksObtained;
        exam.results[existingResultIndex].status = status;
        exam.results[existingResultIndex].createdAt = new Date();
        updatedResults.push(newResult.rollNumber);
      } else {
        // Add new result
        exam.results.push({
          rollNumber: newResult.rollNumber,
          marksObtained: newResult.marksObtained,
          status: status,
          createdAt: new Date()
        });
        newResults.push(newResult.rollNumber);
      }
    }

    // Save the updated exam
    await exam.save();

    res.status(200).json({
      success: true,
      message: "Marks uploaded successfully",
      data: {
        examId: exam.ExamID,
        totalResultsProcessed: results.length,
        newResults: newResults.length,
        updatedResults: updatedResults.length,
        newResultsRollNumbers: newResults,
        updatedResultsRollNumbers: updatedResults
      }
    });

  } catch (error) {
    console.error("Error uploading marks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
export const updateExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const updateData = req.body;
    console.log("Update Data from frontend:", updateData);

    // Updated required fields to include examStartTime and examEndTime
    const requiredFields = [
      "ExamID",
      "courseCode",
      "batch", 
      "examDate",
      "examType",
      "examStartTime",  // Added
      "examEndTime",    // Added
      "examDurationMinutes",
      "totalQuestions",
      "totalMarks",
      "passingMarks", 
      "examMode",
    ];

    // Check for missing required fields
    for (const field of requiredFields) {
      if (!updateData[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    // Validate exam type
    const validExamTypes = ["Weekly Test", "Monthly Test", "Final Test"];
    if (!validExamTypes.includes(updateData.examType)) {
      return res.status(400).json({ message: "Invalid exam type" });
    }

    // Validate exam mode
    if (!["Online", "Offline"].includes(updateData.examMode)) {
      return res.status(400).json({ message: "Invalid exam mode" });
    }

    // Validate batch data
    if (
      !updateData.batch ||
      !updateData.batch.timings ||
      !updateData.batch.name ||
      !updateData.batch.id
    ) {
      return res.status(400).json({ message: "Invalid batch data" });
    }

    // Validate numeric fields
    if (
      isNaN(updateData.examDurationMinutes) ||
      isNaN(updateData.totalQuestions) ||
      isNaN(updateData.totalMarks) ||
      isNaN(updateData.passingMarks)
    ) {
      return res.status(400).json({ message: "Numeric fields must be valid numbers" });
    }

    // Validate passing marks
    if (updateData.passingMarks > updateData.totalMarks) {
      return res.status(400).json({ message: "Passing marks cannot exceed total marks" });
    }

    // Validate time format (optional but recommended)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(updateData.examStartTime) || !timeRegex.test(updateData.examEndTime)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:MM format" });
    }

    // Build update object with all required fields
    const updateObject = {
      ExamID: updateData.ExamID,
      courseCode: updateData.courseCode,
      batch: {
        timings: updateData.batch.timings,
        name: updateData.batch.name,
        id: updateData.batch.id,
      },
      examDate: updateData.examDate,
      examType: updateData.examType,
      examStartTime: updateData.examStartTime,  // Added
      examEndTime: updateData.examEndTime,      // Added
      examDurationMinutes: parseInt(updateData.examDurationMinutes),
      totalQuestions: parseInt(updateData.totalQuestions),
      totalMarks: parseInt(updateData.totalMarks),
      passingMarks: parseInt(updateData.passingMarks),
      examMode: updateData.examMode,
    };

    // Add status if provided
    if (updateData.status) {
      updateObject.status = updateData.status;
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      updateObject,
      { new: true, runValidators: true }
    );


    if (!updatedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(updatedExam);
  } catch (error) {
    console.error("Error updating exam:", error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// // Alternative: Separate endpoints for online and offline exams
// export const getOnlineExams = asyncHandler(async (req, res) => {
//   try {
//     const { franchiseId } = req.query;
    
//     // Build filter object
//     let filter = { examMode: 'Online' };
//     if (franchiseId) {
//       filter.franchiseId = franchiseId;
//     }
    
//     const exams = await Exam.find(filter).limit(10);
//     const count = await Exam.countDocuments(filter);
    
//     res.status(200).json({
//       exams,
//       count,
//       mode: 'Online',
//       franchiseId: franchiseId || 'all'
//     });
//   } catch (error) {
//     console.error("Error fetching online exams:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// export const getOfflineExams = asyncHandler(async (req, res) => {
//   try {
//     const { franchiseId } = req.query;
    
//     // Build filter object
//     let filter = { examMode: 'Offline' };
//     if (franchiseId) {
//       filter.franchiseId = franchiseId;
//     }
    
//     const exams = await Exam.find(filter).limit(10);
//     const count = await Exam.countDocuments(filter);
    
//     res.status(200).json({
//       exams,
//       count,
//       mode: 'Offline',
//       franchiseId: franchiseId || 'all'
//     });
//   } catch (error) {
//     console.error("Error fetching offline exams:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // Get exam counts only
// export const getExamCounts = asyncHandler(async (req, res) => {
//   try {
//     const { franchiseId } = req.query;
    
//     // Build filter object
//     let filter = {};
//     if (franchiseId) {
//       filter.franchiseId = franchiseId;
//     }
    
//     const onlineCount = await Exam.countDocuments({ ...filter, examMode: 'Online' });
//     const offlineCount = await Exam.countDocuments({ ...filter, examMode: 'Offline' });
//     const totalCount = await Exam.countDocuments(filter);
    
//     res.status(200).json({
//       counts: {
//         online: onlineCount,
//         offline: offlineCount,
//         total: totalCount
//       },
//       franchiseId: franchiseId || 'all'
//     });
//   } catch (error) {
//     console.error("Error fetching exam counts:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });







