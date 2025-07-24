import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import API_BASE_URL from "../../../config";

const EditExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { exam } = location.state || {};

  const [examData, setExamData] = useState({
    id: examId || "",
    ExamID: "",
    courseCode: "",
    batch: { timings: "", name: "", id: "" },
    examDate: "",
    examType: "Weekly Test",
    examDurationMinutes: "",
    totalQuestions: "",
    totalMarks: "",
    passingMarks: "",
    examMode: "Online",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [batchSearchQuery, setBatchSearchQuery] = useState("");
  const [isOnlineExam, setIsOnlineExam] = useState(false);

  useEffect(() => {
    if (exam) {
      setExamData({
        id: exam.id,
        ExamID: exam.examId,
        courseCode: exam.courseCode,
        batch: exam.batch,
        examDate: exam.examDate.split("T")[0],
        examType: exam.examType,
        examDurationMinutes: exam.examDurationMinutes,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        examMode: exam.modeOnline ? "Online" : "Offline",
      });
      
      setIsOnlineExam(exam.modeOnline);
      setLoading(false);
    } else {
      setError("Exam data not found. Please try again.");
      setLoading(false);
    }
  }, [exam]);
console.log("Exam data loaded:", examData.batch);
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/institute_courses/getCourses`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
         console.log("Fetching batches for franchiseId:", franchiseId);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_batche/allBatches?franchiseId=${franchiseId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const batchesData = await response.json();
      console.log("Batches fetched:", batchesData);
      setBatches(batchesData.data);
    } catch (err) {
      console.error("Error fetching batches:", err);
      setBatches([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExamData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBatchChange = (e) => {
    const selectedBatch = batches.find((batch) => batch.id === e.target.value);
    setExamData((prev) => ({
      ...prev,
      batch: selectedBatch || { timings: "", name: "", id: "" },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const examId = examData.id || examId;
      console.log("Submitting exam data:", examData);
      const response = await fetch(`${API_BASE_URL}/api/v1/institute_exam/exams/updateExam/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setSuccessMessage("Exam updated successfully!");
      setTimeout(() => {
        navigate("/institute/Exam");
      }, 2000);
    } catch (err) {
      console.error("Error updating exam:", err);
      setError("Failed to update exam. Please try again.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
   
      fetchBatches();
    
  }, [examData.courseCode]);

  useEffect(() => {
    setExamData(prev => ({
      ...prev,
      examMode: isOnlineExam ? "Online" : "Offline",
    }));
  }, [isOnlineExam]);

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

  const filteredCourses = courses.filter(
    (course) =>
      course.courseCode.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
      course.courseName.toLowerCase().includes(courseSearchQuery.toLowerCase())
  );

  const filteredBatches = batches.filter(
    (batch) =>
      batch.timings.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
      batch.name.toLowerCase().includes(batchSearchQuery.toLowerCase())
  );

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

  if (error) {
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

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/institute/Exam")}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold text-red-500">Edit Exam</h1>
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getExamTypeColor(examData.examType)}`}>
            {examData.examType}
          </div>
        </div>
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
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-gray-700 font-semibold mb-3">Exam Type</label>
            <div className="grid grid-cols-3 gap-4">
              {["Weekly Test", "Monthly Test", "Final Test"].map((type) => (
                <label key={type} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="examType"
                    value={type}
                    checked={examData.examType === type}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">{type}</span>
                    <span className="text-xs text-gray-500">
                      {type === "Weekly Test" && "60 min • 20 questions • 20 marks"}
                      {type === "Monthly Test" && "90 min • 40 questions • 40 marks"}
                      {type === "Final Test" && "180 min • 100 questions • 100 marks"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Exam ID</label>
            <input
              type="text"
              name="ExamID"
              value={examData.ExamID}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Course Code</label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-2 border rounded mb-2"
                placeholder="Search courses..."
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
              />
              <select
                name="courseCode"
                value={examData.courseCode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Course</option>
                {filteredCourses.map((course) => (
                  <option key={course.id || course.courseCode} value={course.courseCode}>
                    {course.courseCode} ({course.courseName})
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              <select
                name="batch"
                value={examData.batch.id}
                onChange={handleBatchChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Batch</option>
                {filteredBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} ({batch.timings})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700">Exam Date</label>
            <input
              type="date"
              name="examDate"
              value={examData.examDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Exam Duration (minutes)</label>
              <input
                type="number"
                name="examDurationMinutes"
                value={examData.examDurationMinutes}
                onChange={handleInputChange}
                className="w-full p-2 border rounded bg-gray-50"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-gray-700">Total Questions</label>
              <input
                type="number"
                name="totalQuestions"
                value={examData.totalQuestions}
                onChange={handleInputChange}
                className="w-full p-2 border rounded bg-gray-50"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-gray-700">Total Marks</label>
              <input
                type="number"
                name="totalMarks"
                value={examData.totalMarks}
                onChange={handleInputChange}
                className="w-full p-2 border rounded bg-gray-50"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-gray-700">Passing Marks</label>
              <input
                type="number"
                name="passingMarks"
                value={examData.passingMarks}
                onChange={handleInputChange}
                className="w-full p-2 border rounded bg-gray-50"
                required
                min="1"
                max={examData.totalMarks}
              />
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Save size={20} />
              Save Changes
            </button>
            <button
              onClick={() => navigate("/institute/Exam")}
              className="bg-red-500 shadow hover:bg-red-600 text-white px-6 py-2 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExam;