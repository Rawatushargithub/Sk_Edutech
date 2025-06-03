import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus, UploadCloud, Link2, FileText } from 'lucide-react'; // Added icons
import toast, { Toaster } from 'react-hot-toast';

const CourseForm = ({ mode }) => {
  const { courseId } = useParams();
  const [isEditMode, setIsEditMode] = useState(mode === 'edit');
  
  const [formData, setFormData] = useState({
    courseCode: '', courseName: '', courseSubject: '', courseFees: '',
    courseMRP: '', courseDuration: '', courseSyllabus: '',
    courseEligibility: '', instituteStatus: 'active',
  });
  
  const [courseVideoLinks, setCourseVideoLinks] = useState([{ id: Date.now(), title: '', link: '' }]);
  const [courseImage, setCourseImage] = useState(null);
  const [courseImagePreview, setCourseImagePreview] = useState('');
  const [existingCourseImage, setExistingCourseImage] = useState('');
  
  // Unified notes/materials state
  const [notes, setNotes] = useState([{ id: Date.now(), title: '', type: 'file', url: '', file: null, fileName: '', isNew: true }]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditMode && courseId) {
      setLoading(true);
      fetch(`http://localhost:8000/api/v1/institute_courses/course/${courseId}`) 
        .then(res => {
          if (!res.ok) {
            // Try to parse error message from backend if available
            return res.json().then(errData => {
              throw new Error(errData.message || errData.error || 'Failed to fetch course details');
            }).catch(() => { // Fallback if error response is not JSON
              throw new Error('Failed to fetch course details. Status: ' + res.status);
            });
          }
          return res.json();
        })
        .then(courseData => {
          setFormData({
            courseCode: courseData.courseCode || '', courseName: courseData.courseName || '',
            courseSubject: courseData.courseSubject || '', courseFees: courseData.courseFees || '',
            courseMRP: courseData.courseMRP || '', courseDuration: courseData.courseDuration || '',
            courseSyllabus: courseData.courseSyllabus || '', courseEligibility: courseData.courseEligibility || '',
            instituteStatus: courseData.instituteStatus || 'active',
          });
          setCourseVideoLinks(courseData.courseVideoLinks && courseData.courseVideoLinks.length > 0 ? courseData.courseVideoLinks.map(v => ({...v, id: v._id || Date.now()})) : [{ id: Date.now(), title: '', link: '' }]);
          setExistingCourseImage(courseData.courseImage || '');
          const fetchedNotes = courseData.courseMaterials && courseData.courseMaterials.length > 0 
            ? courseData.courseMaterials.map(m => ({ ...m, id: m._id || Date.now(), file: null, isNew: false })) // Mark existing notes as not new
            : [{ id: Date.now(), title: '', type: 'file', url: '', file: null, fileName: '', isNew: true }]; // Default if no notes
          setNotes(fetchedNotes);
          setLoading(false);
        })
        .catch(err => {
          toast.error(`Error fetching course: ${err.message}`);
          setLoading(false);
        });
    } else {
      // Reset form for "add" mode or if courseId is not present
      setFormData({
        courseCode: '', courseName: '', courseSubject: '', courseFees: '',
        courseMRP: '', courseDuration: '', courseSyllabus: '',
        courseEligibility: '', instituteStatus: 'active',
      });
      setCourseVideoLinks([{ id: Date.now(), title: '', link: '' }]);
      setCourseImage(null);
      setCourseImagePreview('');
      setExistingCourseImage('');
      setNotes([{ id: Date.now(), title: '', type: 'file', url: '', file: null, fileName: '', isNew: true }]);
    }
  }, [isEditMode, courseId, navigate, mode]); // Added mode to dependencies

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleVideoLinkChange = (index, e) => {
    const updatedVideos = [...courseVideoLinks];
    updatedVideos[index][e.target.name] = e.target.value;
    setCourseVideoLinks(updatedVideos);
  };
  const addVideoLink = () => setCourseVideoLinks([...courseVideoLinks, { id: Date.now(), title: '', link: '' }]);
  const removeVideoLink = (idToRemove) => {
    const updated = courseVideoLinks.filter(video => video.id !== idToRemove);
    setCourseVideoLinks(updated.length ? updated : [{ id: Date.now(), title: '', link: '' }]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseImage(file);
      setCourseImagePreview(URL.createObjectURL(file));
      setExistingCourseImage(''); 
    }
  };

  const handleNoteChange = (index, e) => {
    const { name, value } = e.target;
    const updatedNotes = [...notes];
    
    if (name === "type") {
      updatedNotes[index] = { ...updatedNotes[index], type: value, file: null, url: '', fileName: value === 'file' ? (updatedNotes[index].file ? updatedNotes[index].file.name : '') : '' };
    } else if (name === "file") {
      const file = e.target.files[0];
      updatedNotes[index] = { ...updatedNotes[index], file: file || null, fileName: file ? file.name : '', url: '' }; // Clear URL if file is chosen
    } else {
      updatedNotes[index][name] = value;
    }
    setNotes(updatedNotes);
  };

  const addNoteInput = () => {
    setNotes([...notes, { id: Date.now(), title: '', type: 'file', url: '', file: null, fileName: '', isNew: true }]);
  };

  const removeNoteInput = (idToRemove) => {
    const updated = notes.filter(note => note.id !== idToRemove);
    setNotes(updated.length ? updated : [{ id: Date.now(), title: '', type: 'file', url: '', file: null, fileName: '', isNew: true }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(isEditMode ? 'Updating course...' : 'Creating course...');
    const submissionData = new FormData();

    Object.keys(formData).forEach(key => submissionData.append(key, formData[key]));
    
    const validVideoLinks = courseVideoLinks.filter(v => v.title && v.link).map(({id, ...rest}) => rest);
    submissionData.append('courseVideoLinks', JSON.stringify(validVideoLinks));

    if (courseImage) submissionData.append('courseImage', courseImage);
    else if (isEditMode && existingCourseImage) { // If no new image, but existing one should be kept
        submissionData.append('existingCourseImage', existingCourseImage); // Signal to backend to keep this
    }


    const materialsToSubmit = []; // This will be JSON stringified
    const materialFilesToUpload = []; // These are actual File objects

    notes.forEach(note => {
      if (note.type === 'link' && note.title && note.url) {
        materialsToSubmit.push({ 
          title: note.title, 
          type: 'link', 
          url: note.url, 
          fileName: note.fileName || note.title, // For links, fileName can be title
          fileType: 'external-link',
          isNew: note.isNew, // Important for backend to know if it's an existing link being preserved or a new one
          _id: !note.isNew ? note._id : undefined // Send _id for existing notes to help backend identify them
        });
      } else if (note.type === 'file') {
        if (note.file) { // A new file has been selected for this note slot
          materialsToSubmit.push({ 
            title: note.title || note.file.name, 
            type: 'file', 
            // URL will be set by backend after upload
            originalFileNamePlaceholder: note.file.name, // Helps backend match file to this entry
            isNewFile: true // Mark that this entry corresponds to a new file upload
          });
          materialFilesToUpload.push(note.file);
        } else if (!note.isNew && note.url) { // An existing file to be kept
          materialsToSubmit.push({ 
            title: note.title, 
            type: 'file', 
            url: note.url, 
            fileName: note.fileName, 
            fileType: note.fileType,
            isNew: false,
            _id: note._id 
          });
        }
      }
    });
    submissionData.append('courseMaterials', JSON.stringify(materialsToSubmit));
    materialFilesToUpload.forEach(file => submissionData.append('courseMaterialFiles', file));
    
    const url = isEditMode 
      ? `http://localhost:8000/api/v1/institute_courses/update/${courseId}`
      : 'http://localhost:8000/api/v1/institute_courses/createCourses';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, { method, body: submissionData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `Error: ${response.status}`);
      toast.success(result.message || (isEditMode ? 'Course updated successfully!' : 'Course created successfully!'), { id: toastId });
      navigate('/institute/Courses');
    } catch (err) {
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };
  
  const inputBaseStyle = "mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm sm:text-sm focus:outline-none";
  const focusedInputStyle = "focus:border-slate-500 focus:ring-1 focus:ring-slate-500";
  const noRingInputStyle = `${inputBaseStyle} ${focusedInputStyle}`;
  const disabledInputStyle = `${inputBaseStyle} bg-gray-100 text-gray-700 cursor-not-allowed border-gray-300`;
  const buttonStyle = "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const primaryButtonStyle = `${buttonStyle} bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-500`;
  const secondaryButtonStyle = `${buttonStyle} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-slate-500`;
  const dangerButtonStyle = `${buttonStyle} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;

  if (isEditMode && loading && !formData.courseCode) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading course data...</p></div>;
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">
              {isEditMode ? 'Edit Course' : 'Add New Course'}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Course Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div><label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 required">Course Code</label><input type="text" name="courseCode" id="courseCode" value={formData.courseCode} onChange={handleInputChange} required className={isEditMode ? disabledInputStyle : noRingInputStyle} disabled={isEditMode} /></div>
                <div><label htmlFor="courseName" className="block text-sm font-medium text-gray-700 required">Course Name</label><input type="text" name="courseName" id="courseName" value={formData.courseName} onChange={handleInputChange} required className={isEditMode ? disabledInputStyle : noRingInputStyle} disabled={isEditMode} /></div>
                <div><label htmlFor="courseSubject" className="block text-sm font-medium text-gray-700 required">Course Subject</label><input type="text" name="courseSubject" id="courseSubject" value={formData.courseSubject} onChange={handleInputChange} required className={isEditMode ? disabledInputStyle : noRingInputStyle} disabled={isEditMode} /></div>
                <div><label htmlFor="courseDuration" className="block text-sm font-medium text-gray-700 required">Course Duration (Months)</label><input type="number" name="courseDuration" id="courseDuration" value={formData.courseDuration} onChange={handleInputChange} required className={noRingInputStyle} placeholder="e.g., 6" /></div>
                <div><label htmlFor="courseFees" className="block text-sm font-medium text-gray-700 required">Course Fees (Actual)</label><input type="number" name="courseFees" id="courseFees" value={formData.courseFees} onChange={handleInputChange} required className={noRingInputStyle} /></div>
                <div><label htmlFor="courseMRP" className="block text-sm font-medium text-gray-700 required">Course MRP</label><input type="number" name="courseMRP" id="courseMRP" value={formData.courseMRP} onChange={handleInputChange} required className={noRingInputStyle} /></div>
              </div>
              {/* Syllabus and Eligibility */}
              <div className="space-y-6">
                <div><label htmlFor="courseSyllabus" className="block text-sm font-medium text-gray-700 required">Course Syllabus</label><textarea name="courseSyllabus" id="courseSyllabus" value={formData.courseSyllabus} onChange={handleInputChange} rows="4" required className={noRingInputStyle}></textarea></div>
                <div><label htmlFor="courseEligibility" className="block text-sm font-medium text-gray-700 required">Course Eligibility</label><textarea name="courseEligibility" id="courseEligibility" value={formData.courseEligibility} onChange={handleInputChange} rows="3" required className={noRingInputStyle}></textarea></div>
              </div>

              {/* Course Video Links Section */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Course Video Links (Optional)</h3>
                {courseVideoLinks.map((video, index) => (
                  <div key={video.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 bg-gray-50 rounded-md">
                    <input type="text" name="title" data-index={index} value={video.title} onChange={(e) => handleVideoLinkChange(index, e)} className={`${noRingInputStyle} md:col-span-1`} placeholder="Video Title" />
                    <input type="url" name="link" data-index={index} value={video.link} onChange={(e) => handleVideoLinkChange(index, e)} className={`${noRingInputStyle} md:col-span-1`} placeholder="Video URL (e.g., https://...)" />
                    <button type="button" onClick={() => removeVideoLink(video.id)} className={`${dangerButtonStyle} h-10 flex items-center justify-center md:col-span-1`}>
                      <X className="w-4 h-4 mr-1" /> Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addVideoLink} className={`${secondaryButtonStyle} flex items-center`}>
                  <Plus className="w-4 h-4 mr-2" /> Add Video Link
                </button>
              </div>

              {/* Course Image Section */}
              <div className="border-t border-gray-200 pt-6">
                <label htmlFor="courseImage" className="block text-sm font-medium text-gray-700">Course Image (Thumbnail, Optional)</label>
                <input type="file" name="courseImage" id="courseImage" onChange={handleImageChange} accept="image/*" className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 ${noRingInputStyle}`} />
                {courseImagePreview && <img src={courseImagePreview} alt="New Preview" className="mt-2 h-32 w-auto rounded-md object-cover"/>}
                {!courseImagePreview && existingCourseImage && <img src={existingCourseImage} alt="Current Course" className="mt-2 h-32 w-auto rounded-md object-cover"/>}
              </div>
                
              {/* Course Notes/Materials Section */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Course Notes / Materials (Optional)</h3>
                {notes.map((note, index) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-md space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <input type="text" name="title" value={note.title} onChange={(e) => handleNoteChange(index, e)} className={`${noRingInputStyle}`} placeholder="Note Title/Description" />
                      <select name="type" value={note.type} onChange={(e) => handleNoteChange(index, e)} className={`${noRingInputStyle}`}>
                        <option value="file">File Upload</option>
                        <option value="link">External Link</option>
                      </select>
                      <button type="button" onClick={() => removeNoteInput(note.id)} className={`${dangerButtonStyle} h-10 flex items-center justify-center`}>
                        <X className="w-4 h-4 mr-1" /> Remove Note
                      </button>
                    </div>
                    {note.type === 'file' && (
                      <div>
                        {note.isNew || !note.url ? (
                          <input type="file" name="file" onChange={(e) => handleNoteChange(index, e)} accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 ${noRingInputStyle}`} />
                        ) : ( 
                          <div className="text-sm text-gray-600 p-2 border border-dashed border-gray-300 rounded-md">
                            Current file: <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{note.fileName || 'View File'}</a>
                             {/* Option to replace existing file by selecting a new one */}
                             <input type="file" name="file" onChange={(e) => handleNoteChange(index, e)} accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" className={`mt-2 block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:font-semibold file:bg-slate-50 file:text-slate-600 hover:file:bg-slate-100 ${noRingInputStyle}`} />
                          </div>
                        )}
                        {note.file && note.isNew && <p className="text-xs text-green-600 mt-1">New file selected: {note.fileName}</p>}
                      </div>
                    )}
                    {note.type === 'link' && (
                      <input type="url" name="url" value={note.url} onChange={(e) => handleNoteChange(index, e)} className={`${noRingInputStyle}`} placeholder="https://example.com/note" />
                    )}
                  </div>
                ))}
                <button type="button" onClick={addNoteInput} className={`${secondaryButtonStyle} flex items-center`}>
                  <Plus className="w-4 h-4 mr-2" /> Add Note/Material
                </button>
              </div>
              
              {/* Institute Status */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <label htmlFor="instituteStatus" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-0">Institute Status</label>
                  <select name="instituteStatus" id="instituteStatus" value={formData.instituteStatus} onChange={handleInputChange} className={`${noRingInputStyle} sm:w-auto`}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">Set whether this course is currently active for your institute.</p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
                <button type="button" onClick={() => navigate('/institute/Courses')} className={`${secondaryButtonStyle}`}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={`${primaryButtonStyle} min-w-[120px]`}>
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (isEditMode ? 'Update Course' : 'Submit Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseForm;
