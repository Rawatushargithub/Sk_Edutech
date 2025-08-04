import mongoose from "mongoose"; 

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  batchLimit: { type: Number, required: true },
  franchiseId: { // System Generated ID
            type: String,
            default: true, 
            // required: true, // Not required initially for applications
            // Allows multiple documents to have null/missing value
            // lowercase: true, // Removed lowercase constraint
        },
  currentStudents: { type: Number, required: true },  // the remaining seats will be calculated at frontend side
  batchTiming: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Batch", batchSchema);
