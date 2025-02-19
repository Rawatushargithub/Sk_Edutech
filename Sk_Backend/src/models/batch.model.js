import mongoose from "mongoose"; 

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  batchLimit: { type: Number, required: true },
  currentStudents: { type: Number, required: true },  // the remaining seats will be calculated at frontend side
  batchTiming: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Batch", batchSchema);
