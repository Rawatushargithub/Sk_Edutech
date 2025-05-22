import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
  ExamID: { type: String, required: true }, // course name + batch + date
  courseCode: { type: String, required: true },
  batch: { type: String, required: true }
  , // Array of batches
  examDate: { type: String, required: true },
  
  examDurationMinutes: { type: Number, required: true }, // New field
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  examMode: { type: String, required: true }, // Online or Offline
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now },

  results: [
    {
      rollNumber: { type: String, required: true },
      marksObtained: { type: Number, required: true },
      status: { type: String, default: "Pending" }, // Pending, Passed, Failed
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

export default mongoose.model("Exam", ExamSchema);
