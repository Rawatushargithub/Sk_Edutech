// api not working expect courses.
import {
  Plus,
  Book,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import API_BASE_URL from "../../../config"; // Adjust the import path as necessary

const QuestionBankSystem = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [nextQNo, setNextQNo] = useState(1);

  const [formData, setFormData] = useState({
    qNo: "",
    question: "",
    options: { a: "", b: "", c: "", d: "" },
    answer: "",
  });

  // API configuration
  const API_BASE_URL2 =
    `${API_BASE_URL}/api/v1`;

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL2}${endpoint}`, {
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

  // Load courses when component mounts
  useEffect(() => {
    loadCourses();
  }, []);

  // Load questions when course is selected
  useEffect(() => {
    if (selectedCourseCode) {
      loadQuestions();
    } else { 
      setQuestions([]);
    }
  }, [selectedCourseCode]);

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await apiCall("/institute_courses/getCourses");
      console.log("Courses loaded:", response);
      setCourses(response || []);
    } catch (error) {
      showNotification("Error loading courses: " + error.message, "error");
      console.error("Load courses error:", error);
    } finally {
      setCoursesLoading(false);
    }
  };
  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`/institute_question_bank/${selectedCourseCode}/questions`);
      const loadedQuestions = response.data || [];
      setQuestions(loadedQuestions);

      // Find max qNo for auto-increment
      if (loadedQuestions.length > 0) {
        const maxQNo = Math.max(...loadedQuestions.map(q => Number(q.qNo) || 0));
        setNextQNo(maxQNo + 1);
      } else {
        setNextQNo(1);
      }
    } catch (error) {
      showNotification("Error loading questions: " + error.message, "error");
      setQuestions([]);
      setNextQNo(1);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  const resetForm = () => {
    setFormData({
      qNo: "",
      question: "",
      options: { a: "", b: "", c: "", d: "" },
      answer: "",
    });
    setEditingQuestion(null);
  };

  const handleSubmit = async () => {
    if (
      !formData.qNo ||
      !formData.question.trim() ||
      !formData.answer ||
      !Object.values(formData.options).every((opt) => opt.trim())
    ) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading(true);

      if (editingQuestion) {
        // Edit question in the course's question bank
        const { qNo, question, options, answer } = formData;
        await apiCall(
          `/institute_question_bank/${selectedCourseCode}/questions/${editingQuestion._id}`,
          {
            method: "PUT",
            body: JSON.stringify({ qNo, question, options, answer }),
          }
        );
        showNotification("Question updated successfully!", "success");
      } else {
        // Add question to the course's question bank
        const course = courses.find((c) => c.courseCode === selectedCourseCode);
        const { qNo, question, options, answer } = formData;
        await apiCall(`/institute_question_bank/create-question`, {
          method: "POST",
          body: JSON.stringify({
            qNo,
            question,
            options,
            answer,
            courseCode: selectedCourseCode,
            courseName: course ? course.courseName : "",
          }),
        });
        showNotification("Question added successfully!", "success");
      }

      setShowAddForm(false);
      resetForm();
      await loadQuestions();
    } catch (error) {
      showNotification("Error saving question: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setFormData({
      qNo: question.qNo,
      question: question.question,
      options: { ...question.options },
      answer: question.answer,
    });
    setEditingQuestion(question);
    setShowAddForm(true);
  };

  const handleDelete = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        setLoading(true);
        await apiCall(
          `/institute_question_bank/${selectedCourseCode}/questions/${questionId}`,
          {
            method: "DELETE",
          }
        );
        showNotification("Question deleted successfully!", "success");
        await loadQuestions();
      } catch (error) {
        showNotification("Error deleting question: " + error.message, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const getSelectedCourseName = () => {
    const course = courses.find((c) => c.courseCode === selectedCourseCode);
    return course ? course.courseName : "";
  };

  // When Add Question is clicked, auto-fill qNo
  const handleAddQuestionClick = () => {
    setFormData({
      qNo: nextQNo,
      question: "",
      options: { a: "", b: "", c: "", d: "" },
      answer: "",
    });
    setEditingQuestion(null);
    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Book className="text-indigo-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">
              Question Bank Management
            </h1>
          </div>

          {/* Course Selection */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Select Course:
            </label>
            <select
              value={selectedCourseCode}
              onChange={(e) => setSelectedCourseCode(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={coursesLoading}
            >
              <option value="">
                {coursesLoading ? "Loading courses..." : "Choose a course..."}
              </option>
              {courses.map((course) => (
                <option key={course.courseCode} value={course.courseCode}>
                  {course.courseCode} - {course.courseName}
                </option>
              ))}
            </select>

            {selectedCourseCode && (
              <button
                onClick={handleAddQuestionClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Add Question
              </button>
            )}
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {notification.message}
          </div>
        )}

        {/* Course Info */}
        {selectedCourseCode && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {selectedCourseCode} - {getSelectedCourseName()}
            </h2>
            <p className="text-gray-600">Total Questions: {questions.length}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question Number (qNo) *
                </label>
                <input
                  type="number"
                  value={formData.qNo}
                  onChange={(e) =>
                    setFormData({ ...formData, qNo: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter question number"
                  required
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question *
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter your question here..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["a", "b", "c", "d"].map((option) => (
                  <div key={option}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Option {option.toUpperCase()} *
                    </label>
                    <input
                      type="text"
                      value={formData.options[option]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          options: {
                            ...formData.options,
                            [option]: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={`Enter option ${option.toUpperCase()}`}
                      required
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correct Answer *
                </label>
                <select
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select correct answer...</option>
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                  <option value="d">D</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingQuestion ? "Update Question" : "Add Question"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        {selectedCourseCode && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Questions</h3>
              {loading && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              )}
            </div>

            {questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">
                            Q{question.qNo}. {question.question}
                          </h4>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(question)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(question._id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div
                          key={key}
                          className={`p-2 rounded border ${
                            question.answer === key
                              ? "bg-green-100 border-green-300 text-green-800"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <span className="font-semibold">
                            {key.toUpperCase()}:
                          </span>{" "}
                          {value}
                          {question.answer === key && (
                            <CheckCircle className="inline ml-2" size={16} />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>
                        Correct Answer:{" "}
                        <span className="font-semibold text-green-700">
                          Option {question.answer.toUpperCase()}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading questions...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Questions Yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start building your question bank by adding the first
                  question.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                >
                  <Plus size={20} />
                  Add First Question
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankSystem;

