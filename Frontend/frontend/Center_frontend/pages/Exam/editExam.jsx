//Enhanced Edit Exam Component - Cleaner and more readable
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Trash2, ArrowRight } from "lucide-react";
import API_BASE_URL from "../../../config";

const EditExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { exam } = location.state || {};

  // ===== STATE MANAGEMENT =====
  const [examData, setExamData] = useState({
    id: examId || "",
    ExamID: "",
    courseCode: "",
    batch: {},
    examDate: "",
    examType: "Weekly Test",
    examStartTime: "",
    examEndTime: "",
    examDurationMinutes: "",
    totalQuestions: "",
    totalMarks: "",
    passingMarks: "",
    examMode: "Offline",
    status: "Active",
  });

  // Question Management State
  const [questions, setQuestions] = useState([]);
  const [courseQuestions, setCourseQuestions] = useState([]);
  const [selectedCourseQuestions, setSelectedCourseQuestions] = useState(
    new Set()
  );

  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingCourseQuestions, setLoadingCourseQuestions] = useState(false);

  // UI States
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [batchSearchQuery, setBatchSearchQuery] = useState("");
  const [isOnlineExam, setIsOnlineExam] = useState(false);

  // ===== API UTILITY FUNCTION =====
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const getExamTypeColor = (examType) => {
    const colorMap = {
      "Weekly Test": "bg-green-100 text-green-800 border-green-300",
      "Monthly Test": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Final Test": "bg-red-100 text-red-800 border-red-300",
    };
    return colorMap[examType] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  // ===== DATA FETCHING FUNCTIONS =====
  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_courses/getCourses`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const coursesData = await response.json();
      setCourses(coursesData);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  };

  const fetchBatches = async () => {
    try {
      const franchiseId = localStorage.getItem("franchiseID");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_batche/allBatches?franchiseId=${franchiseId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const batchesData = await response.json();
      setBatches(batchesData.data);
    } catch (err) {
      console.error("Error fetching batches:", err);
      setBatches([]);
    }
  };

  const fetchQuestions = async (examId) => {
    try {
      setLoadingQuestions(true);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/exams/${examId}/questions`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const questionsData = await response.json();
      console.log("Fetched questions:", questionsData.questions);

      const validatedQuestions = (questionsData.questions || []).map(
        transformQuestion
      );
      setQuestions(validatedQuestions);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchCourseQuestions = async (courseCode) => {
    try {
      setLoadingCourseQuestions(true);
      const response = await apiCall(
        `/api/v1/institute_question_bank/${courseCode}/questions`
      );
      const loadedQuestions = response.data || [];
      console.log("Loaded course questions:", loadedQuestions);

      const validatedQuestions = loadedQuestions.map(transformQuestion);
      console.log("Transformed course questions:", validatedQuestions);
      setCourseQuestions(validatedQuestions);
    } catch (err) {
      console.error("Error fetching course questions:", err);
      setCourseQuestions([]);
    } finally {
      setLoadingCourseQuestions(false);
    }
  };

  // ===== QUESTION TRANSFORMATION UTILITY =====
  const transformQuestion = (question) => {
    let optionsArray = [];

    if (question.options) {
      if (Array.isArray(question.options)) {
        optionsArray = question.options;
      } else if (typeof question.options === "object") {
        const keys = ["a", "b", "c", "d"];
        optionsArray = keys
          .map((key) => question.options[key] || "")
          .filter((option) => option !== "");

        if (optionsArray.length === 0) {
          optionsArray = Object.values(question.options).filter(
            (option) => option && option !== ""
          );
        }
      }
    }

    // Ensure we have at least 4 options
    while (optionsArray.length < 4) {
      optionsArray.push("");
    }

    return {
      ...question,
      qNo: question.qNo, // Add this line to preserve qNo
      options: optionsArray,
      questionText: question.question || question.questionText || "",
      correctAnswer: question.answer
        ? question.answer === "a"
          ? 0
          : question.answer === "b"
          ? 1
          : question.answer === "c"
          ? 2
          : question.answer === "d"
          ? 3
          : 0
        : question.correctAnswer || 0,
    };
  };

  // ===== QUESTION MANAGEMENT FUNCTIONS =====
  const handleAddQuestionsToExam = async () => {
    if (selectedCourseQuestions.size === 0) {
      showErrorMessage("Please select questions to add to the exam.");
      return;
    }

    try {
  const addedQuestions = [];
  const skippedQuestions = [];

  for (const questionId of selectedCourseQuestions) {
    const question = courseQuestions.find((q) => q._id === questionId);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/institute_exam/exams/${examData.id}/questions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qNo: question.qNo }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 400 && result.message === 'Question already exists in this exam') {
        skippedQuestions.push(question.qNo);
        continue; // Skip this question and continue with the next one
      } else {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
    }

    setQuestions((prev) => [...prev, result.question]);
    addedQuestions.push(question.qNo);
  }

  setSelectedCourseQuestions(new Set());

  // Show appropriate success/warning message
  if (addedQuestions.length > 0 && skippedQuestions.length === 0) {
    showSuccessMessage(`${addedQuestions.length} question(s) added to exam successfully!`);
  } else if (addedQuestions.length > 0 && skippedQuestions.length > 0) {
    showSuccessMessage(
      `${addedQuestions.length} question(s) added successfully! ${skippedQuestions.length} question(s) were already in the exam (Q${skippedQuestions.join(', Q')}).`
    );
  } else if (skippedQuestions.lenKgth > 0 && addedQuestions.length === 0) {
    showErrorMessage(`selected questions are already in the exam (Q${skippedQuestions.join(', Q')}).`);
  }

} catch (err) {
  console.error("Error adding questions to exam:", err);
  showErrorMessage(err.message || "Failed to add questions to exam. Please try again.");
}
  };

  const handleRemoveQuestionFromExam = async (question) => {
  if (
    !window.confirm(
      "Are you sure you want to remove this question from the exam?"
    )
  ) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/institute_exam/exams/${examData.id}/questions/${question.qNo}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    setQuestions(questions.filter((q) => q.qNo !== question.qNo));
    showSuccessMessage("Question removed from exam successfully!");
  } catch (err) {
    console.error("Error removing question from exam:", err);
    showErrorMessage(err.message || "Failed to remove question from exam. Please try again.");
  }
};

  const toggleCourseQuestionSelection = (questionId) => {
    const newSelection = new Set(selectedCourseQuestions);
    if (newSelection.has(questionId)) {
      newSelection.delete(questionId);
    } else {
      newSelection.add(questionId);
    }
    setSelectedCourseQuestions(newSelection);
  };

  // ===== FORM HANDLING =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExamData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBatchChange = (timings, name, id) => {
    setExamData((prev) => {
      const currentBatch = prev.batch;

      if (
        currentBatch.timings === timings &&
        currentBatch.name === name &&
        currentBatch.id === id
      ) {
        return { ...prev, batch: {} };
      } else {
        return { ...prev, batch: { timings, name, id } };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const examId = examData.id || examId;
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/exams/updateExam/${examId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(examData),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      setSuccessMessage("Exam updated successfully!");

      setTimeout(() => {
        navigate("/institute/Exam");
      }, 2000);
    } catch (err) {
      console.error("Error updating exam:", err);
      setError("Failed to update exam. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ===== COMPONENT INITIALIZATION =====
  useEffect(() => {
    if (exam) {
      let batchData = {};
      if (exam.batch) {
        if (Array.isArray(exam.batch)) {
          batchData = exam.batch.length > 0 ? exam.batch[0] : {};
        } else if (typeof exam.batch === "object") {
          batchData = exam.batch;
        }
      }

      setExamData({
        id: exam.id,
        ExamID: exam.examId,
        courseCode: exam.courseCode,
        batch: batchData,
        examDate: exam.examDate.split("T")[0],
        examType: exam.examType,
        examStartTime: exam.examStartTime || "",
        examEndTime: exam.examEndTime || "",
        examDurationMinutes: exam.examDurationMinutes || "",
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        examMode: exam.modeOnline ? "Online" : "Offline",
        status: exam.status || "Active",
      });

      setIsOnlineExam(exam.modeOnline);
      setLoading(false);

      // Fetch questions if it's an online exam
      if (exam.modeOnline) {
        fetchQuestions(exam.id);
        if (exam.courseCode) {
          fetchCourseQuestions(exam.courseCode);
        }
      }
    } else {
      setError("Exam data not found. Please try again.");
      setLoading(false);
    }
  }, [exam]);

  // Auto-calculate duration when times change
  useEffect(() => {
    if (examData.examStartTime && examData.examEndTime) {
      const startTime = new Date(`1970-01-01T${examData.examStartTime}:00`);
      const endTime = new Date(`1970-01-01T${examData.examEndTime}:00`);
      if (endTime > startTime) {
        const durationMs = endTime - startTime;
        const durationMinutes = Math.floor(durationMs / (1000 * 60));
        setExamData((prev) => ({
          ...prev,
          examDurationMinutes: durationMinutes.toString(),
        }));
      } else {
        setExamData((prev) => ({
          ...prev,
          examDurationMinutes: "",
        }));
      }
    }
  }, [examData.examStartTime, examData.examEndTime]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [examData.courseCode]);

  // ===== FILTERED DATA =====
  const filteredCourses = courses.filter(
    (course) =>
      course.courseCode
        .toLowerCase()
        .includes(courseSearchQuery.toLowerCase()) ||
      course.courseName.toLowerCase().includes(courseSearchQuery.toLowerCase())
  );

  const filteredBatches = batches.filter(
    (batch) =>
      batch.timings.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
      batch.name.toLowerCase().includes(batchSearchQuery.toLowerCase())
  );

  // ===== QUESTION DISPLAY COMPONENT =====
  const QuestionDisplay = ({
    question,
    index,
    isExamQuestion = false,
    isSelected = false,
    onToggleSelect,
    onRemove,
  }) => (
    <div
      className={`border rounded-lg p-4 ${
        isSelected ? "bg-blue-50 border-blue-300" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          {!isExamQuestion && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(question._id)}
              className="w-4 h-4 text-blue-600"
            />
          )}
          <h3 className="text-lg font-semibold text-gray-800">
            Question {question.qNo || index + 1}
          </h3>
        </div>
        {isExamQuestion && (
          <button
            onClick={() => onRemove(question)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Remove Question"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-gray-700 mb-3">{question.questionText}</p>
      </div>
    </div>
  );

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="bg-white p-6 shadow-md rounded-md">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading exam details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error && !saving) {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="bg-white p-6 shadow-md rounded-md">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => navigate("/institute/Exam")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Back to Exams
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/institute/Exam")}
            className="p-2 hover:bg-gray-200 rounded-lg"
            disabled={saving}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold text-red-500">Edit Exam</h1>
          <div
            className={`px-3 py-1 rounded-full border text-sm font-medium ${getExamTypeColor(
              examData.examType
            )}`}
          >
            {examData.examType}
          </div>
        </div>

        {/* Online/Offline Toggle (Read Only) */}
        <div className="flex items-center space-x-4 opacity-60">
          <span
            className={`font-semibold ${
              !isOnlineExam ? "text-blue-600" : "text-gray-500"
            }`}
          >
            Offline Exam
          </span>
          <label className="relative inline-flex items-center cursor-not-allowed">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isOnlineExam}
              disabled={true}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gray-400"></div>
          </label>
          <span
            className={`font-semibold ${
              isOnlineExam ? "text-blue-600" : "text-gray-500"
            }`}
          >
            Online Exam
          </span>
          <span className="text-xs text-gray-500">(Read Only)</span>
        </div>
      </div>

      <div className="bg-white p-6 shadow-md rounded-md">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {successMessage}
          </div>
        )}

        {error && saving === false && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {/* Exam Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mb-4">
          {/* READ-ONLY Fields */}
          <div>
            <label className="block text-gray-700 mb-2">
              Exam ID (Read Only)
            </label>
            <input
              type="text"
              name="ExamID"
              value={examData.ExamID}
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              readOnly
              disabled
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 opacity-60">
            <label className="block text-gray-700 font-semibold mb-3">
              Exam Type (Read Only)
            </label>
            <div className="grid grid-cols-3 gap-4">
              {["Weekly Test", "Monthly Test", "Final Test"].map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-3 cursor-not-allowed"
                >
                  <input
                    type="radio"
                    name="examType"
                    value={type}
                    checked={examData.examType === type}
                    className="w-5 h-5 text-blue-600 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-500">{type}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Course Code (Read Only)
            </label>
            <div className="relative opacity-60">
              <select
                name="courseCode"
                value={examData.courseCode}
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                disabled
                readOnly
              >
                <option value="">Select Course</option>
                {filteredCourses.map((course) => (
                  <option
                    key={course.id || course.courseCode}
                    value={course.courseCode}
                  >
                    {course.courseCode} ({course.courseName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Batch Selection (Read Only)
            </label>
            <div className="relative opacity-60">
              <div className="border rounded p-2 max-h-40 overflow-y-auto bg-gray-100">
                {examData.batch && Object.keys(examData.batch).length > 0 ? (
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 mr-2 cursor-not-allowed"
                      checked={true}
                      disabled
                      readOnly
                    />
                    <label className="text-gray-600">
                      {examData.batch.timings} ({examData.batch.name})
                    </label>
                  </div>
                ) : (
                  <div className="text-gray-500">No batch selected</div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700">Exam Date (Read Only)</label>
            <input
              type="date"
              name="examDate"
              value={examData.examDate}
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              readOnly
              disabled
            />
          </div>

          {/* EDITABLE FIELDS */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700">Exam Start Time</label>
              <input
                type="time"
                name="examStartTime"
                value={examData.examStartTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-gray-700">Exam End Time</label>
              <input
                type="time"
                name="examEndTime"
                value={examData.examEndTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-gray-700">
                Duration (Auto-calculated)
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-100"
                value={
                  examData.examDurationMinutes
                    ? `${examData.examDurationMinutes} minutes`
                    : ""
                }
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700">Total Questions</label>
              <input
                type="number"
                name="totalQuestions"
                value={examData.totalQuestions}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={saving}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Total Marks</label>
              <input
                type="number"
                name="totalMarks"
                value={examData.totalMarks}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={saving}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Passing Marks</label>
              <input
                type="number"
                name="passingMarks"
                value={examData.passingMarks}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={saving}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={examData.status === "Active"}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                  disabled={saving}
                />
                <span>Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={examData.status === "Inactive"}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                  disabled={saving}
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className={`px-6 py-2 rounded shadow transition-all duration-200 flex items-center gap-2 min-w-[140px] justify-center ${
                saving
                  ? "bg-blue-400 cursor-not-allowed opacity-70 pointer-events-none"
                  : "bg-blue-500 hover:bg-blue-600 hover:shadow-lg"
              } text-white`}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="ml-1">Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => !saving && navigate("/institute/Exam")}
              className={`px-6 py-2 rounded transition-all duration-200 ${
                saving
                  ? "bg-gray-400 cursor-not-allowed opacity-70 pointer-events-none"
                  : "bg-red-500 hover:bg-red-600 hover:shadow-lg"
              } text-white shadow`}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Questions Section - Only show for Online Exams */}
        {isOnlineExam && (
          <div className="mt-8 border-t pt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Manage Exam Questions
              </h2>
            </div>

            {/* Two Panel Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Panel - Exam Questions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Exam Questions ({questions.length})
                  </h3>
                </div>

                {loadingQuestions ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">
                      Loading exam questions...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {questions.length > 0 ? (
                      questions.map((question, index) => (
                        <QuestionDisplay
                          key={question._id}
                          question={question}
                          index={index}
                          isExamQuestion={true}
                          onRemove={handleRemoveQuestionFromExam}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-lg mb-2">No questions in exam yet</p>
                        <p className="text-sm">
                          Add questions from the course question bank
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Panel - Course Questions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Course Question Bank ({courseQuestions.length})
                  </h3>
                  <div className="flex items-center space-x-2">
                    {selectedCourseQuestions.size > 0 && (
                      <span className="text-sm text-blue-600 font-medium">
                        {selectedCourseQuestions.size} selected
                      </span>
                    )}
                    <button
                      onClick={handleAddQuestionsToExam}
                      disabled={selectedCourseQuestions.size === 0 || saving}
                      className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                        selectedCourseQuestions.size === 0 || saving
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      <ArrowRight size={16} />
                      Add to Exam
                    </button>
                  </div>
                </div>

                {loadingCourseQuestions ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">
                      Loading course questions...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {courseQuestions.length > 0 ? (
                      courseQuestions.map((question, index) => (
                        <QuestionDisplay
                          key={question._id}
                          question={question}
                          index={index}
                          isExamQuestion={false}
                          isSelected={selectedCourseQuestions.has(question._id)}
                          onToggleSelect={toggleCourseQuestionSelection}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-lg mb-2">
                          No questions found in course question bank
                        </p>
                        <p className="text-sm">
                          Questions for course "{examData.courseCode}" will
                          appear here
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bulk Actions Footer */}
            {selectedCourseQuestions.size > 0 && (
              <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-300">
                <div className="flex justify-between items-center">
                  <span className="text-blue-800 font-medium">
                    {selectedCourseQuestions.size} question(s) selected from
                    course question bank
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedCourseQuestions(new Set())}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                    >
                      Clear Selection
                    </button>
                    <button
                      onClick={handleAddQuestionsToExam}
                      disabled={saving}
                      className={`px-4 py-1 rounded-md text-sm flex items-center gap-2 ${
                        saving
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white`}
                    >
                      <ArrowRight size={16} />
                      Add {selectedCourseQuestions.size} Question(s) to Exam
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditExam;
