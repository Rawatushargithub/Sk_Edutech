import Exam from "../models/Exam.models.js"
import { asyncHandler } from "../utils/asynchanlder.js";

export const createExam = asyncHandler(async (req, res) => {
  try {
    const {
      courseCode,
      batch,
      examDate,
      examTime,  // HH:MM format
      examDurationMinutes, // New field
      totalQuestions,
      passingMarks,
      modeOnline,
      modeOffline,
      displayResult,
      status,
    } = req.body;

    // Validate that both time fields are provided
    if (!examTime || !examDurationMinutes) {
      return res.status(400).json({ message: "Exam time and duration are required" });
    }

    const newExam = new Exam({
      courseCode,
      batch,
      examDate,
      examTime,
      examDurationMinutes, // Save minutes separately
      totalQuestions,
      passingMarks,
      modeOnline,
      modeOffline,
      displayResult,
      status,
    });

    await newExam.save();
    res.status(201).json({ message: "Exam added successfully", exam: newExam });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
})

// Fetch all exams
export const getAllExams = asyncHandler(async (req, res) => {
  try {
    const exams = await Exam.find();
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

export const updateExamStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting "Active", "Completed", etc.

    // Ensure the ID exists before updating
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    exam.status = status;
    await exam.save();

    res.status(200).json({ message: "Exam status updated", exam });
  } catch (error) {
    res.status(500).json({ message: "Failed to update exam status", error });
  }
})
