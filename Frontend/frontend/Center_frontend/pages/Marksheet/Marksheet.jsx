import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, Download, Save, Users, BookOpen } from 'lucide-react';
import API_BASE_URL from '../../../config';

const Marksheet = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [subjects, setSubjects] = useState([{ subjectName: '', marks: '', maxMarks: 100 }]);
  const [loading, setLoading] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch students when course is selected
  useEffect(() => {
    if (selectedCourse) { 
      fetchStudents(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const franchiseId = localStorage.getItem('franchiseID');
      
      if (!franchiseId) {
        console.error('Franchise ID not found in localStorage');
        return;
      }
console.log("Franchise ID::" , franchiseId)
      const response = await fetch(`${API_BASE_URL}/api/v1/institute_marksheet/courses?franchiseId=${franchiseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("Course Data::" , response)
      if (response.ok) {
        const data = await response.json();
        console.log("data parsed::" , data)
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (courseId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const franchiseId = localStorage.getItem('franchiseID');
      
      if (!franchiseId) {
        console.error('Franchise ID not found in localStorage');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/institute_marksheet/students/${courseId}?franchiseId=${franchiseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setSelectedStudent(null);
    setShowStudentForm(false);
    setSubjects([{ subjectName: '', marks: '', maxMarks: 100 }]);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setShowStudentForm(true);
    // Check if marksheet exists for this student
    fetchExistingMarksheet(student._id, selectedCourse);
  };

  const fetchExistingMarksheet = async (studentId, courseId) => {
    try {
      const token = localStorage.getItem('token');
      const franchiseId = localStorage.getItem('franchiseID');
      
      if (!franchiseId) {
        console.error('Franchise ID not found in localStorage');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/institute_marksheet/student/${studentId}/course/${courseId}?franchiseId=${franchiseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.subjects) {
          setSubjects(data.data.subjects);
        }
      }
    } catch (error) {
      console.error('Error fetching existing marksheet:', error);
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, { subjectName: '', marks: '', maxMarks: 100 }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index, field, value) => {
    const updatedSubjects = subjects.map((subject, i) => 
      i === index ? { ...subject, [field]: value } : subject
    );
    setSubjects(updatedSubjects);
  };

  const saveMarksheet = async () => {
    if (!selectedStudent || !selectedCourse || subjects.some(s => !s.subjectName || !s.marks)) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const franchiseId = localStorage.getItem('franchiseID');
      
      if (!franchiseId) {
        console.error('Franchise ID not found in localStorage');
        alert('Franchise ID not found. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/institute_marksheet/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          courseId: selectedCourse,
          franchiseId: franchiseId,
          subjects: subjects.map(s => ({
            subjectName: s.subjectName,
            marks: parseInt(s.marks),
            maxMarks: parseInt(s.maxMarks)
          }))
        })
      });

      if (response.ok) {
        alert('Marksheet saved successfully!');
      } else {
        alert('Error saving marksheet');
      }
    } catch (error) {
      console.error('Error saving marksheet:', error);
      alert('Error saving marksheet');
    } finally {
      setLoading(false);
    }
  };

  const downloadMarksheet = () => {
    // Placeholder for download functionality
    alert('Download functionality will be implemented soon!');
  };

  const calculateTotal = () => {
    const totalMarks = subjects.reduce((sum, subject) => sum + (parseInt(subject.marks) || 0), 0);
    const totalMaxMarks = subjects.reduce((sum, subject) => sum + (parseInt(subject.maxMarks) || 0), 0);
    const percentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(2) : 0;
    return { totalMarks, totalMaxMarks, percentage };
  };

  const { totalMarks, totalMaxMarks, percentage } = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Marksheet Management</h1>
          <p className="text-gray-600">Generate and manage student marksheets for your courses</p>
        </div>

        {/* Course Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Select Course</h2>
          </div>
          
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              disabled={loading}
            >
              <option value="">Select a course...</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseName} ({course.courseCode})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Students List */}
        {selectedCourse && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">Active Students</h2>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {students.length} students
              </span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading students...</p>
              </div>
            ) : students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div
                    key={student._id}
                    onClick={() => handleStudentSelect(student)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedStudent?._id === student._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800">{student.studentName}</h3>
                    <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <p className="text-sm text-gray-600">{student.studentMobile}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No active students found for this course</p>
              </div>
            )}
          </div>
        )}

        {/* Marksheet Form */}
        {showStudentForm && selectedStudent && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Marksheet for {selectedStudent.studentName}
                </h2>
                <p className="text-gray-600">Roll Number: {selectedStudent.rollNumber}</p>
              </div>
              <button
                onClick={addSubject}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            {/* Subjects */}
            <div className="space-y-4 mb-6">
              {subjects.map((subject, index) => (
                <div key={index} className="flex gap-4 items-center p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Subject Name"
                      value={subject.subjectName}
                      onChange={(e) => updateSubject(index, 'subjectName', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Marks"
                      min="0"
                      max={subject.maxMarks}
                      value={subject.marks}
                      onChange={(e) => updateSubject(index, 'marks', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Max"
                      min="1"
                      value={subject.maxMarks}
                      onChange={(e) => updateSubject(index, 'maxMarks', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {subjects.length > 1 && (
                    <button
                      onClick={() => removeSubject(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            {subjects.some(s => s.marks) && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{totalMarks}</p>
                    <p className="text-sm text-gray-600">Total Marks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600">{totalMaxMarks}</p>
                    <p className="text-sm text-gray-600">Max Marks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{percentage}%</p>
                    <p className="text-sm text-gray-600">Percentage</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={saveMarksheet}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Marksheet'}
              </button>
              <button
                onClick={downloadMarksheet}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Marksheet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marksheet;
