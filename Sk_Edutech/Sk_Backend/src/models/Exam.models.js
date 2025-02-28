import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  batch: { type: String, required: true },
  examDate: { type: String, required: true },
  examTime: { type: String, required: true },  // HH:MM format
  examDurationMinutes: { type: Number, required: true }, // New field
  totalQuestions: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  modeOnline: { type: Boolean, default: true },
  modeOffline: { type: Boolean, default: true },
  displayResult: { type: String, default: "Yes" },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Exam", ExamSchema);
