import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  rollNumber: String,
  studentName: String,
  fatherName: String,
  courseName: String,
  session: String,
  courseSubject: String,
  instituteName: String,
  instituteName: String,
  instituteEmail: String,           // ✅ Added
  institutePhone: String,           // ✅ Added
  studentPhoto: String,             // ✅ Added
  studentSignature: String,         // ✅ Added
  examDate: Date,          
  percentage: Number,
  grade: String,
  requestedStatus: { type: String, default: "not_requested" }, // not_requested, requested, approved
  isApproved: { type: Boolean, default: false },
  certificateId: { type: String, default: null } 
});

const courseSchema = new mongoose.Schema({
  courseCode: String,
  courseName: String,
  examId: String,
  results: [resultSchema],
});

const certificateSchema = new mongoose.Schema({
  franchiseId: { type: String, required: true },
  courses: [courseSchema],
  // isApproved: { type: Boolean, default: false },
  requestedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Certificate", certificateSchema);
