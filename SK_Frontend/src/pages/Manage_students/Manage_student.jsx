// Import necessary dependencies
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// const dummyData = Array.from({ length: 70 }, (_, i) => ({
//   id: i + 1,
//   batch: `${Math.ceil((i + 1) / 5)}${
//     ["st", "nd", "rd", "th"][(Math.ceil((i + 1) / 5) % 10) - 1]
//   } Batch`,
//   name: `Student ${i + 1}`,
//   course: [
//     "Computer Diploma",
//     "Basic MS-Office",
//     "DCA",
//     "Advanced Diploma",
//     "Financial Accounting",
//   ][i % 5],
//   photo: `https://via.placeholder.com/40x40.png?text=S${i + 1}`, 
//   status: true,
//   username: "mdprvej",
//   password: "password1",
//   mobile: "9876543210",
//   referralCode: "REF123",
//   referralName: "Aman Kumar",
//   admissionDate: "2025-01-15",
// }));

const StudentAdmissionList = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  
// //   Fetch students data from the backend  
   // Then modify your useEffect fetch to ensure you're setting an array
useEffect(() => {
  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/v1/student/get_students");
      console.log("students data :: ", response.data);
      
      // Check if response.data is an array, if not, handle appropriately
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // If response.data is an object that contains the array (common API pattern)
        // For example, if your API returns {data: [...students]}
        const studentsArray = response.data.data || response.data.students || [];
        setStudents(studentsArray);
      } else {
        console.error("Unexpected response format:", response.data);
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  fetchStudents();
}, []);

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  useEffect(() => {
    // Simulate fetching from backend
   console.log("updated Student data :: " , students)
  }, []);

  const totalPages = students && students.length ? Math.ceil(students.length / entriesPerPage) : 0;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = Array.isArray(students) ? 
    students.slice(startIndex, startIndex + entriesPerPage) : [];

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const previousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // toggle the state of student active or not
  const handleStatusToggle = async (id) => {
    const confirmChange = window.confirm(
      "Are you sure you want to change the status?"
    );
    if (!confirmChange) return;

    // Update status locally
    const updatedStudents = students.map((student) => {
      if (student.id === id) {
        return { ...student, status: !student.status };
      }
      return student;
    });

    setStudents(updatedStudents);

    // Send updated status to backend
    try {
      await axios.patch(`/api/students/${id}`, {
        status: !students.find((student) => student.id === id).status,
      });
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };
  //   // Handlers for each action button
  //   const handleEdit = (id) => {
  //     console.log("Edit student with ID:", id);
  //     // Navigate to edit page or open a modal
  //   };

  //   const handleDownloadPDF = (id) => {
  //     console.log("Download PDF for student with ID:", id);
  //     // Trigger backend API for PDF download
  //   };

  //   const handleViewIDCard = (id) => {
  //     console.log("View ID card for student with ID:", id);
  //     // Display student ID card
  //   };

  //   const handleShare = (id) => {
  //     console.log("Share details for student with ID:", id);
  //     // Share student details logic
  //   };

  return (
    <div className="min-h-full bg-blue-50">

      <div className="mx-auto bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">List Student Admission</h1>
        <div>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-2xl mr-2"
            onClick={() => navigate("/Registration")}
          >
            Add New Student
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded-2xl">
            Export
          </button>
        </div>
      </div>

      <div className="w-full overflow-auto max-h-[550px] border border-gray-300 rounded-md">
  <table className="w-[1400px] border-collapse border-gray-300">
    <thead className="sticky top-0 bg-gray-100">
      <tr>
        <th className="border border-gray-300 px-4 py-2">S/N</th>
        <th className="border border-gray-300 px-4 py-2">Action</th>
        <th className="border border-gray-300 px-4 py-2">Status</th>
        <th className="border border-gray-300 px-4 py-2">Photo</th>
        <th className="border border-gray-300 px-4 py-2">Batch</th>
        <th className="border border-gray-300 px-4 py-2">Student Name</th>
        <th className="border border-gray-300 px-4 py-2">Course Interested</th>
        <th className="border border-gray-300 px-4 py-2">Username</th>
        <th className="border border-gray-300 px-4 py-2">Password</th>
        <th className="border border-gray-300 px-4 py-2">Mobile</th>
        <th className="border border-gray-300 px-4 py-2">Referral Code</th>
        <th className="border border-gray-300 px-4 py-2">Referral Name</th>
        <th className="border border-gray-300 px-4 py-2">Admission Date</th>
      </tr>
    </thead>
    <tbody>
      {currentEntries.map((student, index) => (
        <tr key={student.id} className="text-center border w-96">
          <td className="border border-gray-300 px-4 py-2">{startIndex + index + 1}</td>
          <td className="border-gray-500 px-4 py-2 flex justify-center gap-2">
            <button className="bg-blue-500 text-white p-2 rounded">✏️</button>
            <button className="bg-yellow-500 text-white p-2 rounded">📄</button>
            <button className="bg-green-500 text-white p-2 rounded">🆔</button>
            <button className="bg-teal-500 text-white p-2 rounded">🔗</button>
          </td>
          <td className="p-2 border">
            <button
              onClick={() => handleStatusToggle(student.id)}
              className={`px-2 py-1 rounded text-white ${student.status ? "bg-green-500" : "bg-red-500"}`}
            >
              {student.status ? "Active" : "Inactive"}
            </button>
          </td>
          <td className="border border-gray-300 px-4 py-2">
            <img src={student.studentPhoto} alt="student" className="w-10 h-10 rounded-full mx-auto" />
          </td>
          <td className="border border-gray-300 px-4 py-2">{student.batch}</td>
          <td className="border border-gray-300 px-4 py-2">{student.studentName}</td>
          <td className="border border-gray-300 px-4 py-2">{student.courseInterested}</td>
          <td className="border border-gray-300 px-4 py-2">{student.username}</td>
          <td className="border border-gray-300 px-4 py-2">{student.password}</td>
          <td className="border border-gray-300 px-4 py-2">{student.studentMobile}</td>
          <td className="border border-gray-300 px-4 py-2">{student.referralCode}</td>
          <td className="border border-gray-300 px-4 py-2">{student.referralName}</td>
          <td className="border border-gray-300 px-4 py-2">{student.admissionDate}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={previousPage}
          disabled={currentPage === 1}
          className={`p-2 rounded ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white"
          }`}
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`p-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white"
          }`}
        >
          Next
        </button>
      </div>
      </div>
    </div>

    // <div className="p-6">
    //   <h1 className="text-2xl font-bold mb-4">List Student Admission</h1>
    //   <div className="overflow-x-auto">
    //     <table className="table-auto w-full border-collapse border border-gray-200">
    //       <thead>
    //         <tr className="bg-gray-100">
    //           <th className="border border-gray-200 px-4 py-2">S/N</th>
    //           <th className="border border-gray-200 px-4 py-2">Action</th>
    //           <th className="border border-gray-200 px-4 py-2">Status</th>
    //           <th className="border border-gray-200 px-4 py-2">Photo</th>
    //           <th className="border border-gray-200 px-4 py-2">Batch</th>
    //           <th className="border border-gray-200 px-4 py-2">Student Name</th>
    //           <th className="border border-gray-200 px-4 py-2">Course Interested</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {students.map((student, index) => (
    //           <tr key={student._id}>
    //             <td className="border border-gray-200 px-4 py-2">{index + 1}</td>
    //             <td className="border border-gray-200 px-4 py-2">
    //               <button
    //                 className="bg-teal-500 text-white p-2 rounded mr-2 hover:bg-teal-600"
    //                 onClick={() => handleEdit(student._id)}
    //               >
    //                 ✏️
    //               </button>
    //               <button
    //                 className="bg-yellow-500 text-white p-2 rounded mr-2 hover:bg-yellow-600"
    //                 onClick={() => handleDownloadPDF(student._id)}
    //               >
    //                 📄
    //               </button>
    //               <button
    //                 className="bg-green-500 text-white p-2 rounded mr-2 hover:bg-green-600"
    //                 onClick={() => handleViewIDCard(student._id)}
    //               >
    //                 🆔
    //               </button>
    //               <button
    //                 className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
    //                 onClick={() => handleShare(student._id)}
    //               >
    //                 🔗
    //               </button>
    //             </td>
    //             <td className="border border-gray-200 px-4 py-2">
    //               <span className="bg-green-100 text-green-700 py-1 px-2 rounded">
    //                 Active
    //               </span>
    //             </td>
    //             <td className="border border-gray-200 px-4 py-2">
    //               <img
    //                 src={student.photo}
    //                 alt="Student"
    //                 className="w-10 h-10 rounded-full"
    //               />
    //             </td>
    //             <td className="border border-gray-200 px-4 py-2">{student.batch}</td>
    //             <td className="border border-gray-200 px-4 py-2">{student.name}</td>
    //             <td className="border border-gray-200 px-4 py-2">
    //               {student.courseInterested}
    //             </td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>
    // </div>
  );
};

export default StudentAdmissionList;
