import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; // Not using axios for fetch
import { toast, ToastContainer } from "react-toastify"; // Using react-hot-toast instead of react-toastify
import "react-toastify/dist/ReactToastify.css"; // Keep for now if styles are used, but prefer react-hot-toast styling
import toastHot from 'react-hot-toast'; // Renamed to avoid conflict if ToastContainer from react-toastify is used
import { Toaster as HotToaster } from 'react-hot-toast';
import API_BASE_URL from "../../config";


import { MdDelete, MdVideoLibrary, MdEdit } from "react-icons/md";
import { PlusCircle } from "lucide-react";


const UploadCourseVideo1 = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]); // For dropdown
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [videosToDisplay, setVideosToDisplay] = useState([]); // Videos from selected course's courseVideoLinks
  
  // const [newVideo, setNewVideo] = useState({ course: "", title: "", link: "" }); // Removed, adding videos via CourseForm or dedicated page
  // const [thumbnailPreview, setThumbnailPreview] = useState(null); // Removed
  
  const [playingVideoLink, setPlayingVideoLink] = useState(null); // Store the link of the video being played
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const videosPerPage = 12;

  // const courses = ["BCA", "MBA", "B.Tech", "M.Tech", "B.Sc"]; // Replaced by dynamic fetch

  useEffect(() => {
    const fetchCoursesForFilter = async () => {
      setLoadingCourses(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/institute_courses/getCourses`);
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        const activeApprovedCourses = data.filter(
          c => c.instituteStatus === 'active' && c.adminApprovalStatus === 'approved'
        );
        console.log("Fetched courses ", data);
        setAllCourses(activeApprovedCourses);
      } catch (error) {
        toastHot.error(`Error fetching courses: ${error.message}`);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCoursesForFilter();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      setLoadingVideos(true);
      const course = allCourses.find(c => c._id === selectedCourseId);
      if (course && course.courseVideoLinks) {
        setVideosToDisplay(course.courseVideoLinks);
      } else {
        setVideosToDisplay([]);
      }
      setLoadingVideos(false);
      setPlayingVideoLink(null); // Reset playing video when course changes
      setCurrentPage(1); // Reset pagination
    } else {
      setVideosToDisplay([]);
    }
  }, [selectedCourseId, allCourses]);


  const extractYoutubeVideoId = (url) => {
    if (!url) return null; // Return null if URL is empty or undefined
    let videoId = null;
    try {
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
      } else if (url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get("v");
      } else if (url.includes("youtube.com/embed/")) {
        videoId = url.split("youtube.com/embed/")[1]?.split("?")[0];
      }
    } catch (e) {
      console.error("Error parsing YouTube URL:", e);
      return null;
    }
    return videoId;
  };

  // handleDeleteVideo is removed as video management is now part of CourseForm

  // Pagination Logic
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideosToDisplay = videosToDisplay.slice(indexOfFirstVideo, indexOfLastVideo);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(videosToDisplay.length / videosPerPage);

  const inputStyle = "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500";
  const buttonBaseStyle = "px-6 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";


  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-100">
      <HotToaster position="top-right" /> {/* For react-hot-toast */}
      {/* <ToastContainer /> Use this if react-toastify is still needed for other parts */}
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-700 flex items-center gap-3"><MdVideoLibrary className="w-8 h-8"/> Course Videos</h1>
            <button
              onClick={() => navigate('/institute/AddVideoLink')} 
              className={`${buttonBaseStyle} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 flex items-center`}
            >
              <PlusCircle size={20} className="mr-2" /> Add New Video Link
            </button>
        </div>

        {/* Course Filter */}
        <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
          <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700 mb-1">Select Course to View Videos</label>
          <select
            id="courseFilter"
            className={inputStyle}
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={loadingCourses}
          >
            <option value="">-- Select a Course --</option>
            {loadingCourses && <option disabled>Loading courses...</option>}
            {allCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseName} ({course.courseCode})
              </option>
            ))}
          </select>
        </div>

        {/* Video List */}
        {loadingVideos && <p className="text-center text-gray-500 py-8">Loading videos...</p>}
        {!loadingVideos && !selectedCourseId && (
            <div className="text-center py-10 bg-white rounded-lg shadow p-6">
              <MdVideoLibrary size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Please select a course to view its videos.</p>
            </div>
        )}
        {!loadingVideos && selectedCourseId && videosToDisplay.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow p-6">
              <MdVideoLibrary size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No videos found for this course.</p>
              <p className="text-sm text-gray-400 mt-2">You can add videos by editing the course.</p>
            </div>
        )}

        {!loadingVideos && selectedCourseId && videosToDisplay.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentVideosToDisplay.map((video, index) => {
                const videoId = extractYoutubeVideoId(video.link);
                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : 'https://via.placeholder.com/320x180.png?text=Video'; // Fallback thumbnail
                const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;

                return (
                  <div key={video._id || video.id || index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                    <div className="relative aspect-video cursor-pointer" onClick={() => videoId && setPlayingVideoLink(video.link)}>
                      {playingVideoLink === video.link && embedUrl ? (
                        <iframe className="w-full h-full" src={embedUrl} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                      ) : (
                        <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-md font-semibold text-slate-800 mb-1 truncate" title={video.title}>{video.title || 'Untitled Video'}</h3>
                        {/* <p className="text-xs text-gray-500">Course: {allCourses.find(c=>c._id === selectedCourseId)?.courseName}</p> */}
                      </div>
                       {/* Edit/Delete buttons removed - manage via CourseForm */}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={`${buttonBaseStyle} bg-slate-500 text-white hover:bg-slate-600 disabled:bg-gray-300`}>Previous</button>
                {[...Array(totalPages).keys()].map(number => (
                  <button key={number + 1} onClick={() => paginate(number + 1)} className={`${buttonBaseStyle} ${currentPage === number + 1 ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    {number + 1}
                  </button>
                ))}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={`${buttonBaseStyle} bg-slate-500 text-white hover:bg-slate-600 disabled:bg-gray-300`}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UploadCourseVideo1;
