import { useState, useEffect } from "react";
import { Search, Play, Video, Filter, X } from "lucide-react";
import API_BASE_URL from "../../config";

const Videos = ({ student }) => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingVideo, setPlayingVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseCode, setCourseCode] = useState("");

  const videosPerPage = 12;

  const storedStudent = localStorage.getItem("student");
  const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;

  // Helper function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };

  // Helper function to get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  useEffect(() => {
    const course = parsedStudent?.courseCode;
    if (!course) return;

    setCourseCode(course);
    setLoading(true);

    console.log(course);
    fetch(`${API_BASE_URL}/api/videos/${course}`)
      .then((res) => res.json())
      .then((data) => {
        // Extract course video links from the API response
        const courseVideoLinks = data?.courses?.courseVideoLinks || [];
        
        // Transform the data to include embed URLs and thumbnails
        const transformedVideos = courseVideoLinks.map(video => ({
          ...video,
          embedUrl: getYouTubeEmbedUrl(video.link),
          thumbnailUrl: getYouTubeThumbnail(video.link)
        }));
        
        setVideos(transformedVideos);
        setFilteredVideos(transformedVideos);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching videos:", err);
        setLoading(false);
      });
  }, [student]);

  useEffect(() => {
    const filtered = videos.filter((video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVideos(filtered);
    setCurrentPage(1);
  }, [searchQuery, videos]);

  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

  return (
    <div className="bg-gradient-to-br from-sky-50 to-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 mb-6 overflow-hidden">
          <div className="bg-sky-800 p-5 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <Video size={24} className="mr-3" />
                <h2 className="text-2xl font-bold">Course Videos</h2>
                {courseCode && (
                  <span className="ml-3 bg-sky-200 bg-opacity-30 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                    {courseCode}
                  </span>
                )}
              </div>
              
              {/* Search Bar */}
              <div className="mt-4 md:mt-0 relative">
                <div className="flex items-center bg-white bg-opacity-20 rounded-lg overflow-hidden">
                  <div className="absolute left-3 pointer-events-none">
                    <Search size={18} className="text-white" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 py-2 pl-10 pr-3 bg-transparent border border-blue-300 border-opacity-50 rounded-lg focus:ring-2 focus:ring-white focus:border-white placeholder-blue-200 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter Stats */}
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap items-center justify-between">
            <div className="flex items-center text-blue-800">
              <Filter size={16} className="mr-2" />
              <span className="text-sm">
                Showing {filteredVideos.length > 0 ? `${indexOfFirstVideo + 1}-${Math.min(indexOfLastVideo, filteredVideos.length)} of ` : ""}{filteredVideos.length} videos
              </span>
            </div>
            {searchQuery && (
              <div className="flex items-center mt-2 sm:mt-0">
                <span className="text-sm text-blue-600 mr-2">
                  Filter: "{searchQuery}"
                </span>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* No Videos State */}
        {!loading && filteredVideos.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-8 text-center">
            <div className="bg-blue-50 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
              <Video size={24} className="text-blue-400" />
            </div>
            <h3 className="mt-4 text-xl font-medium text-blue-800">No videos found</h3>
            <p className="mt-2 text-blue-600">
              {searchQuery
                ? "Try adjusting your search query."
                : "No course videos available yet."}
            </p>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && filteredVideos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentVideos.map((video) => (
                <div
                  key={video._id}
                  className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden transition-all hover:shadow-lg hover:translate-y-[-2px]"
                >
                  <div className="relative h-48 bg-gray-100">
                    {playingVideo === video._id ? (
                      <iframe
                        className="absolute w-full h-full rounded-t-xl"
                        src={video.embedUrl}
                        title={video.title}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      ></iframe>
                    ) : (
                      <div 
                        className="relative w-full h-full cursor-pointer group"
                        onClick={() => setPlayingVideo(video._id)}
                      >
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Fallback placeholder */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
                          style={{ display: video.thumbnailUrl ? 'none' : 'flex' }}
                        >
                          <Video size={32} className="text-white opacity-50" />
                        </div>
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white bg-opacity-90 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform">
                            <Play size={24} className="text-blue-600 ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-blue-900 line-clamp-2 mb-2">
                      {video.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Video Lesson
                      </span>
                      
                      {playingVideo !== video._id && (
                        <button
                          onClick={() => setPlayingVideo(video._id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          <Play size={14} className="mr-1" />
                          Play
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex rounded-lg shadow-sm">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-l-lg border ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        : "bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
                    }`}
                  >
                    Previous
                  </button>
                  <div className="px-4 py-2 bg-blue-500 text-white border-t border-b border-blue-500">
                    {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-r-lg border ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        : "bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Videos;