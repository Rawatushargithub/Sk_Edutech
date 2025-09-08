import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { FileText, Link as LinkIcon, Search, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import Select from 'react-select';
import API_BASE_URL from "../../../config";

const NotesDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("ALL");
  const [allCourses, setAllCourses] = useState([]); // To populate dropdown
  const [notesToDisplay, setNotesToDisplay] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  // Fetch active and approved courses for the filter dropdown
  useEffect(() => {
    const fetchCoursesForFilter = async () => {
      setLoadingCourses(true);
      try {
        const franchiseId = localStorage.getItem('franchiseID');
        // console.log("Fetching courses for franchiseId:", franchiseId);

        // Fetch both institute and admin courses in parallel
        const [instituteResponse, adminResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/institute_courses/getCourses?franchiseId=${franchiseId}`),
          fetch(`${API_BASE_URL}/api/v1/admin/courses/admin-courses`).catch(() => null)
        ]);

        if (!instituteResponse.ok) throw new Error('Failed to fetch institute courses for filter');

        const instituteData = await instituteResponse.json();
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
 
        console.log("Fetched institute courses ", instituteData);
        console.log("Fetched admin courses ", adminCourses);

        const activeApprovedInstituteCourses = instituteData.filter(
          c => c.instituteStatus === 'active' && c.adminApprovalStatus === 'approved'
        );
        console.log("Active approved institute courses ", activeApprovedInstituteCourses);
        // Combine both course types
        const allCourses = [...activeApprovedInstituteCourses, ...adminCourses];
        console.log("All courses ", allCourses);
        setAllCourses(allCourses);
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
    setLoadingNotes(true);
    if (selectedCourseId === 'ALL') {
      const aggregated = allCourses.flatMap(c => c.courseMaterials || []);
      setNotesToDisplay(aggregated);
      setLoadingNotes(false);
      return;
    }

    if (selectedCourseId) {
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
      setLoadingNotes(false);
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

  // Delete note function
  const handleDeleteNote = async (noteId, noteTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${noteTitle}"?`)) {
      return; 
    }

    setDeletingNoteId(noteId);
    try {
      const franchiseId = localStorage.getItem('franchiseID');
      const selectedCourse = allCourses.find(c => c._id === selectedCourseId);
      const isAdminCourse = selectedCourse && (selectedCourse.byAdmin === true || selectedCourse.franchiseId === "Admin");

      // Use different endpoints for admin vs institute courses
      const endpoint = isAdminCourse 
        ? `${API_BASE_URL}/api/v1/admin/courses/${selectedCourseId}/notes/${noteId}`
        : `${API_BASE_URL}/api/v1/institute_courses/${selectedCourseId}/notes/${noteId}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ franchiseId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete note');
      }

      const data = await response.json();
      toast.success('Note deleted successfully!');
      
      // Update the notes display by removing the deleted note
      setNotesToDisplay(prevNotes => 
        prevNotes.filter(note => note._id !== noteId)
      );
      
      // Also update the course in allCourses to keep data in sync
      if (data.course) {
        const updatedCourses = allCourses.map(c => 
          c._id === selectedCourseId ? { ...c, courseMaterials: data.course.courseMaterials } : c
        );
        setAllCourses(updatedCourses);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(`Error deleting note: ${error.message}`);
    } finally {
      setDeletingNoteId(null);
    }
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
              <Select
                id="courseFilter"
                options={[{ value: 'ALL', label: 'All Courses' }, ...allCourses.map(course => {
                  const isAdminCourse = course.byAdmin === true || course.franchiseId === "Admin";
                  return {
                    value: course._id,
                    label: `${course.courseName} (${course.courseCode})${isAdminCourse ? ' [Admin]' : ''}`
                  };
                })]}
                value={[{ value: 'ALL', label: 'All Courses' }, ...allCourses.map(course => {
                  const isAdminCourse = course.byAdmin === true || course.franchiseId === "Admin";
                  return {
                    value: course._id,
                    label: `${course.courseName} (${course.courseCode})${isAdminCourse ? ' [Admin]' : ''}`
                  };
                })].find(option => option.value === selectedCourseId)}
                onChange={selectedOption => setSelectedCourseId(selectedOption ? selectedOption.value : "ALL")}
                isLoading={loadingCourses}
                isClearable
                isSearchable
                placeholder="-- Select or search for a Course --"
                className="w-full"
                classNamePrefix="select"
                formatOptionLabel={(option) => {
                  if (option.value === 'ALL') return option.label;
                  const course = allCourses.find(c => c._id === option.value);
                  const isAdminCourse = course && (course.byAdmin === true || course.franchiseId === "Admin");
                  return (
                    <div className="flex items-center justify-between">
                      <span>{course ? `${course.courseName} (${course.courseCode})` : option.label}</span>
                      {isAdminCourse && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                          Admin
                        </span>
                      )}
                    </div>
                  );
                }}
                styles={{
                  option: (provided, state) => {
                    const course = allCourses.find(c => c._id === state.data.value);
                    const isAdminCourse = course && (course.byAdmin === true || course.franchiseId === "Admin");
                    return {
                      ...provided,
                      backgroundColor: state.isFocused 
                        ? (isAdminCourse ? '#f3e8ff' : provided.backgroundColor)
                        : (isAdminCourse ? '#faf5ff' : provided.backgroundColor),
                      color: isAdminCourse ? '#7c3aed' : provided.color,
                      fontWeight: isAdminCourse ? '600' : provided.fontWeight,
                    };
                  }
                }}
              />
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
                  disabled={loadingCourses}
                />
              </div>
            </div>
          </div>

          {/* Notes Display Area */}
          {loadingNotes && <p className="text-center text-gray-500 py-8">Loading notes...</p>}
          {!loadingNotes && filteredNotes.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow p-6">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No notes found.</p>
              <p className="text-sm text-gray-400 mt-2">You can add notes via the "Add New Note" button or by editing the course.</p>
            </div>
          )}
          {!loadingNotes && filteredNotes.length > 0 && (
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
                  <div className="mt-auto pt-3 border-t border-gray-200 flex justify-between items-center">
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${buttonBaseStyle} bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 text-xs py-2 px-4`}
                    >
                      {note.type === 'file' ? 'Download/View File' : 'Open Link'}
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note._id, note.title);
                      }}
                      disabled={deletingNoteId === note._id}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Note"
                    >
                      {deletingNoteId === note._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
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
