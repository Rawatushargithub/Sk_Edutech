import axios from 'axios';

// Base URL for API calls
// Using a hard-coded value or checking for window.env if you set up environment variables on the client side
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/courses`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Service object with all course-related API calls
const courseService = {
  /**
   * Create a new course
   * @param {Object} courseData - Course data
   * @param {File} image - Course image file
   * @param {Array} materials - Course material files
   * @returns {Promise} - Promise with created course data
   */
  createCourse: async (courseData, image, materials) => {
    try {
      const formData = new FormData();
      
      // Append course data
      Object.keys(courseData).forEach(key => {
        formData.append(key, courseData[key]);
      });
      
      // Append image if provided
      if (image) {
        formData.append('courseImage', image);
      }
      
      // Append materials if provided
      if (materials && materials.length) {
        materials.forEach(file => {
          formData.append('courseMaterials', file);
        });
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      const response = await apiClient.post('/createCourses', formData, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create course' };
    }
  },
  
  /**
   * Get all courses with full details
   * @returns {Promise} - Promise with courses data
   */
  getAllCourses: async () => {
    try {
      const response = await apiClient.get('/getAllCourses');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch courses' };
    }
  },
  
  /**
   * Get total number of courses
   * @returns {Promise} - Promise with course count
   */
  getCoursesCount: async () => {
    try {
      const response = await apiClient.get('/count');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch course count' };
    }
  },
  
  /**
   * Get recently added courses
   * @param {number} limit - Number of courses to return
   * @returns {Promise} - Promise with recent courses data
   */
  getRecentCourses: async (limit = 5) => {
    try {
      const response = await apiClient.get(`/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch recent courses' };
    }
  },
  
  /**
   * Delete a course by ID
   * @param {string} courseId - ID of the course to delete
   * @returns {Promise} - Promise with delete confirmation
   */
  deleteCourse: async (courseId) => {
    try {
      const response = await apiClient.delete(`/${courseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete course' };
    }
  },
  
  /**
   * Get a single course by ID
   * @param {string} courseId - ID of the course to fetch
   * @returns {Promise} - Promise with course data
   */
  getCourseById: async (courseId) => {
    try {
      const response = await apiClient.get(`/${courseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch course' };
    }
  },
  
  /**
   * Update an existing course
   * @param {string} courseId - ID of the course to update
   * @param {Object} courseData - Updated course data
   * @param {File} image - Updated course image file (optional)
   * @param {Array} materials - Updated course material files (optional)
   * @returns {Promise} - Promise with updated course data
   */
  updateCourse: async (courseId, formData) => {
    try {
    // This will show what's actually inside the FormData
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      const response = await apiClient.put(`/${courseId}`, formData, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update course' };
    }
  }
};

export default courseService;