import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddExam = ({ exams, setExams }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auto update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [newExam, setNewExam] = useState({
    courseCode: "",
    batch: "",
    examDate: "",
    examTime: "",
    examDurationMinutes: "",
    totalQuestions: "",
    passingMarks: "",
    modeOnline: true,
    modeOffline: true,
    displayResult: "Yes",
    status: "Active",
    createdAt: currentTime.toLocaleString(),
  });

  const handleAddExam = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExam),
      });

      if (!response.ok) {
        throw new Error("Failed to add exam");
      }

      const result = await response.json();
      alert(result.message);

      // Ensure exams is an array before updating it
      setExams((prevExams) => (Array.isArray(prevExams) ? [...prevExams, result.exam] : [result.exam]));

      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding exam");
    }
  };



  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Add Exam</h1>

      {/* Course Code & Total Marks
      <div className="flex justify-between items-center bg-indigo-600 text-white p-4 rounded-md mb-4">
        <span className="text-lg">Course Code</span>
        <span className="text-lg">Total Marks</span>
        <span className="text-lg">{currentTime.toLocaleString()}</span>
      </div> */}

      {/* Form Fields */}


      <div className="bg-white p-6 shadow-md rounded-md">
        <div className="grid grid-cols-2 gap-4 mb-4">

          <div>
            <label className="block text-gray-700">Course Code</label>
            <select
              className="w-full p-2 border rounded"
              value={newExam.courseCode}
              onChange={(e) => setNewExam({ ...newExam, courseCode: e.target.value })}
            >
              <option value="">Select Course</option>
              <option value="BCA12H">BCA12H (Bachelor of Computer Application)</option>
              <option value="MCA34P">MCA34P (Master of Computer Application)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700">Batch</label>
            <select
              className="w-full p-2 border rounded"
              value={newExam.batch}
              onChange={(e) => setNewExam({ ...newExam, batch: e.target.value })}
            >
              <option value="">Select Batch</option>
              <option value="Batch 1">Batch 1 (9AM - 10AM)</option>
              <option value="Batch 2">Batch 2 (11AM - 12PM)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Exam Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={newExam.examDate}
                onChange={(e) => setNewExam({ ...newExam, examDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-gray-700">Exam Time</label>
              <input
                type="time"
                className="w-full p-2 border rounded"
                value={newExam.examTime}
                onChange={(e) => setNewExam({ ...newExam, examTime: e.target.value })}
              />
            </div>


          </div>

          {/* Exam time in minutes */}
          <div>
            <label className="block text-gray-700">Exam Time (minutes)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={newExam.examDurationMinutes}
              onChange={(e) =>
                setNewExam({ ...newExam, examDurationMinutes: e.target.value })
              }
            />
          </div>


          {/* <div>
            <label className="block text-gray-700">Marks Per Question</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-gray-100"
              value={newExam.marksPerQuestion}
              onChange={(e) =>
                setNewExam({ ...newExam, marksPerQuestion: e.target.value })
              }
              disabled
            />
          </div> */}
        </div>

        {/* total or passing marks wala parent div */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700">Total Questions</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={newExam.totalQuestions}
              onChange={(e) =>
                setNewExam({ ...newExam, totalQuestions: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-gray-700">Passing Marks (%)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={newExam.passingMarks}
              onChange={(e) =>
                setNewExam({ ...newExam, passingMarks: e.target.value })
              }
            />
          </div>
          {/* <div>
            <label className="block text-gray-700">Exam Time (minutes)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={newExam.examTime}
              onChange={(e) =>
                setNewExam({ ...newExam, examTime: e.target.value })
              }
            />
          </div> */}
        </div>

        {/* Exam Modes */}
        <div className="mb-4">
          <label className="block text-gray-700">Exam Modes</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={newExam.modeOnline}
                onChange={() =>
                  setNewExam({ ...newExam, modeOnline: !newExam.modeOnline })
                }
              />
              <span>ONLINE</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={newExam.modeOffline}
                onChange={() =>
                  setNewExam({ ...newExam, modeOffline: !newExam.modeOffline })
                }
              />
              <span>OFFLINE</span>
            </label>
          </div>
        </div>

        {/* Display Result */}
        <div className="mb-4">
          <label className="block text-gray-700">Display Result</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                className="w-5 h-5"
                name="displayResult"
                value="Yes"
                checked={newExam.displayResult === "Yes"}
                onChange={(e) =>
                  setNewExam({ ...newExam, displayResult: e.target.value })
                }
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                className="w-5 h-5"
                name="displayResult"
                value="No"
                checked={newExam.displayResult === "No"}
                onChange={(e) =>
                  setNewExam({ ...newExam, displayResult: e.target.value })
                }
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Demo Exam
        <div className="mb-4">
          <label className="block text-gray-700">Demo Exam</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                className="w-5 h-5"
                name="demoExam"
                value="Yes"
                checked={newExam.demoExam === "Yes"}
                onChange={(e) =>
                  setNewExam({ ...newExam, demoExam: e.target.value })
                }
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                className="w-5 h-5"
                name="demoExam"
                value="No"
                checked={newExam.demoExam === "No"}
                onChange={(e) =>
                  setNewExam({ ...newExam, demoExam: e.target.value })
                }
              />
              <span>No</span>
            </label>
          </div>
        </div> */}

        {/* Status */}
        <div className="mb-4">
          <label className="block text-gray-700">Status</label>
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

        {/* Buttons */}
        <div className="flex space-x-4">
          <button onClick={handleAddExam}
            className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600">Submit</button>
          <button onClick={() => navigate("/Exam")} className="bg-red-500 shadow hover:bg-red-600 text-white px-6 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddExam;
