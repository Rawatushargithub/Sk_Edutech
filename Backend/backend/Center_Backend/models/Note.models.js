import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  course: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String },
  date: { type: String, required: true },
  link: { type: String },
  file: { type: String },
  franchiseId: { // System Generated ID
            type: String,
            default: true,
            // required: true, // Not required initially for applications
            // Allows multiple documents to have null/missing value
            // lowercase: true, // Removed lowercase constraint
        },
});

// Prevent OverwriteModelError
export default mongoose.models.Note || mongoose.model("Note", noteSchema);

