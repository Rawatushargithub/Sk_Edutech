import React, { useState } from "react";

const ExamSection = () => {
  const [entries, setEntries] = useState(10); // Default: Show 10 entries
  const [examList, setExamList] = useState([
    {
      courseCode: "CS101",
      examName: "Midterm Exam",
      totalMarks: 100,
      totalQuestions: 50,
      marksPerQuestion: 2,
      minimumMarks: 40,
      examDate: "2025-02-15",
      mode: "Online",
    },
    {
      courseCode: "CS102",
      examName: "Final Exam",
      totalMarks: 200,
      totalQuestions: 100,
      marksPerQuestion: 2,
      minimumMarks: 80,
      examDate: "2025-03-10",
      mode: "Offline",
    },
    // Add more dummy data if needed
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [newExam, setNewExam] = useState({
    courseCode: "",
    examName: "",
    totalMarks: "",
    totalQuestions: "",
    marksPerQuestion: "",
    minimumMarks: "",
    examDate: "",
    mode: "Online",
  });

  const openModal = (exam = null) => {
    setIsEditing(!!exam);
    setCurrentExam(exam);
    setNewExam(
      exam || {
        courseCode: "",
        examName: "",
        totalMarks: "",
        totalQuestions: "",
        marksPerQuestion: "",
        minimumMarks: "",
        examDate: "",
        mode: "Online",
      }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExam(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewExam({ ...newExam, [name]: value });
  };

  const handleSave = () => {
    if (isEditing) {
      setExamList((prevList) =>
        prevList.map((exam) =>
          exam === currentExam ? { ...currentExam, ...newExam } : exam
        )
      );
    } else {
      setExamList([...examList, newExam]);
    }
    closeModal();
  };

  const handleDelete = (exam) => {
    setExamList((prevList) => prevList.filter((item) => item !== exam));
  };

  return (
    <div className="p-6 border-gray-300 border rounded-3xl bg-white h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-red-600">Exam List</h2>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700"
        >
          Add Exam
        </button>
      </div>

      {/* Entries Dropdown */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="mr-2 text-gray-700">Show</label>
          <select
            value={entries}
            onChange={(e) => setEntries(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
          <span className="ml-2 text-gray-700">entries</span>
        </div>

        {/* Search Bar */}
        <div className="flex justify-end">
          <input
            type="text"
            placeholder="Search Exam..."
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        <div className="w-full overflow-x-auto border rounded-md border-gray-400">
          <table className="table-auto min-w-full text-left border-gray-300 border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Course Code</th>
                <th className="px-4 py-2 border border-gray-300">Exam Name</th>
                <th className="px-4 py-2 border border-gray-300">Total Marks</th>
                <th className="px-4 py-2 border border-gray-300">Total Questions</th>
                <th className="px-4 py-2 border border-gray-300">Marks/Question</th>
                <th className="px-4 py-2 border border-gray-300">Minimum Marks</th>
                <th className="px-4 py-2 border border-gray-300">Exam Date</th>
                <th className="px-4 py-2 border border-gray-300">Mode</th>
                <th className="px-4 py-2 border border-gray-300">Modify</th>
                <th className="px-4 py-2 border border-gray-300">Delete</th>
              </tr>
            </thead>
            <tbody>
              {examList.slice(0, entries).map((exam, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-4 py-2 border border-gray-300">{exam.courseCode}</td>
                  <td className="px-4 py-2 border border-gray-300">{exam.examName}</td>
                  <td className="px-4 py-2 border border-gray-300">{exam.totalMarks}</td>
                  <td className="px-4 py-2 border border-gray-300">{exam.totalQuestions}</td>
                  <td className="px-4 py-2 border border-gray-300">{exam.marksPerQuestion}</td>
                  <td className="px-4 py-2 border border-gray-300">{exam.minimumMarks}</td>
                  <td className="px-4 py-2 border border-gray-300">{exam.examDate}</td>
                  <td className="px-4 py-2 border border-gray-300">{exam.mode}</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <button onClick={() => openModal(exam)} className="text-blue-600 hover:underline">
                      Modify
                    </button>
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    <button onClick={() => handleDelete(exam)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4 transform transition-all scale-100 opacity-100">
            <h2 className="text-lg font-bold mb-4">
              {isEditing ? "Modify Exam" : "Add Exam"}
            </h2>
            <input
              type="text"
              name="courseCode"
              placeholder="Course Code"
              value={newExam.courseCode}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              name="examName"
              placeholder="Exam Name"
              value={newExam.examName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="number"
              name="totalMarks"
              placeholder="Total Marks"
              value={newExam.totalMarks}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="number"
              name="totalQuestions"
              placeholder="Total Questions"
              value={newExam.totalQuestions}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="number"
              name="marksPerQuestion"
              placeholder="Marks/Question"
              value={newExam.marksPerQuestion}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="number"
              name="minimumMarks"
              placeholder="Minimum Marks"
              value={newExam.minimumMarks}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="date"
              name="examDate"
              value={newExam.examDate}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
            <select
              name="mode"
              value={newExam.mode}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSection;
