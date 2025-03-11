import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  course: { type: String, required: true },
  title: { type: String, required: true },
  link: { type: String, required: true },
  videoId: { type: String, required: true },
  embedUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
}, { timestamps: true });

const Video = mongoose.model("Video", videoSchema);

export default Video;
