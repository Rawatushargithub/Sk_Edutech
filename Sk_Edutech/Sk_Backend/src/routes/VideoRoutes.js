import express from "express";
import { getVideos, addVideo, deleteVideo } from "../controllers/VideoController.js";

const router = express.Router();

router.get("/", getVideos); // Fetch all videos
router.post("/", addVideo); // Add a new video
router.delete("/:id", deleteVideo); // Delete a video

export default router;
