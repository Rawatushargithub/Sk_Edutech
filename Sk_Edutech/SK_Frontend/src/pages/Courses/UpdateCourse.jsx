import React, { useState, useEffect } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import courseService from '../courseServices.js';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CourseUpdateForm = () => {
  const [videos, setVideos] = useState([{ title: '', link: '' }]);
  const [courseImage, setCourseImage] = useState(null);
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [existingMaterials, setExistingMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    courseSubject: '',
    courseFees: '',
    courseMRP: '',
    courseDuration: '',
    courseSyllabus: '',
    courseEligibility: '',
    displayFeesOnWebsite: true,
    status: 'active'
  });

  useEffect(() => {
    const courseData = JSON.parse(localStorage.getItem('editCourseData'));
    if (courseData) {
      setFormData({
        courseCode: courseData.courseCode || '',
        courseName: courseData.courseName || '',
        courseSubject: courseData.courseSubject || '',
        courseFees: courseData.courseFees || '',
        courseMRP: courseData.courseMRP || '',
        courseDuration: courseData.courseDuration || '',
        courseSyllabus: courseData.courseSyllabus || '',
        courseEligibility: courseData.courseEligibility || '',
        displayFeesOnWebsite: courseData.displayFeesOnWebsite !== undefined ? courseData.displayFeesOnWebsite : true,
        status: courseData.status || 'active'
      });

      if (courseData.courseVideoLinks && courseData.courseVideoLinks.length > 0) {
        const videoObjects = courseData.courseVideoLinks.map(link => ({
          title: '', // Assuming no titles are stored; adjust if backend changes
          link
        }));
        setVideos(videoObjects);
      }

      if (courseData.courseMaterials && courseData.courseMaterials.length > 0) {
        setExistingMaterials(courseData.courseMaterials);
      }

      // Note: courseImage remains a URL until a new file is uploaded
      if (courseData.courseImage) {
        setCourseImage(courseData.courseImage);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
console.log("formdata" , formData);
    try {
      const courseData = JSON.parse(localStorage.getItem('editCourseData'));
      const courseId = courseData._id;

      const courseVideoLinks = videos
        .filter(v => v.link.trim() !== '')
        .map(v => v.link);

      const updatedCourseData = {
        ...formData,
        courseVideoLinks,
      };

      // Use FormData for file uploads
      const formDataToSend = new FormData();
      Object.keys(updatedCourseData).forEach(key => {
        if (key === 'courseVideoLinks') {
          formDataToSend.append(key, JSON.stringify(updatedCourseData[key]));
        } else {
          formDataToSend.append(key, updatedCourseData[key]);
        }
      });

      // Append new image if uploaded
      if (courseImage && typeof courseImage !== 'string') { // Check if it's a file, not a URL
        formDataToSend.append('courseImage', courseImage);
      }

      // Append new materials if uploaded
      if (courseMaterials.length > 0) {
        courseMaterials.forEach(file => {
          formDataToSend.append('courseMaterials', file);
        });
      }

      // Note: This assumes an updateCourse method exists in courseService.
      // You'll need to add this API call in courseService.js (see below).
      const result = await courseService.updateCourse(courseId, formDataToSend);
      console.log(result)
      // Update localStorage for consistency with CourseForm
      const courses = JSON.parse(localStorage.getItem('courses') || '[]');
      const index = parseInt(localStorage.getItem('editCourseIndex'));
      if (!isNaN(index) && index >= 0 && index < courses.length) {
        courses[index] = result.course;
        localStorage.setItem('courses', JSON.stringify(courses));
      }

      alert('Course updated successfully!');
      navigate('/Courses');
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err.error || 'Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addVideo = () => {
    setVideos([...videos, { title: '', link: '' }]);
  };

  const handleVideoChange = (index, field, value) => {
    const updatedVideos = [...videos];
    updatedVideos[index][field] = value;
    setVideos(updatedVideos);
  };

  const handleImageUpload = (e) => {
    setCourseImage(e.target.files[0]);
  };

  const handleMaterialUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setCourseMaterials(prev => [...prev, ...newFiles]);
  };

  const removeVideo = (index) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    setVideos(updatedVideos.length ? updatedVideos : [{ title: '', link: '' }]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const courseData = JSON.parse(localStorage.getItem('editCourseData'));
      const courseId = courseData._id;

      const courseVideoLinks = videos
        .filter(v => v.link.trim() !== '')
        .map(v => v.link);

      const updatedCourseData = {
        ...formData,
        courseVideoLinks,
      };

      // Use FormData for file uploads
      const formDataToSend = new FormData();
      Object.keys(updatedCourseData).forEach(key => {
        if (key === 'courseVideoLinks') {
          formDataToSend.append(key, JSON.stringify(updatedCourseData[key]));
        } else {
          formDataToSend.append(key, updatedCourseData[key]);
        }
      });

      // Append new image if uploaded
      if (courseImage && typeof courseImage !== 'string') { // Check if it's a file, not a URL
        formDataToSend.append('courseImage', courseImage);
      }

      // Append new materials if uploaded
      if (courseMaterials.length > 0) {
        courseMaterials.forEach(file => {
          formDataToSend.append('courseMaterials', file);
        });
      }

      const result = await courseService.updateCourse(courseId, formDataToSend);

      // Update localStorage for consistency with CourseForm
      const courses = JSON.parse(localStorage.getItem('courses') || '[]');
      const index = parseInt(localStorage.getItem('editCourseIndex'));
      if (!isNaN(index) && index >= 0 && index < courses.length) {
        courses[index] = result.course;
        localStorage.setItem('courses', JSON.stringify(courses));
      }

      // Show success message
      toast.success('Course updated successfully!');
      
      // Navigate after a short delay so the user can see the message
      setTimeout(() => {
        navigate('/Courses');
      }, 2000);
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err.error || 'Failed to update course. Please try again.');
      toast.error('Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Update Course</h1>
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm"
              onClick={() => {/* Video guide logic */}}
            >
              How to Upload Video Link
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 required">
                    Course Code
                  </label>
                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 required">
                    Course Name
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 required">
                      Course Fees
                    </label>
                    <input
                      type="number"
                      name="courseFees"
                      value={formData.courseFees}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 required">
                      Course MRP
                    </label>
                    <input
                      type="number"
                      name="courseMRP"
                      value={formData.courseMRP}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 required">
                    Course Syllabus
                  </label>
                  <textarea
                    name="courseSyllabus"
                    value={formData.courseSyllabus}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  ></textarea>
                </div>

                {/* Video Links Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Video Links
                  </label>
                  {videos.map((video, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-grow grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Video Title"
                          value={video.title}
                          onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Video Link"
                          value={video.link}
                          onChange={(e) => handleVideoChange(index, 'link', e.target.value)}
                          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVideo}
                    className="flex items-center text-sm bg-orange-500 text-white px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add More Videos
                  </button>
                </div>

                {/* Radio Button Sections */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Course Fees On Website
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="displayFeesOnWebsite"
                          value="yes"
                          checked={formData.displayFeesOnWebsite === true}
                          onChange={() => setFormData({ ...formData, displayFeesOnWebsite: true })}
                          className="mr-2"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="displayFeesOnWebsite"
                          value="no"
                          checked={formData.displayFeesOnWebsite === false}
                          onChange={() => setFormData({ ...formData, displayFeesOnWebsite: false })}
                          className="mr-2"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={formData.status === 'active'}
                          onChange={() => setFormData({ ...formData, status: 'active' })}
                          className="mr-2"
                        />
                        <span>Active</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={formData.status === 'inactive'}
                          onChange={() => setFormData({ ...formData, status: 'inactive' })}
                          className="mr-2"
                        />
                        <span>Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 required">
                    Course Subject
                  </label>
                  <input
                    type="text"
                    name="courseSubject"
                    value={formData.courseSubject}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 required">
                    Course Duration
                  </label>
                  <input
                    type="text"
                    name="courseDuration"
                    value={formData.courseDuration}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 6 Months"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 required">
                    Eligibility Criteria
                  </label>
                  <textarea
                    name="courseEligibility"
                    value={formData.courseEligibility}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  ></textarea>
                </div>

                {/* Course Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Course Image {typeof courseImage === 'string' && '(Current image will be replaced if new file uploaded)'}
                  </label>
                  {typeof courseImage === 'string' && (
                    <img src={courseImage} alt="Current course" className="mt-2 w-32 h-32 object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Material Files
                  </label>
                  {existingMaterials.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Existing files:</p>
                      <ul className="mt-1 text-sm text-gray-500">
                        {existingMaterials.map((url, index) => (
                          <li key={index}><a href={url} target="_blank" rel="noopener noreferrer">{url.split('/').pop()}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <input
                    type="file"
                    multiple
                    onChange={handleMaterialUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {courseMaterials.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">New files to be added:</p>
                      <ul className="mt-1 text-sm text-gray-500">
                        {courseMaterials.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
                disabled={loading}
              > 
                {loading ? 'Updating...' : 'Update'}
              </button>
              <button
                type="button"
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                onClick={() => navigate('/Courses')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseUpdateForm;