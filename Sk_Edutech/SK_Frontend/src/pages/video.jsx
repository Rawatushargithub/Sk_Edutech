import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdDelete } from "react-icons/md";
import { MdVideoLibrary } from "react-icons/md";

const API_URL = "http://localhost:8000/api/videos"; 

const UploadCourseVideo1 = () => {
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({ course: "", title: "", link: "" });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 12;

  const courses = ["BCA", "MBA", "B.Tech", "M.Tech", "B.Sc"];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setVideos(data);
    } catch (error) {
      toast.error("Error fetching videos", { position: "top-right" });
    }
  };

  const extractYoutubeVideoId = (url) => {
    if (!url) return "";
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1]?.split("?")[0];
    if (url.includes("youtube.com/watch")) return new URLSearchParams(url.split("?")[1]).get("v");
    if (url.includes("youtube.com/embed/")) return url.split("youtube.com/embed/")[1]?.split("?")[0];
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVideo({ ...newVideo, [name]: value });

    if (name === "link") {
      const videoId = extractYoutubeVideoId(value);
      setThumbnailPreview(videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);
    }
  };

  const handleSaveVideo = async () => {
    if (!newVideo.course || !newVideo.title || !newVideo.link) {
      toast.warning("All fields are mandatory!", { position: "top-right" });
      return;
    }

    const videoId = extractYoutubeVideoId(newVideo.link);
    if (!videoId) {
      toast.error("Invalid YouTube link!", { position: "top-right" });
      return;
    }

    const videoData = {
      course: newVideo.course,
      title: newVideo.title,
      link: newVideo.link,
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    };

    try {
      const { data } = await axios.post(API_URL, videoData);
      setVideos([...videos, data]);
      setNewVideo({ course: "", title: "", link: "" });
      setThumbnailPreview(null);
      toast.success("Video added successfully!", { position: "top-right" });
    } catch (error) {
      toast.error("Error saving video", { position: "top-right" });
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setVideos(videos.filter((video) => video._id !== id));
      toast.success("Video deleted successfully!", { position: "top-right" });
    } catch (error) {
      toast.error("Error deleting video", { position: "top-right" });
    }
  };

  // Pagination Logic
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

  const nextPage = () => {
    if (indexOfLastVideo < videos.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-3 "><MdVideoLibrary className="w-8 h-8"/> Upload Video</h1>
      <ToastContainer />

      {/* Video Upload Form */}
      <div className="bg-white p-6 shadow-md rounded mb-6">
        <label className="block text-gray-700">Select Course</label>
        <select
          name="course"
          className="w-full p-2 border rounded mb-3"
          value={newVideo.course}
          onChange={handleInputChange}
        >
          <option value="">-- Select Course --</option>
          {courses.map((course) => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>

        <label className="block text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          className="w-full p-2 border rounded mb-3"
          value={newVideo.title}
          onChange={handleInputChange}
        />

        <label className="block text-gray-700">YouTube Video Link</label>
        <input
          type="text"
          name="link"
          className="w-full p-2 border rounded mb-3"
          placeholder="Paste YouTube link here..."
          value={newVideo.link}
          onChange={handleInputChange}
        />

        {/* Thumbnail Preview */}
        {thumbnailPreview && (
          <img src={thumbnailPreview} alt="Video Thumbnail" className="w-full h-72 object-contain rounded mb-3" />
        )}

        <button onClick={handleSaveVideo} className="bg-gray-700 text-white px-4 py-2 rounded w-full">
          Save Video
        </button>
      </div>

      {/* Video List with Thumbnails */}
      <h1 className="flex items-center p-3 gap-3 text-2xl font-bold">
          <MdVideoLibrary className="h-7 w-7" /> Uploaded Videos
        </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 space-y-3">
        
        {currentVideos.map((video) => (
          <div key={video._id} className="p-1  rounded shadow-md bg-white relative">
            {playingVideo === video._id ? (
              <iframe className="w-full h-44 rounded" src={video.embedUrl} frameBorder="0" allowFullScreen></iframe>
            ) : (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-44 object-cover rounded cursor-pointer"
                onClick={() => setPlayingVideo(video._id)}
              />
            )}
            <div className="flex justify-between items-center mt-2 p-2">
              <div>
                <h3 className="text-sm font-bold text-gray-800">{video.title}</h3>
                <p className="text-xs text-gray-500">Course: {video.course}</p>
              </div>
              <button onClick={() => handleDeleteVideo(video._id)} className="text-gray-700 text-xl ">
                <MdDelete />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Centered Pagination */}
      {videos.length > videosPerPage && (
        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-4 py-2">{Page `${currentPage} of ${Math.ceil(videos.length / videosPerPage)}`}</span>
          <button
            onClick={nextPage}
            disabled={indexOfLastVideo >= videos.length}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadCourseVideo1;