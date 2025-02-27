import express from "express.js"
import { createNote, getNotes } from "../controllers/notesControllers.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router(); 

// Routes
router.post("/", upload.single("file"), createNote);
router.get("/", getNotes);

export default router
