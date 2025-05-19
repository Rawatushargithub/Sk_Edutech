import Note from "../models/Note.models.js"
import { asyncHandler } from "../utils/asynchanlder.js";

// Create a new note
export const createNote = asyncHandler(async (req, res) => {
  try {
    const { course, title, content, date, link } = req.body;
    const file = req.file ? req.file.filename : "";

    const newNote = new Note({ course, title, content, date, link, file });
    await newNote.save();
    res.status(201).json({ message: "✅ Note added successfully" });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to add note" });
  }
})

// Get all notes
export const getNotes = asyncHandler(async (req, res) => {
  try {
    console.log("Get notes is working")
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to fetch notes" });
  }
})

