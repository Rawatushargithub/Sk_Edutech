import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { FileText, Link as LinkIcon, Search, PlusCircle, Edit3 } from 'lucide-react';
import API_BASE_URL from "../../../config";

const NotesDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [allCourses, setAllCourses] = useState([]); // To populate dropdown
  const [notesToDisplay, setNotesToDisplay] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Fetch active and approved courses for the filter dropdown
  useEffect(() => {
    const fetchCoursesForFilter = async () => {
      setLoadingCourses(true);
      try {

        const franchiseId = localStorage.getItem('franchiseID');
        // console.log("Fetching courses for franchiseId:", franchiseId);
        const url = `${API_BASE_URL}/api/v1/institute_courses/getCourses?franchiseId=${franchiseId}`;

        const response = await fetch(url);

        if (!response.ok) throw new Error('Failed to fetch courses for filter');

        const data = await response.json();
        console.log("Fetched courses ", data);

        const activeApprovedCourses = data.filter(
          c => c.instituteStatus === 'active' && c.adminApprovalStatus === 'approved'
        );
        setAllCourses(activeApprovedCourses);
      } catch (error) {
        toast.error(`Error fetching courses: ${error.message}`);
        console.error("Error fetching courses for filter:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCoursesForFilter();
  }, []);


  // Fetch notes for the selected course
  useEffect(() => {
    console.log("Selected Course ID changed:", selectedCourseId);
    if (selectedCourseId) {
      setLoadingNotes(true);
      setNotesToDisplay([]);
      const course = allCourses.find(c => c._id === selectedCourseId);
      console.log("Found course for notes:", course);
      if (course && course.courseMaterials) {
        console.log("Course materials found:", course.courseMaterials);
        setNotesToDisplay(course.courseMaterials);
      } else if (course) {
        console.log("Course found, but no courseMaterials array or it's empty.");
        setNotesToDisplay([]);
      } else {
        console.warn("Selected course not found in pre-fetched list. ID:", selectedCourseId, "All Courses:", allCourses);
      }
      setLoadingNotes(false);
    } else {
      setNotesToDisplay([]);
    }
  }, [selectedCourseId, allCourses]);

  const filteredNotes = notesToDisplay.filter(note =>
    (note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (note.fileName && note.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log("Notes to display (pre-filter):", notesToDisplay);
  console.log("Filtered notes (post-search):", filteredNotes);

  const getFileIcon = (fileType) => {
    if (!fileType) return <FileText className="w-8 h-8 text-gray-500" />;
    if (fileType.startsWith('image/')) return <FileText className="w-8 h-8 text-blue-500" />; // Placeholder, could use specific image icon
    if (fileType === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
    if (fileType.includes('word')) return <FileText className="w-8 h-8 text-blue-700" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const inputStyle = "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500";
  const buttonBaseStyle = "px-6 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";


  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen p-4 sm:p-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-700">📚 Course Notes & Materials</h1>
            <button
              onClick={() => navigate('/institute/AddNote')}
              className={`${buttonBaseStyle} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 flex items-center`}
            >
              <PlusCircle size={20} className="mr-2" /> Add New Note
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-white shadow-md rounded-lg flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-grow w-full sm:w-auto">
              <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
              <select
                id="courseFilter"
                className={inputStyle}
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={loadingCourses}
              >
                <option value="">-- Select a Course to View Notes --</option>
                {loadingCourses && <option disabled>Loading courses...</option>}
                {allCourses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-grow w-full sm:w-auto">
              <label htmlFor="noteSearch" className="block text-sm font-medium text-gray-700 mb-1">Search Notes</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="noteSearch"
                  type="text"
                  placeholder="Search by title or filename..."
                  className={`${inputStyle} pl-10`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!selectedCourseId}
                />
              </div>
            </div>
          </div>

          {/* Notes Display Area */}
          {loadingNotes && <p className="text-center text-gray-500 py-8">Loading notes...</p>}
          {!loadingNotes && !selectedCourseId && (
            <div className="text-center py-10 bg-white rounded-lg shadow p-6">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Please select a course to view its notes and materials.</p>
            </div>
          )}
          {!loadingNotes && selectedCourseId && filteredNotes.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow p-6">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No notes found for this course or matching your search.</p>
              <p className="text-sm text-gray-400 mt-2">You can add notes via the "Add New Note" button or by editing the course.</p>
            </div>
          )}

          {!loadingNotes && selectedCourseId && filteredNotes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div key={note._id || note.id} className="bg-white p-5 shadow-lg rounded-lg flex flex-col justify-between hover:shadow-xl transition-shadow">
                  <div>
                    <div className="flex items-start mb-3">
                      {note.type === 'file' ? getFileIcon(note.fileType) : <LinkIcon className="w-8 h-8 text-indigo-500" />}
                      <h2 className="font-semibold text-lg text-slate-800 ml-3 leading-tight">{note.title}</h2>
                    </div>
                    {note.type === 'file' && note.fileName && (
                      <p className="text-xs text-gray-500 mb-1 truncate" title={note.fileName}>Filename: {note.fileName}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-3">Type: <span className="font-medium">{note.type === 'file' ? (note.fileType || 'File') : 'External Link'}</span></p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-200 flex justify-end">
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${buttonBaseStyle} bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 text-xs py-2 px-4`}
                    >
                      {note.type === 'file' ? 'Download/View File' : 'Open Link'}
                    </a>
                    {/* Note: Direct deletion/editing from this dashboard is complex as it requires updating the parent Course document. 
                          Suggesting users to edit the course to manage its notes.
                      <button 
                        onClick={() => navigate(`/institute/edit-course/${selectedCourseId}`)} // Or a specific note edit page if built
                        className={`${buttonBaseStyle} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400 text-xs py-2 px-4 ml-2`}
                        title="Edit notes within the course"
                      >
                        <Edit3 size={14} className="mr-1"/> Manage
                      </button> 
                      */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotesDashboard;
