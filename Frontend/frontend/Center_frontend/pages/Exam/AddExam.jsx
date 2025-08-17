import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from 'react-select'; // Import react-select
import API_BASE_URL from "../../../config"; // Adjust the import path as necessary

const AddExam = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [batchSearchQuery, setBatchSearchQuery] = useState("");
  const [questionSearchQuery, setQuestionSearchQuery] = useState("");
  const [isOnlineExam, setIsOnlineExam] = useState(false);

  // Auto update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch courses and batches from API
  useEffect(() => {
    const franchiseId = localStorage.getItem("franchiseID");

    const fetchCourses = async () => {
      try {

        const response = await fetch(
          `${API_BASE_URL}/api/v1/institute_courses/getCourses?franchiseId=${franchiseId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchBatches = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/institute_batche/allBatches?franchiseId=${franchiseId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch batches");
        }
        const data = await response.json();
        setBatches(data.data || []);
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    fetchCourses();
    fetchBatches();
  }, []);

  const [newExam, setNewExam] = useState({
    courseCode: "",
    batch: [],
    examDate: "",
    examType: "Weekly Test", // New field for exam type
    examStartTime: "", // New field for exam start time
    examEndTime: "", // New field for exam end time
    examDurationMinutes: "", // Will be auto-calculated
    totalQuestions: "", // User input
    totalMarks: "", // User input
    passingMarks: "", // User input
    examMode: "Offline",
    status: "Active",
    createdAt: currentTime.toLocaleString(),
    selectedQuestions: [], // For online exams
  });

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
  const formatTimeToAMPM = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12) => {
    if (!time12) return "";
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  // Auto-calculate exam duration when start and end times change
  useEffect(() => {
    if (newExam.examStartTime && newExam.examEndTime) {
      const startTime = new Date(`1970-01-01T${newExam.examStartTime}:00`);
      const endTime = new Date(`1970-01-01T${newExam.examEndTime}:00`);

      if (endTime > startTime) {
        const durationMs = endTime - startTime;
        const durationMinutes = Math.floor(durationMs / (1000 * 60));
        setNewExam(prev => ({
          ...prev,
          examDurationMinutes: durationMinutes.toString()
        }));
      } else {
        setNewExam(prev => ({
          ...prev,
          examDurationMinutes: ""
        }));
      }
    }
  }, [newExam.examStartTime, newExam.examEndTime]);

  // Fetch questions when course is selected for online exams
  useEffect(() => {
    if (isOnlineExam && newExam.courseCode) {
      const fetchQuestions = async () => {
        try {
          const selectedCourseCode = newExam.courseCode;
          const response = await fetch(
            `${API_BASE_URL}/api/v1/institute_question_bank/${selectedCourseCode}/questions`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch questions");
          }
          const data = await response.json();
          console.log("Questions API Response:", data);

          // Handle different possible response structures
          let questionData = [];
          if (data.data) {
            questionData = data.data;
          } else if (Array.isArray(data)) {
            questionData = data;
          } else if (data.questions) {
            questionData = data.questions;
          }

          console.log("Processed Questions:", questionData);
          setQuestions(questionData);
        } catch (error) {
          console.error("Error fetching questions:", error);
          setQuestions([]);
        }
      };
      fetchQuestions();
    } else {
      setQuestions([]);
    }
  }, [isOnlineExam, newExam.courseCode]);

  // Update exam mode when toggle changes
  useEffect(() => {
    setNewExam(prev => ({
      ...prev,
      examMode: isOnlineExam ? "Online" : "Offline",
      selectedQuestions: isOnlineExam ? prev.selectedQuestions : []
    }));
  }, [isOnlineExam]);

  const handleAddExam = async () => {
    const franchiseId = localStorage.getItem("franchiseID");

    try {
      // Prepare examData
      const examData = {
        ...newExam,
        batch: newExam.batch,
        franchiseId: franchiseId,
      };
      console.log(examData)

      // Only send selectedQuestions for online exams
      if (isOnlineExam) {
        // selectedQuestions should be array of qNo (not _id)
        examData.selectedQuestions = questions
          .filter(q => newExam.selectedQuestions.includes(q._id))
          .map(q => q.qNo);
      } else {
        delete examData.selectedQuestions;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/create-exams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(examData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add exam");
      }

      const result = await response.json();
      alert(result.message);

      navigate("/institute/Exam");
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding exam: " + error.message);
    }
  };

  const handleBatchChange = (timings, name, id) => {
    setNewExam((prev) => {
      const exists = prev.batch.some(
        (b) => b.timings === timings && b.name === name && b.id === id
      );

      const updatedBatches = exists
        ? prev.batch.filter(
          (b) => !(b.timings === timings && b.name === name && b.id === id)
        )
        : [...prev.batch, { timings, name, id }];

      return { ...prev, batch: updatedBatches };
    });
  };

  const handleQuestionSelection = (questionId) => {
    setNewExam((prev) => {
      const exists = prev.selectedQuestions.includes(questionId);
      const updatedQuestions = exists
        ? prev.selectedQuestions.filter(id => id !== questionId)
        : [...prev.selectedQuestions, questionId];

      return { ...prev, selectedQuestions: updatedQuestions };
    });
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(
    (course) =>
      course.courseCode
        .toLowerCase()
        .includes(courseSearchQuery.toLowerCase()) ||
      course.courseName.toLowerCase().includes(courseSearchQuery.toLowerCase())
  );

  // Filter batches based on search query
  const filteredBatches = batches.filter(
    (batch) =>
      batch.timings.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
      batch.name.toLowerCase().includes(batchSearchQuery.toLowerCase())
  );

  // Filter questions based on search query - Fixed to handle nested question structure
  const filteredQuestions = questions.filter((questionItem) => {
    const searchTerm = questionSearchQuery.toLowerCase();

    // The question text is directly in questionItem.question
    const questionText = (questionItem.question || '').toLowerCase();
    const qNo = (questionItem.qNo || '').toString();

    return questionText.includes(searchTerm) || qNo.includes(searchTerm);
  });

  // Get exam type indicator color
  const getExamTypeColor = (examType) => {
    switch (examType) {
      case "Weekly Test":
        return "bg-green-100 text-green-800 border-green-300";
      case "Monthly Test":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Final Test":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-4xl font-bold text-red-500">Add Exam</h1>
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getExamTypeColor(newExam.examType)}`}>
            {newExam.examType}
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center space-x-4">
          <span className={`font-semibold ${!isOnlineExam ? 'text-blue-600' : 'text-gray-500'}`}>
            Offline Exam
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isOnlineExam}
              onChange={(e) => setIsOnlineExam(e.target.checked)}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className={`font-semibold ${isOnlineExam ? 'text-blue-600' : 'text-gray-500'}`}>
            Online Exam
          </span>
        </div>
      </div>

      <div className="bg-white p-6 shadow-md rounded-md">
        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Exam Type Selection */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-gray-700 font-semibold mb-3">Exam Type</label>
            <div className="grid grid-cols-3 gap-4">
              {["Weekly Test", "Monthly Test", "Final Test"].map((type) => (
                <label key={type} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="examType"
                    value={type}
                    checked={newExam.examType === type}
                    onChange={(e) => setNewExam({ ...newExam, examType: e.target.value })}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">{type}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Course Code with Search */}
          <div>
            <label className="block text-gray-700 mb-2">Course Code</label>
            <Select
              options={courses.map(course => ({
                value: course.courseCode,
                label: `${course.courseCode} (${course.courseName})`
              }))}
              onChange={selectedOption => 
                setNewExam({ ...newExam, courseCode: selectedOption ? selectedOption.value : "" })
              }
              value={courses.map(course => ({
                value: course.courseCode,
                label: `${course.courseCode} (${course.courseName})`
              })).find(option => option.value === newExam.courseCode)}
              isClearable
              isSearchable
              placeholder="Select or search for a course..."
              className="w-full"
              classNamePrefix="select"
            />
          </div>

          {/* Question Bank - Only for Online Exams */}
          {isOnlineExam && (
            <div>
              <label className="block text-gray-700 mb-2">
                Question Bank ({newExam.selectedQuestions.length} selected)
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Search questions by question text or number..."
                  value={questionSearchQuery}
                  onChange={(e) => setQuestionSearchQuery(e.target.value)}
                />
                <div className="border rounded p-2 max-h-60 overflow-y-auto bg-gray-50">
                  {newExam.courseCode ? (
                    filteredQuestions.length > 0 ? (
                      filteredQuestions.map((questionItem) => {
                        // Handle nested question structure
                        console.log("Question itemas ", questionItem)
                        const questionData = questionItem.question || 'Question text not available';
                        const questionId = questionItem._id;
                        const qNo = questionItem.qNo || 'N/A';


                        return (
                          <div key={questionId} className="flex items-start mb-3 p-3 bg-white rounded border hover:bg-gray-50">
                            <input
                              type="checkbox"
                              id={`question-${questionId}`}
                              className="w-4 h-4 mr-3 mt-1 flex-shrink-0"
                              checked={newExam.selectedQuestions.includes(questionId)}
                              onChange={() => handleQuestionSelection(questionId)}
                            />
                            <div className="flex-1">
                              <label htmlFor={`question-${questionId}`} className="cursor-pointer">
                                <div className="flex items-center mb-2">
                                  <span className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded mr-2 font-medium">
                                    Q.{qNo}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ID: {questionId}
                                  </span>
                                </div>
                                <div className="text-gray-700 text-sm leading-relaxed">
                                  {questionData}
                                </div>
                                {questionData.options && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    Options: A, B, C, D available
                                  </div>
                                )}
                              </label>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        {questions.length === 0
                          ? "No questions found for the selected course"
                          : "No questions match your search criteria"
                        }
                      </div>
                    )
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Please select a course to view questions
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Batch Multiple Selection with Search */}
          <div>
            <label className="block text-gray-700 mb-2">Batch Selection</label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-2 border rounded mb-2"
                placeholder="Search batches..."
                value={batchSearchQuery}
                onChange={(e) => setBatchSearchQuery(e.target.value)}
              />
              <div className="border rounded p-2 max-h-40 overflow-y-auto">
                {filteredBatches.map((batch) => (
                  <div key={batch.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`batch-${batch.id}`}
                      className="w-4 h-4 mr-2"
                      checked={newExam.batch.some(
                        (b) =>
                          b.timings === batch.timings && b.name === batch.name
                      )}
                      onChange={() =>
                        handleBatchChange(batch.timings, batch.name, batch.id)
                      }
                    />
                    <label htmlFor={`batch-${batch.id}`}>
                      {batch.timings} ({batch.name})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-gray-700">Exam Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={newExam.examDate}
              onChange={(e) =>
                setNewExam({ ...newExam, examDate: e.target.value })
              }
            />
          </div>

          {/* Exam Timing - UPDATED SECTION with prettier time inputs */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Exam Timing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Start Time
                  </span>
                </label>
                <input
                  type="time"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={newExam.examStartTime}
                  onChange={(e) =>
                    setNewExam({ ...newExam, examStartTime: e.target.value })
                  }
                />
                {newExam.examStartTime && (
                  <div className="mt-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded">
                    📅 {formatTimeToAMPM(newExam.examStartTime)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    End Time
                  </span>
                </label>
                <input
                  type="time"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={newExam.examEndTime}
                  onChange={(e) =>
                    setNewExam({ ...newExam, examEndTime: e.target.value })
                  }
                />
                {newExam.examEndTime && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                    📅 {formatTimeToAMPM(newExam.examEndTime)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Duration (Auto-calculated)
                  </span>
                </label>
                <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                  {newExam.examDurationMinutes ? (
                    <div className="flex items-center">
                      <span className="font-bold text-lg">{newExam.examDurationMinutes}</span>
                      <span className="ml-1">minutes</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">Select start and end time</span>
                  )}
                </div>
                {newExam.examStartTime && newExam.examEndTime && newExam.examDurationMinutes && (
                  <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">
                    ⏱️ {formatTimeToAMPM(newExam.examStartTime)} - {formatTimeToAMPM(newExam.examEndTime)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Exam Details Grid - Made User Editable */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700">Total Questions</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={newExam.totalQuestions}
                onChange={(e) =>
                  setNewExam({ ...newExam, totalQuestions: e.target.value })
                }
                placeholder="Enter total questions"
              />
            </div>

            <div>
              <label className="block text-gray-700">Total Marks</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={newExam.totalMarks}
                onChange={(e) =>
                  setNewExam({ ...newExam, totalMarks: e.target.value })
                }
                placeholder="Enter total marks"
              />
            </div>

            <div>
              <label className="block text-gray-700">Passing Marks</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={newExam.passingMarks}
                onChange={(e) =>
                  setNewExam({ ...newExam, passingMarks: e.target.value })
                }
                placeholder="Enter passing marks"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  className="w-5 h-5"
                  name="status"
                  value="Active"
                  checked={newExam.status === "Active"}
                  onChange={(e) =>
                    setNewExam({ ...newExam, status: e.target.value })
                  }
                />
                <span>Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  className="w-5 h-5"
                  name="status"
                  value="Inactive"
                  checked={newExam.status === "Inactive"}
                  onChange={(e) =>
                    setNewExam({ ...newExam, status: e.target.value })
                  }
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleAddExam}
            className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
          <button
            onClick={() => navigate("/institute/Exam")}
            className="bg-red-500 shadow hover:bg-red-600 text-white px-6 py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExam;
