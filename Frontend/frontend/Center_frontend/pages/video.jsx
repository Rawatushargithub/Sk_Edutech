import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; // Not using axios for fetch
import { toast, ToastContainer } from "react-toastify"; // Using react-hot-toast instead of react-toastify
import "react-toastify/dist/ReactToastify.css"; // Keep for now if styles are used, but prefer react-hot-toast styling
import toastHot from 'react-hot-toast'; // Renamed to avoid conflict if ToastContainer from react-toastify is used
import { Toaster as HotToaster } from 'react-hot-toast';
import Select from 'react-select';
import API_BASE_URL from "../../config";


import { MdDelete, MdVideoLibrary, MdEdit } from "react-icons/md";
import { PlusCircle, Search } from "lucide-react";
console.log("video.jsx is working")
 
const UploadCourseVideo1 = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]); // For dropdown
  const [selectedCourseId, setSelectedCourseId] = useState("ALL"); // Default to 'ALL'
  const [videosToDisplay, setVideosToDisplay] = useState([]); // Videos from selected course's courseVideoLinks
  const [searchTerm, setSearchTerm] = useState("");
  
  // const [newVideo, setNewVideo] = useState({ course: "", title: "", link: "" }); // Removed, adding videos via CourseForm or dedicated page
  // const [thumbnailPreview, setThumbnailPreview] = useState(null); // Removed
  
  const [playingVideoLink, setPlayingVideoLink] = useState(null); // Store the link of the video being played
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const videosPerPage = 12;

  // const courses = ["BCA", "MBA", "B.Tech", "M.Tech", "B.Sc"]; // Replaced by dynamic fetch

  useEffect(() => {

  const fetchCoursesForFilter = async () => {
    setLoadingCourses(true);
    try {
      const franchiseId = localStorage.getItem('franchiseID'); // Retrieve franchiseId
      // console.log("Fetching courses for franchiseId:", franchiseId);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_courses/getCourses?franchiseId=${franchiseId}`
      );

      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();

      const activeApprovedCourses = data.filter(
        c => c.instituteStatus === 'active' && c.adminApprovalStatus === 'approved'
      );
      // console.log("Fetched courses ", data);
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
    setLoadingVideos(true);
    if (selectedCourseId === 'ALL') {
      const aggregated = allCourses.flatMap(c => c.courseVideoLinks || []);
      setVideosToDisplay(aggregated);
      setLoadingVideos(false);
      setPlayingVideoLink(null);
      setCurrentPage(1);
      return;
    }

    if (selectedCourseId) {
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
      setLoadingVideos(false);
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

  // Delete video function
  const handleDeleteVideo = async (videoId, videoTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${videoTitle}"?`)) {
      return;
    }

    setDeletingVideoId(videoId);
    try {
      const franchiseId = localStorage.getItem('franchiseID');
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_courses/${selectedCourseId}/videos/${videoId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ franchiseId })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete video');
      }

      const data = await response.json();
      toastHot.success('Video deleted successfully!');
      
      // Update the videos display by refreshing the course data
      const course = allCourses.find(c => c._id === selectedCourseId);
      if (course && data.course) {
        // Update the course in allCourses with the new video links
        const updatedCourses = allCourses.map(c => 
          c._id === selectedCourseId ? { ...c, courseVideoLinks: data.course.courseVideoLinks } : c
        );
        setAllCourses(updatedCourses);
        setVideosToDisplay(data.course.courseVideoLinks);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toastHot.error(`Error deleting video: ${error.message}`);
    } finally {
      setDeletingVideoId(null);
    }
  };

  // Filter videos by search term
  const filteredVideos = videosToDisplay.filter(video =>
    video.title && video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideosToDisplay = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

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

        {/* Filters */}
        <div className="mb-6 p-4 bg-white shadow-md rounded-lg flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-grow w-full sm:w-auto">
            <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
            <Select
              id="courseFilter"
              options={[{ value: 'ALL', label: 'All Courses' }, ...allCourses.map(course => ({
                value: course._id,
                label: `${course.courseName} (${course.courseCode})`
              }))]}
              value={[{ value: 'ALL', label: 'All Courses' }, ...allCourses.map(course => ({
                value: course._id,
                label: `${course.courseName} (${course.courseCode})`
              }))].find(option => option.value === selectedCourseId)}
              onChange={selectedOption => setSelectedCourseId(selectedOption ? selectedOption.value : "ALL")}
              isLoading={loadingCourses}
              isClearable
              isSearchable
              placeholder="-- Select or search for a Course --"
              className="w-full"
              classNamePrefix="select"
            />
          </div>
          <div className="flex-grow w-full sm:w-auto">
            <label htmlFor="videoSearch" className="block text-sm font-medium text-gray-700 mb-1">Search Videos</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="videoSearch"
                type="text"
                placeholder="Search by video title..."
                className={`${inputStyle} pl-10`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loadingCourses}
              />
            </div>
          </div>
        </div>

        {/* Video List */}
        {loadingVideos && <p className="text-center text-gray-500 py-8">Loading videos...</p>}
        {!loadingVideos && videosToDisplay.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow p-6">
              <MdVideoLibrary size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No videos found.</p>
              <p className="text-sm text-gray-400 mt-2">You can add videos by editing the course.</p>
            </div>
        )}
        {!loadingVideos && videosToDisplay.length > 0 && filteredVideos.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow p-6">
              <MdVideoLibrary size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No videos found matching your search.</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search term or clear the search to see all videos.</p>
            </div>
        )}

        {!loadingVideos && filteredVideos.length > 0 && (
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
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(video._id, video.title);
                          }}
                          disabled={deletingVideoId === video._id || selectedCourseId === 'ALL'}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={selectedCourseId === 'ALL' ? 'Select a specific course to delete videos' : 'Delete Video'}
                        >
                          {deletingVideoId === video._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <MdDelete size={18} />
                          )}
                        </button>
                      </div>
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
