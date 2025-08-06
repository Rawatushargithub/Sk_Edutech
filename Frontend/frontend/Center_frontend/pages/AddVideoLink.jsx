import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { MdVideoLibrary } from "react-icons/md";
import API_BASE_URL from "../../config"
const AddVideoLink = () => {
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState({
    selectedCourseId: "",
    title: "",
    link: "",
  });
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchActiveCourses = async () => {
      setLoadingCourses(true);
      try {
        const franchiseId = localStorage.getItem('franchiseID');
        const url = `${API_BASE_URL}/api/v1/institute_courses/getCourses?franchiseId=${franchiseId}`;

        const response = await fetch(url);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: 'Failed to fetch courses' }));
          throw new Error(errData.message || `Error ${response.status}`);
        }

        const fetchedCourses = await response.json();
        setCourses(fetchedCourses);
      } catch (err) {
        toast.error(`Failed to fetch courses: ${err.message}`);
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchActiveCourses();
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!videoData.selectedCourseId || !videoData.title.trim() || !videoData.link.trim()) {
      toast.error("Please select a course, and provide both a title and a valid YouTube link.");
      return;
    }
    // Basic YouTube link validation (can be improved)
    if (!videoData.link.includes("youtube.com/") && !videoData.link.includes("youtu.be/")) {
      toast.error("Please enter a valid YouTube video link.");
      return;
    }

    const franchiseId = localStorage.getItem("franchiseId");

    setIsSubmitting(true);
    const toastId = toast.loading('Adding video link...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/institute_courses/${videoData.selectedCourseId}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: videoData.title.trim(), link: videoData.link.trim(), franchiseId: franchiseId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Error: ${response.status}`);
      }
      toast.success(result.message || "Video link added successfully!", { id: toastId });
      setVideoData({ selectedCourseId: videoData.selectedCourseId, title: "", link: "" }); // Reset form but keep course
      // navigate("/institute/Videos"); // Or navigate to the video dashboard
    } catch (err) {
      toast.error(`Failed to add video link: ${err.message}`, { id: toastId });
      console.error("Failed to add video link:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500";
  const buttonBaseStyle = "px-6 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-slate-700 mb-6 text-center flex items-center justify-center gap-2">
            <MdVideoLibrary className="w-8 h-8" /> Add New Video Link
          </h1>
          <div className="bg-white p-8 shadow-xl rounded-lg space-y-6">
            <div>
              <label htmlFor="selectedCourseId" className="block text-sm font-medium text-gray-700 mb-1">Select Course *</label>
              <select
                id="selectedCourseId"
                name="selectedCourseId"
                className={inputStyle}
                value={videoData.selectedCourseId}
                onChange={handleInputChange}
                disabled={loadingCourses}
              >
                <option value="">-- Select Course --</option>
                {loadingCourses && <option value="" disabled>Loading courses...</option>}
                {!loadingCourses && courses.length === 0 && <option value="" disabled>No active & approved courses found.</option>}
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.courseName} ({course.courseCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Video Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className={inputStyle}
                value={videoData.title}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to Topic X"
              />
            </div>

            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">YouTube Video Link *</label>
              <input
                type="url"
                id="link"
                name="link"
                className={inputStyle}
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoData.link}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/institute/Videos")}
                className={`${buttonBaseStyle} bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-400`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={`${buttonBaseStyle} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 min-w-[120px]`}
                disabled={isSubmitting || loadingCourses}
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Save Video Link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddVideoLink;
