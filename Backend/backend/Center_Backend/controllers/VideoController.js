import Video from "../models/Video.js";

// @desc    Fetch all videos
// @route   GET /api/videos
// @access  Public
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Add a new video
// @route   POST /api/videos
// @access  Public
export const addVideo = async (req, res) => {
  const { course, title, link, videoId, embedUrl, thumbnailUrl } = req.body;

  if (!course || !title || !link) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newVideo = new Video({
      course,
      title,
      link,
      videoId,
      embedUrl,
      thumbnailUrl,
    });

    const savedVideo = await newVideo.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(500).json({ message: "Error saving video" });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Public
export const deleteVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    console.log("🔹 Attempting to delete video with ID:", videoId); // Log incoming ID

    if (!videoId) {
      console.error("❌ Invalid video ID received:", videoId);
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      console.error("❌ Video not found in database with ID:", videoId);
      return res.status(404).json({ message: "Video not found" });
    }

    await video.deleteOne();
    console.log("✅ Video deleted successfully:", videoId);
    
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting video:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

