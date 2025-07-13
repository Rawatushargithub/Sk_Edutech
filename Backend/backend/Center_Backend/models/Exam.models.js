import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
  ExamID: { type: String, required: true }, // course name + batch + date
  courseCode: { type: String, required: true },
  batch: {
    timings: { type: String, required: true },
    name: { type: String, required: true },
    id: { type: String, required: true },
  },
  examDate: { type: String, required: true },
  franchiseId: { // System Generated ID
            type: String, 
            default: true
        },
  examDurationMinutes: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  examMode: { type: String, required: true }, // Online or Offline
  questions: [{ type: Number }], // Array of qNo (question numbers) for online exams
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
