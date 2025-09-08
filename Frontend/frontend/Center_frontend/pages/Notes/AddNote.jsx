import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import API_BASE_URL from "../../../config";

const AddNote = () => {
  const navigate = useNavigate();
  const [noteData, setNoteData] = useState({
    selectedCourseId: "",
    title: "",
    type: "link", // 'file' or 'link'
    url: "",    // For link type
    file: null, // For file type
  });
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchActiveCourses = async () => {
      setLoadingCourses(true);
      try {
        const franchiseId = localStorage.getItem('franchiseID');
        if (!franchiseId) throw new Error('Franchise ID not found in localStorage');

        // Fetch both institute and admin courses in parallel
        const [instituteResponse, adminResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/institute_courses/getCourses?franchiseId=${franchiseId}`),
          fetch(`${API_BASE_URL}/api/v1/admin/courses/admin-courses`).catch(() => null)
        ]);

        if (!instituteResponse.ok) {
          const errData = await instituteResponse.json().catch(() => ({ message: 'Failed to fetch institute courses' }));
          throw new Error(errData.message || `Error ${instituteResponse.status}`);
        }

        const instituteCourses = await instituteResponse.json();
        let adminCourses = [];

        // Handle admin courses response
        if (adminResponse && adminResponse.ok) {
          try {
            adminCourses = await adminResponse.json(); 
            // Mark admin courses for identification
            adminCourses = adminCourses.data.map(course => ({
              ...course,
              byAdmin: true,
              franchiseId: "Admin"
            }));
          } catch (error) {
            console.warn('Failed to parse admin courses:', error);
          }
        }

        console.log("Fetched institute courses ", instituteCourses);
        console.log("Fetched admin courses ", adminCourses);

        const activeApprovedInstituteCourses = instituteCourses.filter(
          c => c.instituteStatus === 'active' && c.adminApprovalStatus === 'approved'
        );
        console.log("Active approved institute courses ", activeApprovedInstituteCourses);

        // Combine both course types
        const allCourses = [...activeApprovedInstituteCourses, ...adminCourses];
        setCourses(allCourses);
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
    const { name, value, type, files } = e.target;
    if (name === "type") {
      setNoteData(prev => ({ ...prev, type: value, file: null, url: "" }));
    } else if (type === "file") {
      setNoteData(prev => ({ ...prev, file: files[0] }));
    } else {
      setNoteData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!noteData.selectedCourseId) {
      toast.error("Please select a course.");
      return;
    }
    if (!noteData.title.trim()) {
      toast.error("Please provide a title for the note.");
      return;
    }
    if (noteData.type === 'link' && !noteData.url.trim()) {
      toast.error("Please provide a URL for the link type note.");
      return;
    }
    if (noteData.type === 'file' && !noteData.file) {
      toast.error("Please select a file to upload.");
      return;
    }

    const franchiseId = localStorage.getItem("franchiseId");
    const selectedCourse = courses.find(c => c._id === noteData.selectedCourseId);
    const isAdminCourse = selectedCourse && (selectedCourse.byAdmin === true || selectedCourse.franchiseId === "Admin");

    setIsSubmitting(true);
    const toastId = toast.loading('Adding note...');
    const formDataToSend = new FormData();
    formDataToSend.append("title", noteData.title.trim());
    formDataToSend.append("type", noteData.type);

    if (noteData.type === "link") {
      formDataToSend.append("url", noteData.url.trim());
    } else if (noteData.type === "file" && noteData.file) {
      formDataToSend.append("noteFile", noteData.file);
    }

    formDataToSend.append("franchiseId", franchiseId);

    try {
      // Use different endpoints for admin vs institute courses
      const endpoint = isAdminCourse 
        ? `${API_BASE_URL}/api/v1/institute_courses/${noteData.selectedCourseId}/notes`
        : `${API_BASE_URL}/api/v1/institute_courses/${noteData.selectedCourseId}/notes`; 

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Error: ${response.status}`);
      }
      toast.success(result.message || "Note added successfully!", { id: toastId });
      // Optionally navigate or reset form
      // navigate("/institute/Notes"); 
      setNoteData({ selectedCourseId: noteData.selectedCourseId, title: "", type: "link", url: "", file: null });
    } catch (err) {
      toast.error(`Failed to add note: ${err.message}`, { id: toastId });
      console.error("Failed to add note:", err);
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
          <h1 className="text-3xl font-bold text-slate-700 mb-6 text-center">📝 Add New Note/Material</h1>
          <div className="bg-white p-8 shadow-xl rounded-lg space-y-6">
            <div>
              <label htmlFor="selectedCourseId" className="block text-sm font-medium text-gray-700 mb-1">Select Course *</label>
              <select
                id="selectedCourseId"
                name="selectedCourseId"
                className={inputStyle}
                value={noteData.selectedCourseId}
                onChange={handleInputChange}
                disabled={loadingCourses}
              >
                <option value="">-- Select Course --</option>
                {loadingCourses && <option value="" disabled>Loading courses...</option>}
                {!loadingCourses && courses.length === 0 && <option value="" disabled>No active & approved courses found.</option>}
                {courses.map((course) => {
                  const isAdminCourse = course.byAdmin === true || course.franchiseId === "Admin";
                  return (
                    <option 
                      key={course._id} 
                      value={course._id}
                      style={isAdminCourse ? { backgroundColor: '#f3f4f6', color: '#7c3aed', fontWeight: '600' } : {}}
                    >
                      {course.courseName} ({course.courseCode}) {isAdminCourse ? '[Admin]' : ''}
                    </option>
                  );
                })}
              </select>
              {noteData.selectedCourseId && courses.find(c => c._id === noteData.selectedCourseId)?.byAdmin && (
                <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-md">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Admin Course
                    </span>
                    <span className="ml-2 text-sm text-purple-700">
                      This is an admin-managed course
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Note Title / Description *</label>
              <input
                type="text"
                id="title"
                name="title"
                className={inputStyle}
                value={noteData.title}
                onChange={handleInputChange}
                placeholder="e.g., Chapter 1 Notes, Important Formulas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Type *</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  className={`${buttonBaseStyle} flex-1 ${noteData.type === "link" ? "bg-slate-600 text-white focus:ring-slate-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"}`}
                  onClick={() => handleInputChange({ target: { name: "type", value: "link" } })}
                >
                  External Link (e.g., Google Drive)
                </button>
                <button
                  type="button"
                  className={`${buttonBaseStyle} flex-1 ${noteData.type === "file" ? "bg-slate-600 text-white focus:ring-slate-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"}`}
                  onClick={() => handleInputChange({ target: { name: "type", value: "file" } })}
                >
                  Upload File
                </button>
              </div>
            </div>

            {noteData.type === "link" && (
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">Note URL *</label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  className={inputStyle}
                  placeholder="https://example.com/your-note-link"
                  value={noteData.url}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {noteData.type === "file" && (
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Upload File *</label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 ${inputStyle}`}
                  onChange={handleInputChange}
                />
                {noteData.file && <p className="text-xs text-green-600 mt-1">Selected: {noteData.file.name}</p>}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/institute/Notes")}
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
                ) : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNote;
