import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Plus,
  Trash2,
  Download,
  Save,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../../config';

const Marksheet = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksheets, setMarksheets] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [subjects, setSubjects] = useState([
    { subjectName: '', practicalMarks: 0, theoryMarks: 0, maximumMarks: 50 },
  ]);
  const [loading, setLoading] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [hasExistingMarksheet, setHasExistingMarksheet] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch courses and marksheets on component mount
  useEffect(() => {
    fetchCourses();
    fetchMarksheets();
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

      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_marksheet/courses?franchiseId=${franchiseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarksheets = async () => {
    try {
      const token = localStorage.getItem('token');
      const franchiseId = localStorage.getItem('franchiseID');

      if (!franchiseId) return;

      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_marksheet/all?franchiseId=${franchiseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMarksheets(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching marksheets:', error);
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

      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_marksheet/students/${courseId}?franchiseId=${franchiseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

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
    setSubjects([{ subjectName: '', practicalMarks: 0, theoryMarks: 0, maximumMarks: 50 }]);
    setHasExistingMarksheet(false);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setShowStudentForm(true);
    fetchExistingMarksheet(student._id);
  };

  const fetchExistingMarksheet = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const franchiseId = localStorage.getItem('franchiseID');
      const selectedCourseData = courses.find((c) => c._id === selectedCourse);

      if (!franchiseId || !selectedCourseData) return;

      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_marksheet/student/${studentId}/course/${selectedCourseData.courseCode}?franchiseId=${franchiseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.student && data.data.student.subjects) {
          setSubjects(data.data.student.subjects);
          setHasExistingMarksheet(true);
        } else {
          setSubjects([{ subjectName: '', practicalMarks: 0, theoryMarks: 0, maximumMarks: 50 }]);
          setHasExistingMarksheet(false);
        }
      } else {
        setSubjects([{ subjectName: '', practicalMarks: 0, theoryMarks: 0, maximumMarks: 50 }]);
        setHasExistingMarksheet(false);
      }
    } catch (error) {
      console.error('Error fetching existing marksheet:', error);
      setSubjects([{ subjectName: '', practicalMarks: 0, theoryMarks: 0, maximumMarks: 50 }]);
      setHasExistingMarksheet(false);
    }
  };

  const addSubject = () => {
    if (subjects.length < 10) {
      setSubjects([...subjects, { subjectName: '', practicalMarks: 0, theoryMarks: 0, maximumMarks: 50 }]);
    }
  };

  // Then filter the students based on the search query before rendering
const filteredStudents = students.filter((student) =>
  student.studentName.toLowerCase().includes(studentSearch.toLowerCase())
);
   

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index, field, value) => {
    const updatedSubjects = subjects.map((subject, i) =>
      i === index ? { ...subject, [field]: field === 'subjectName' ? value : parseInt(value) || 0 } : subject
    );
    setSubjects(updatedSubjects);
  };

  const saveMarksheet = async () => {
    if (!selectedStudent || !selectedCourse || subjects.some((s) => !s.subjectName)) {
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          courseId: selectedCourse,
          franchiseId: franchiseId,
          subjects: subjects.map((s) => ({
            subjectName: s.subjectName,
            practicalMarks: parseInt(s.practicalMarks) || 0,
            theoryMarks: parseInt(s.theoryMarks) || 0,
            maximumMarks: parseInt(s.maximumMarks) || 50,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage('Marksheet created successfully! ₹300 deducted from wallet and sent for approval.');
        setShowSuccessPopup(true);
        fetchMarksheets();
        setSubjects([{ subjectName: '', practicalMarks: 0, theoryMarks: 0, maximumMarks: 50 }]);
        setSelectedStudent(null);
        setShowStudentForm(false);

        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 5000);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to save marksheet'}`);
      }
    } catch (error) {
      console.error('Error saving marksheet:', error);
      alert('Error saving marksheet');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const totalObtained = subjects.reduce(
      (sum, subject) => sum + (parseInt(subject.practicalMarks) || 0) + (parseInt(subject.theoryMarks) || 0),
      0
    );
    const totalMaximum = subjects.reduce((sum, subject) => sum + (parseInt(subject.maximumMarks) || 0), 0);
    const percentage = totalMaximum > 0 ? ((totalObtained / totalMaximum) * 100).toFixed(2) : 0;
    return { totalObtained, totalMaximum, percentage };
  };

  const { totalObtained, totalMaximum, percentage } = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-center bg-red-500 text-white text-2xl font-bold">Still in progress</h1>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Success!</h3>
            <p className="text-gray-600 text-center mb-6">{successMessage}</p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-40 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-0">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Marksheet Created!</p>
              <p className="text-sm opacity-90">₹300 deducted • Sent for approval</p>
            </div>
            <button onClick={() => setShowSuccessPopup(false)} className="ml-4 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Marksheet Management</h1>
          <p className="text-gray-600">Generate and manage student marksheets with admin approval system</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Create Marksheet
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'view' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              View Marksheets
            </button>
          </div>
        </div>

        {activeTab === 'create' ? (
          <>
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


            {selectedCourse && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Active Students</h2>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{students.length} students</span>
                </div>

                {/* Student Search Input */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search students by name..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading students...</p>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => handleStudentSelect(student)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedStudent?._id === student._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
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

            {/* Students List */}
            {/* {selectedCourse && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Active Students</h2>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{students.length} students</span>
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
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedStudent?._id === student._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <h3 className="font-semibold text-gray-800">{student.studentName}</h3>
                        <p className="text-sm text-gray-600">Registration No: {student.rollNumber}</p>
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
            )} */}

            {/* Marksheet Form */}
            {showStudentForm && selectedStudent && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>

                    <h2 className="text-xl font-semibold text-gray-800">
                      Marksheet for {selectedStudent.studentName}
                    </h2>
                    <p className="text-gray-600">Registration No: {selectedStudent.rollNumber}</p>

                  </div>
                  <button
                    onClick={addSubject}
                    disabled={subjects.length >= 10}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Subject {subjects.length >= 10 && '(Max 10)'}
                  </button>
                </div>

                {/* Subjects Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Sr.No</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">PR</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">TH</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Total</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Max Marks</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Grade</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject, index) => {
                        const total = (parseInt(subject.practicalMarks) || 0) + (parseInt(subject.theoryMarks) || 0);
                        const percentageSubject = subject.maximumMarks > 0 ? (total / subject.maximumMarks) * 100 : 0;
                        let grade = 'F';
                        if (percentageSubject >= 90) grade = 'A+';
                        else if (percentageSubject >= 80) grade = 'A';
                        else if (percentageSubject >= 70) grade = 'B+';
                        else if (percentageSubject >= 60) grade = 'B';
                        else if (percentageSubject >= 50) grade = 'C+';
                        else if (percentageSubject >= 40) grade = 'C';
                        else if (percentageSubject >= 33) grade = 'D';

                        return (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <input
                                type="text"
                                placeholder="Subject Name"
                                value={subject.subjectName}
                                onChange={(e) => updateSubject(index, 'subjectName', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={hasExistingMarksheet}
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <input
                                type="number"
                                placeholder="Practical Marks"
                                value={subject.practicalMarks}
                                onChange={(e) => updateSubject(index, 'practicalMarks', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                disabled={hasExistingMarksheet}
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <input
                                type="number"
                                placeholder="Theory Marks"
                                value={subject.theoryMarks}
                                onChange={(e) => updateSubject(index, 'theoryMarks', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                disabled={hasExistingMarksheet}
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center font-semibold">{total}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <input
                                type="number"
                                placeholder="Maximum Marks"
                                value={subject.maximumMarks}
                                onChange={(e) => updateSubject(index, 'maximumMarks', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="1"
                                disabled={hasExistingMarksheet}
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center font-semibold">{grade}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {subjects.length > 1 && (
                                <button
                                  onClick={() => removeSubject(index)}
                                  className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  disabled={subjects.length === 1 || hasExistingMarksheet}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Total Row */}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="border border-gray-300 px-4 py-2 text-center" colSpan="4">
                          Total Marks
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {totalObtained}/{totalMaximum}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">Grade</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {percentage >= 90
                            ? 'A+'
                            : percentage >= 80
                              ? 'A'
                              : percentage >= 70
                                ? 'B+'
                                : percentage >= 60
                                  ? 'B'
                                  : percentage >= 50
                                    ? 'C+'
                                    : percentage >= 40
                                      ? 'C'
                                      : percentage >= 33
                                        ? 'D'
                                        : 'F'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{totalObtained}</p>
                      <p className="text-sm text-gray-600">Total Obtained</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-600">{totalMaximum}</p>
                      <p className="text-sm text-gray-600">Total Maximum</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{percentage}%</p>
                      <p className="text-sm text-gray-600">Percentage</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={addSubject}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    disabled={subjects.length >= 10 || hasExistingMarksheet}
                  >
                    <Plus className="w-4 h-4" />
                    Add Subject
                  </button>

                  {!hasExistingMarksheet && (
                    <button
                      onClick={saveMarksheet}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      disabled={loading}
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Marksheet'}
                    </button>
                  )}

                  {hasExistingMarksheet && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      Marksheet Already Exists
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          // View Marksheets Tab
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">All Marksheets</h2>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                  {marksheets.filter(
                    (m) => filterStatus === 'all' || m.approvalStatus === filterStatus
                  ).length}{' '}
                  total
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {marksheets.filter(
              (m) => filterStatus === 'all' || m.approvalStatus === filterStatus
            ).length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No marksheets found</p>
                <p className="text-gray-400">
                  {filterStatus === 'all'
                    ? 'Create your first marksheet to get started'
                    : `No marksheets with ${filterStatus} status`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Student Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Registration No</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Grade</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Percentage</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marksheets
                      .filter(
                        (m) => filterStatus === 'all' || m.approvalStatus === filterStatus
                      )
                      .map((marksheet, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="py-3 px-4">{marksheet.studentName}</td>
                          <td className="py-3 px-4">{marksheet.rollNumber}</td>
                          <td className="py-3 px-4">
                            <span className="text-sm">{marksheet.courseName}</span>
                            <br />
                            <span className="text-xs text-gray-500">({marksheet.courseCode})</span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${marksheet.overallGrade === 'A+' || marksheet.overallGrade === 'A'
                                  ? 'bg-green-100 text-green-800'
                                  : marksheet.overallGrade === 'B+' || marksheet.overallGrade === 'B'
                                    ? 'bg-blue-100 text-blue-800'
                                    : marksheet.overallGrade === 'C+' || marksheet.overallGrade === 'C'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {marksheet.overallGrade}
                            </span>
                          </td>
                          <td className="py-3 px-4">{marksheet.percentage}%</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${marksheet.approvalStatus === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : marksheet.approvalStatus === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                              {marksheet.approvalStatus === 'approved' && (
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                              )}
                              {marksheet.approvalStatus === 'rejected' && (
                                <XCircle className="w-3 h-3 inline mr-1" />
                              )}
                              {marksheet.approvalStatus === 'pending' && (
                                <Clock className="w-3 h-3 inline mr-1" />
                              )}
                              {marksheet.approvalStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {marksheet.approvalStatus === 'pending' ? (
                              <button
                                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert('Marksheet approval is pending.');
                                }}
                              >
                                Pending
                              </button>
                            ) : marksheet.approvalStatus === 'approved' ? (
                              <button
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const franchiseId = localStorage.getItem('franchiseID');
                                    if (!franchiseId) {
                                      alert('Franchise ID not found');
                                      return;
                                    }
                                    const res = await axios.get(
                                      `${API_BASE_URL}/api/v1/marksheet/download?franchiseId=${encodeURIComponent(
                                        franchiseId
                                      )}&rollNumber=${encodeURIComponent(marksheet.rollNumber)}`,
                                      {
                                        responseType: 'blob',
                                        timeout: 30000,
                                      }
                                    );
                                    if (
                                      res.data.type === 'application/pdf' ||
                                      res.headers['content-type']?.includes('pdf')
                                    ) {
                                      const url = window.URL.createObjectURL(
                                        new Blob([res.data], { type: 'application/pdf' })
                                      );
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.setAttribute('download', `${marksheet.rollNumber}_marksheet.pdf`);
                                      document.body.appendChild(link);
                                      link.click();
                                      link.remove();
                                      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                                    } else {
                                      alert('File format is not PDF.');
                                    }
                                  } catch (error) {
                                    console.error('Download error:', error);
                                    alert('Failed to download marksheet. Please try again later.');
                                  }
                                }}
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">No Actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marksheet;
