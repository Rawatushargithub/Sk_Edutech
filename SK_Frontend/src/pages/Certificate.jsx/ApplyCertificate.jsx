// ApplyCertificate.jsx
import React, { useState } from "react";

const ApplyCertificate = () => {
  const [students, setStudents] = useState([
    {
      id: "SKEDU52123456",
      name: "John Doe",
      photo: "https://randomuser.me/api/portraits/men/1.jpg",
      courseName: "Computer Science",
      courseCode: "CS101",
      marksObtained: 480,
      percentage: 96,
      examMode: "Online",
      grade: "A+",
      practicalMarks: 50,
      result: "Pass",
      examDate: "2025-01-20",
      applied: false,
    },
    {
      id: "SKEDU52345678",
      name: "Jane Smith",
      photo: "https://randomuser.me/api/portraits/women/2.jpg",
      courseName: "Mechanical Engineering",
      courseCode: "ME102",
      marksObtained: 430,
      percentage: 86,
      examMode: "Offline",
      grade: "A",
      practicalMarks: 48,
      result: "Pass",
      examDate: "2025-01-18",
      applied: true,
    },
    // Add more student data here
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState(null);

  const handleApply = (id) => {
    const updatedStudents = students.map((student) =>
      student.id === id ? { ...student, applied: true } : student
    );
    setStudents(updatedStudents);
  };

  const filteredStudents = students
    .filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortOption) return 0;
      return sortOption === "percentage"
        ? b.percentage - a.percentage
        : a.name.localeCompare(b.name);
    });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Apply for Certificate</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Apply for Certificate
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-1/3"
        />
        <select
          className="border border-gray-300 rounded-md px-4 py-2"
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="percentage">Percentage</option>
          <option value="name">Name</option>
        </select>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Photo</th>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Course</th>
            <th className="border border-gray-300 px-4 py-2">Course Code</th>
            <th className="border border-gray-300 px-4 py-2">Percentage</th>
            <th className="border border-gray-300 px-4 py-2">Applied</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, index) => (
            <tr
              key={student.id}
              className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
            >
              <td className="border border-gray-300 px-4 py-2">
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-12 h-12 rounded-full"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">{student.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                {student.courseName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {student.courseCode}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {student.percentage}%
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {student.applied ? "Yes" : "No"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {!student.applied && (
                  <button
                    onClick={() => handleApply(student.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                  >
                    Apply
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplyCertificate;
