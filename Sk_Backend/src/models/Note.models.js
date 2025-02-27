import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  course: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String },
  date: { type: String, required: true },
  link: { type: String },
  file: { type: String },
});

export default mongoose.model("Note", noteSchema);

