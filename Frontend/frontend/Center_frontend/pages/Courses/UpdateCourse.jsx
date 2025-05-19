import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { FilePlus } from 'lucide-react';
import { Video } from 'lucide-react';

const CourseUpdateForm = () => { 
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    courseFees: '',
    courseMRP: '',
    minimumFees: '',
    duration: '',
    institutePlan: '',
    examFees: '',
    courseSubject: '',
    award: '',
    status: 'active',
    displayFees: false,
    videoLinks: [''],
    files: ['']
  });

  const [plans, setPlans] = useState([]);

  useEffect(() => { 
    const courseData = JSON.parse(localStorage.getItem('editCourseData'));
    if (courseData) {
      setFormData(prevState => ({
        ...prevState,
        ...courseData
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const index = localStorage.getItem('editCourseIndex');
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    courses[index] = formData;
    localStorage.setItem('courses', JSON.stringify(courses));
    localStorage.removeItem('editCourseIndex');
    localStorage.removeItem('editCourseData');
    window.location.href = '/course-viewport';
  };

  const addVideoLink = () => {
    setFormData(prevState => ({
      ...prevState,
      videoLinks: [...prevState.videoLinks, '']
    }));
  };

  const addFile = () => {
    setFormData(prevState => ({
      ...prevState,
      files: [...prevState.files, '']
    }));
  };

  const addPlan = () => {
    setPlans(prevPlans => [...prevPlans, { name: '', price: '' }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Update Course</h2>
          <button
            type="button"
            onClick={() => {}} 
            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors"
          >
            How to Upload Video Link
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
                  Course Code
                </label>
                <input
                  type="text"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
                  Course Name
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
                    Course Fees
                  </label>
                  <input
                    type="number"
                    name="courseFees"
                    value={formData.courseFees}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
                    Course MRP
                  </label>
                  <input
                    type="number"
                    name="courseMRP"
                    value={formData.courseMRP}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
                  Institute Plan
                </label>
                <select
                  name="institutePlan"
                  value={formData.institutePlan}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">---select---</option>
                  <option value="institute1">Institute 1</option>
                  <option value="institute2">Institute 2</option>
                  <option value="institute3">Institute 3</option>
                </select>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={addPlan}
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <FilePlus className="w-4 h-4 mr-2" />
                  Add Plans
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:ml-0.5 after:text-red-500">
                  Award
                </label>
                <select
                  name="award"
                  value={formData.award}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">---select---</option>
                  <option value="award1">Award 1</option>
                  <option value="award2">Award 2</option>
                  <option value="award3">Award 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course Material Files
                </label>
                {formData.files.map((file, index) => (
                  <div key={index} className="mt-2">
                    <input
                      type="file"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFile}
                  className="mt-2 inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Add More Files
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Video Links
                </label>
                {formData.videoLinks.map((link, index) => (
                  <input
                    key={index}
                    type="text"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...formData.videoLinks];
                      newLinks[index] = e.target.value;
                      setFormData(prevState => ({
                        ...prevState,
                        videoLinks: newLinks
                      }));
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={`Video Link ${index + 1}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={addVideoLink}
                  className="mt-2 inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Add More Videos
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Display Course Fees On Website
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="displayFees"
                    value="yes"
                    checked={formData.displayFees}
                    onChange={() => setFormData(prev => ({ ...prev, displayFees: true }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="displayFees"
                    value="no"
                    checked={!formData.displayFees}
                    onChange={() => setFormData(prev => ({ ...prev, displayFees: false }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/Courses'}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseUpdateForm;