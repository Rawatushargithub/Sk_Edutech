import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
 
const ExamManagement = () => { 
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  // Fetch exams from the backend when the component loads
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/exams");
      const data = await response.json();
      setExams(data); // Ensure correct data structure
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    }
  };

  const markAsDone = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/exams/${id}/status`, {  // ✅ Fix endpoint
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),  // ✅ Use status field
      });
  
      if (!response.ok) {
        throw new Error("Failed to update exam status");
      }
  
      setExams((prevExams) =>
        prevExams.map((exam) =>
          exam._id === id ? { ...exam, status: "Completed" } : exam
        )
      );
    } catch (error) {
      console.error("Failed to mark exam as done:", error);
    }
  };
  

  // Delete Exam
  const deleteExam = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/exams/${id}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete exam");
      }
  
      setExams((prevExams) => prevExams.filter((exam) => exam._id !== id));
    } catch (error) {
      console.error("Failed to delete exam:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Exam Management</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 mb-4"
        onClick={() => navigate("/AddExam")}
      >
        Add Exam
      </button>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 border-b">Batch</th>
              <th className="py-3 px-4 border-b">Date</th>
              <th className="py-3 px-4 border-b">Course Code</th>
              <th className="py-3 px-4 border-b">Total Questions</th>
              <th className="py-3 px-4 border-b">Passing Marks</th>
              <th className="py-3 px-4 border-b">Duration (Minutes)</th>
              <th className="py-3 px-4 border-b">Mode</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr
                key={exam._id}
                className={`hover:bg-gray-50 ${
                  exam.status === "Completed" ? "opacity-50" : ""
                }`}
              >
                <td className="py-3 px-4 border-b">{exam.batch}</td>
                <td className="py-3 px-4 border-b">{exam.examDate}</td>
                <td className="py-3 px-4 border-b">{exam.courseCode}</td>
                <td className="py-3 px-4 border-b">{exam.totalQuestions}</td>
                <td className="py-3 px-4 border-b">{exam.passingMarks}</td>
                <td className="py-3 px-4 border-b">{exam.examDurationMinutes}</td>
                <td className="py-3 px-4 border-b">
                  {exam.modeOnline ? "Online" : ""}
                  {exam.modeOffline ? (exam.modeOnline ? " / " : "") + "Offline" : ""}
                </td>
                <td className="py-3 px-4 border-b">{exam.status}</td>
                <td className="py-3 px-4 border-b flex space-x-2">
                  <button
                    onClick={() => markAsDone(exam._id)}
                    className="text-green-500 hover:text-green-700"
                    disabled={exam.status === "Completed"}
                  >
                    ✅
                  </button>
                  <button
                    onClick={() => deleteExam(exam._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamManagement;
