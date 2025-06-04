import { useEffect, useState } from "react";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary
const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/student/all`);
        const data = await response.json();
        console.log("📢 Students fetched:", data);
        setStudents(data);
      } catch (error) {
        console.error("❌ Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Student List</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Roll Number</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Age</th>
              <th className="border p-2">Mobile</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student) => {
                // Convert DOB (YYYY-MM-DD) to Age
                const birthYear = student.dob?.split("-")[0]; // Assuming DOB format: YYYY-MM-DD
                const age = birthYear ? new Date().getFullYear() - birthYear : "N/A";

                return (
                  <tr key={student._id} className="border">
                    <td className="border p-2">{student.rollNumber}</td>
                    <td className="border p-2">{student.studentName}</td>
                    <td className="border p-2">{age}</td>
                    <td className="border p-2">{student.studentMobile}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentList;
