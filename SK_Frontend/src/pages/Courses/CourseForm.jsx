import React, { useState } from 'react';
import { X, Plus } from 'lucide-react'; 

const CourseForm = () => {
  const [videos, setVideos] = useState([{ title: '', link: '' }]);
  const [files, setFiles] = useState([]);
  const [plans, setPlans] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const courseData = {
      courseCode: formData.get('courseCode'),
      courseName: formData.get('courseName'),
      courseFees: formData.get('courseFees'),
      courseMRP: formData.get('courseMRP'),
      minimumFees: formData.get('minimumFees'),
      duration: formData.get('duration'),
      examFees: formData.get('examFees'),
      status: formData.get('status'),
      displayFees: formData.get('display_fees')
    };

    // Store in localStorage
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const existingCourseIndex = courses.findIndex(c => c.courseCode === courseData.courseCode);
    
    if (existingCourseIndex !== -1) {
      courses[existingCourseIndex] = courseData;
    } else {
      courses.push(courseData);
    }
    
    localStorage.setItem('courses', JSON.stringify(courses));
    alert('Course saved successfully!');
  };

  const addVideo = () => {
    setVideos([...videos, { title: '', link: '' }]);
  };

  const addFile = () => {
    setFiles([...files, '']);
  };

  const addPlan = () => {
    setPlans([...plans, '']);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Add Course</h1>
            <button 
              className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm"
              onClick={() => {/* Video guide logic */}}
            >
              How to Upload Video Link
            </button>
          </div>

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
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 required">
                    Institute Plan
                  </label>
                  <select 
                    name="institutePlan"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">---select---</option>
                    <option value="1">Institute 1</option>
                    <option value="2">Institute 2</option>
                    <option value="3">Institute 3</option>
                  </select>
                </div>

                {/* Video Links Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Video Links
                  </label>
                  {videos.map((video, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Video Title"
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Video Link"
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
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
                        <input type="radio" name="display_fees" value="yes" className="mr-2" />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="display_fees" value="no" className="mr-2" />
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
                        <input type="radio" name="status" value="active" className="mr-2" />
                        <span>Active</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="status" value="inactive" className="mr-2" />
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
                    Award
                  </label>
                  <select 
                    name="award"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">---select---</option>
                    <option value="1">Award 1</option>
                    <option value="2">Award 2</option>
                    <option value="3">Award 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 required">
                    Course Subject
                  </label>
                  <input
                    type="text"
                    name="courseSubject"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 required">
                      Minimum Fees
                    </label>
                    <input
                      type="number"
                      name="minimumFees"
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
                      name="duration"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Material Files
                  </label>
                  {files.map((_, index) => (
                    <input
                      key={index}
                      type="file"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addFile}
                    className="flex items-center text-sm bg-orange-500 text-white px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add More Files
                  </button>
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Submit
              </button>
              <button
                type="button"
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                onClick={() => window.location.href = 'Courses'}
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

export default CourseForm;