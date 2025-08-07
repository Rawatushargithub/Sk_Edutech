import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: {type: String, required:true},
    rollNumber: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    franchiseId: { type: String, required: true },
  },
  { timestamps: true }
);


export default mongoose.model("Feedback", feedbackSchema);
