import { useState, useEffect } from "react";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary
const Videos = ({ student }) => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingVideo, setPlayingVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const videosPerPage = 12;

  useEffect(() => {
    const storedStudent = localStorage.getItem("student");
    const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;
    const course = student?.course || parsedStudent?.course;

    if (!course) return;

    setLoading(true);
    fetch(`${API_BASE_URL}/api/videos/${course}`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setFilteredVideos(data);
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
    <div className="p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Course Videos
            <span className="ml-2 text-lg text-blue-600 font-medium">
              {student?.course}
            </span>
          </h2>
          
          {/* Search Bar */}
          <div className="mt-4 md:mt-0 relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-3.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
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
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-700">No videos found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery
                ? "Try adjusting your search query."
                : "No videos available for your course yet."}
            </p>
          </div>
        )}

        {/* Video Grid */}
        {!loading && filteredVideos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {currentVideos.map((video) => (
                <div
                  key={video._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
                >
                  <div className="relative h-48">
                    {playingVideo === video._id ? (
                      <iframe
                        className="absolute w-full h-full"
                        src={video.embedUrl}
                        title={video.title}
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setPlayingVideo(video._id)}
                      />
                    )}
                    {!playingVideo === video._id && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all cursor-pointer"
                        onClick={() => setPlayingVideo(video._id)}
                      >
                        <div className="bg-blue-600 rounded-full p-3 shadow-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {video.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-l-md border border-gray-300 ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <div className="px-4 py-2 bg-white border-t border-b border-gray-300">
                    {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-r-md border border-gray-300 ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
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