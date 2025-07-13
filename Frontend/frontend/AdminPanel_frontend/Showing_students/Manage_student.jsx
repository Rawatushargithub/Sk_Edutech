// Import necessary dependencies
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StudentProfile from "./StudentProfile"; // Import the new component
import FormView from "./FormView";
import IdCardView from "./IdCardView";
import SharePopup from "./SharePopup";
import API_BASE_URL from "../../config";
import { FaCircleCheck, FaPerson, FaPersonCirclePlus, FaPersonDotsFromLine, FaPersonRifle } from "react-icons/fa6";
import { FaArrowUp, FaUser } from "react-icons/fa";

const StudentAdmissionList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [showIdCardPopup, setShowIdCardPopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);

  // Then modify your useEffect fetch to ensure you're setting an array
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/admin_student/get_students`
        );
        console.log("students data :: ", response.data);

        // Check if response.data is an array, if not, handle appropriately
        if (Array.isArray(response.data)) {
          setStudents(response.data);
        } else if (response.data && typeof response.data === "object") {
          // If response.data is an object that contains the array (common API pattern)
          // For example, if your API returns {data: [...students]}
          const studentsArray =
            response.data.data || response.data.students || [];
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
    console.log("updated Student data :: ", students);
  }, []);

  const totalPages =
    students && students.length
      ? Math.ceil(students.length / entriesPerPage)
      : 0;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = Array.isArray(students)
    ? students.slice(startIndex, startIndex + entriesPerPage)
    : [];

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
      await axios.patch(`/api/v1/institute_students/students/${id}`, {
        status: !students.find((student) => student.id === id).status,
      });
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };
  // Handle showing student profile popup
  const handleViewProfile = (students) => {
    setSelectedStudent(students);
    setShowProfilePopup(true);
  };

  const handleViewForm = () => {
    setShowFormPopup(true);
    console.log("view form is working");
  };

  const handleViewIDCard = () => {
    setShowIdCardPopup(true);
    console.log("view idis working");
  };

  const handleShare = () => {
    console.log("handleshare is working");
    setShowSharePopup(true);
  };

  const closePopup = () => {
    setShowFormPopup(false);
    setShowIdCardPopup(false);
    setShowSharePopup(false);
    setShowProfilePopup(false);
    setSelectedStudent(null);
  };

  const handleEditProfileNavigate = () => {
    // Find selected student
    const studentID = selectedStudent._id;
    const studentToEdit = students.find((s) => s._id === studentID);

    if (studentToEdit) {
      // Store in localStorage for persistence
      localStorage.setItem("editStudentData", JSON.stringify(studentToEdit));
      // Navigate to edit page with student ID
      navigate(`/institute/edit-student/${studentID}`);
    } else {
      console.error("Student not found with ID:", studentId);
    }
  };


  return (
    <div className="min-h-full bg-blue-50">
      <div className="mx-auto bg-white p-6 rounded-2xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">List Student Admission</h1>
          <div >
            <button className="bg-sky-900 flex text-white font-medium px-4 py-2 rounded-md cursor-pointer">
              Export <span className="text-md ml-1">▲</span>
             
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
                <th className="border border-gray-300 px-4 py-2">
                  Student Name
                </th>
                 <th className="border border-gray-300 px-4 py-2">Student ID</th>
                <th className="border border-gray-300 px-4 py-2">
                  Course Name
                </th>
                 <th className="border border-gray-300 px-4 py-2">
                  Course ID
                </th>
                <th className="border border-gray-300 px-4 py-2">Mobile</th>
                <th className="border border-gray-300 px-4 py-2">
                  Referral Code
                </th>
                
                <th className="border border-gray-300 px-4 py-2">
                  Admission Date
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((student, index) => (
                <tr key={student._id} className="text-center border w-96">
                  <td className="border border-gray-300 px-4 py-2">
                    {startIndex + index + 1}
                  </td>
                  <td className="border-gray-500 px-4 py-2 flex justify-center gap-2">
                    <button
                      className="bg-sky-800 text-white p-2 rounded-md text-sm font-medium"
                      onClick={() => handleViewProfile(student)}
                    >
                      <FaUser className="w-8 h-8 items-center"/>
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button 
                      onClick={() => handleStatusToggle(student.id)}
                      className={`px-2 py-1 rounded-full text-sm font-medium  ${
                        student.status ? "bg-green-200 text-green-800 " : "bg-red-200 text-red-800"
                      }`}
                    >
                      {student.status ? "Active" : "Inactive"}
                    </button>
                  </td>                
                  <td className="border border-gray-300 px-4 py-2">
                    {student.studentName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.rollNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.courseInterested.courseName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.courseInterested.courseCode}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.studentMobile}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.referralCode}
                  </td>
                  
                  <td className="border border-gray-300 px-4 py-2">
                    {student.admissionDate}
                  </td>
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
      {/* Student Profile Popup */}
      {showProfilePopup && selectedStudent && (
        <StudentProfile
          student={selectedStudent}
          onClose={closePopup}
          onViewForm={handleViewForm}
          onViewIDCard={handleViewIDCard}
          onShare={handleShare}
          onEdit={handleEditProfileNavigate}
        />
      )}

      {showFormPopup && (
        <FormView 
        student={selectedStudent} 
        onClose={closePopup} 
        />
      )}
      {showIdCardPopup && (
        <IdCardView 
        student={selectedStudent} 
        onClose={closePopup} 
        />
      )}
      {showSharePopup && (
        <SharePopup 
        student={selectedStudent} 
        onClose={closePopup} 
        />
      )}
    </div>
  );
};

export default StudentAdmissionList;

// // Import necessary dependencies
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import StudentProfile from "./StudentProfile"; // Import the new component
// import FormView from "./FormView";
// import IdCardView from "./IdCardView";
// import SharePopup from "./SharePopup";
// import API_BASE_URL from "../../config";

// const StudentAdmissionList = () => {
//   const navigate = useNavigate();
//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [showProfilePopup, setShowProfilePopup] = useState(false);
//   const [showFormPopup, setShowFormPopup] = useState(false);
//   const [showIdCardPopup, setShowIdCardPopup] = useState(false);
//   const [showSharePopup, setShowSharePopup] = useState(false);

//   // Then modify your useEffect fetch to ensure you're setting an array
//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/api/v1/institute_student/get_students`
//         );
//         console.log("students data :: ", response.data);

//         // Check if response.data is an array, if not, handle appropriately
//         if (Array.isArray(response.data)) {
//           setStudents(response.data);
//         } else if (response.data && typeof response.data === "object") {
//           // If response.data is an object that contains the array (common API pattern)
//           // For example, if your API returns {data: [...students]}
//           const studentsArray =
//             response.data.data || response.data.students || [];
//           setStudents(studentsArray);
//         } else {
//           console.error("Unexpected response format:", response.data);
//           setStudents([]);
//         }
//       } catch (error) {
//         console.error("Error fetching students:", error);
//         setStudents([]);
//       }
//     };

//     fetchStudents();
//   }, []);

//   const [currentPage, setCurrentPage] = useState(1);
//   const entriesPerPage = 10;

//   useEffect(() => {
//     // Simulate fetching from backend
//     console.log("updated Student data :: ", students);
//   }, []);

//   const totalPages =
//     students && students.length
//       ? Math.ceil(students.length / entriesPerPage)
//       : 0;
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentEntries = Array.isArray(students)
//     ? students.slice(startIndex, startIndex + entriesPerPage)
//     : [];

//   const nextPage = () => {
//     if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
//   };

//   const previousPage = () => {
//     if (currentPage > 1) setCurrentPage((prev) => prev - 1);
//   };

//   // toggle the state of student active or not
//   const handleStatusToggle = async (id) => {
//     const confirmChange = window.confirm(
//       "Are you sure you want to change the status?"
//     );
//     if (!confirmChange) return;

//     // Update status locally
//     const updatedStudents = students.map((student) => {
//       if (student.id === id) {
//         return { ...student, status: !student.status };
//       }
//       return student;
//     });

//     setStudents(updatedStudents);

//     // Send updated status to backend
//     try {
//       await axios.patch(`/api/v1/institute_students/students/${id}`, {
//         status: !students.find((student) => student.id === id).status,
//       });
//     } catch (error) {
//       console.error("Error updating status: ", error);
//     }
//   };
//   // Handle showing student profile popup
//   const handleViewProfile = (students) => {
//     setSelectedStudent(students);
//     setShowProfilePopup(true);
//   };

//   const handleViewForm = () => {
//     setShowFormPopup(true);
//     console.log("view form is working");
//   };

//   const handleViewIDCard = () => {
//     setShowIdCardPopup(true);
//     console.log("view idis working");
//   };

//   const handleShare = () => {
//     console.log("handleshare is working");
//     setShowSharePopup(true);
//   };

//   const closePopup = () => {
//     setShowFormPopup(false);
//     setShowIdCardPopup(false);
//     setShowSharePopup(false);
//     setShowProfilePopup(false);
//     setSelectedStudent(null);
//   };

//   const handleEditProfileNavigate = () => {
//     // Find selected student
//     const studentID = selectedStudent._id;
//     const studentToEdit = students.find((s) => s._id === studentID);

//     if (studentToEdit) {
//       // Store in localStorage for persistence
//       localStorage.setItem("editStudentData", JSON.stringify(studentToEdit));
//       // Navigate to edit page with student ID
//       navigate(`/institute/edit-student/${studentID}`);
//     } else {
//       console.error("Student not found with ID:", studentId);
//     }
//   };

//   // Close profile popup
//   // const closeProfilePopup = () => {
//   //   setShowProfilePopup(false);
//   //   setSelectedStudent(null);
//   // };

//   return (
//     <div className="min-h-full bg-blue-50">
//       <div className="mx-auto bg-white p-6 rounded-2xl shadow">
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-bold">List Student Admission</h1>
//           <div>
//             <button className="bg-red-500 text-white px-4 py-2 rounded-2xl">
//               Export
//             </button>
//           </div>
//         </div>

//         <div className="w-full overflow-auto max-h-[550px] border border-gray-300 rounded-md">
//           <table className="w-[1400px] border-collapse border-gray-300">
//             <thead className="sticky top-0 bg-gray-100">
//               <tr>
//                 <th className="border border-gray-300 px-4 py-2">S/N</th>
//                 <th className="border border-gray-300 px-4 py-2">Action</th>
//                 <th className="border border-gray-300 px-4 py-2">Status</th>
//                 <th className="border border-gray-300 px-4 py-2">Photo</th>
//                 <th className="border border-gray-300 px-4 py-2">Batch</th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Student Name
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Course Interested
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">Username</th>
//                 <th className="border border-gray-300 px-4 py-2">Password</th>
//                 <th className="border border-gray-300 px-4 py-2">Mobile</th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Referral Code
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Referral Name
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Admission Date
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentEntries.map((student, index) => (
//                 <tr key={student._id} className="text-center border w-96">
//                   <td className="border border-gray-300 px-4 py-2">
//                     {startIndex + index + 1}
//                   </td>
//                   <td className="border-gray-500 px-4 py-2 flex justify-center gap-2">
//                     <button
//                       className="bg-blue-500 text-white p-2 rounded"
//                       onClick={() => handleViewProfile(student)}
//                     >
//                       👤 Profile
//                     </button>
//                   </td>
//                   <td className="p-2 border">
//                     <button 
//                       onClick={() => handleStatusToggle(student.id)}
//                       className={`px-2 py-1 rounded text-white ${
//                         student.status ? "bg-green-500" : "bg-red-500"
//                       }`}
//                     >
//                       {student.status ? "Active" : "Inactive"}
//                     </button>
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     <img
//                       src={student.studentPhoto}
//                       alt="student"
//                       className="w-10 h-10 rounded-full mx-auto"
//                     />
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.batch}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.studentName}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.courseInterested.courseName}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.username}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.password}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.studentMobile}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.referralCode}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.referralName}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.admissionDate}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Controls */}
//         <div className="flex justify-between items-center mt-4">
//           <button
//             onClick={previousPage}
//             disabled={currentPage === 1}
//             className={`p-2 rounded ${
//               currentPage === 1
//                 ? "bg-gray-300 cursor-not-allowed"
//                 : "bg-blue-500 text-white"
//             }`}
//           >
//             Previous
//           </button>
//           <span className="text-gray-700">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={nextPage}
//             disabled={currentPage === totalPages}
//             className={`p-2 rounded ${
//               currentPage === totalPages
//                 ? "bg-gray-300 cursor-not-allowed"
//                 : "bg-blue-500 text-white"
//             }`}
//           >
//             Next
//           </button>
//         </div> 
//       </div>
//       {/* Student Profile Popup */}
//       {showProfilePopup && selectedStudent && (
//         <StudentProfile
//           student={selectedStudent}
//           onClose={closePopup}
//           onViewForm={handleViewForm}
//           onViewIDCard={handleViewIDCard}
//           onShare={handleShare}
//           onEdit={handleEditProfileNavigate}
//         />
//       )}

//       {showFormPopup && (
//         <FormView 
//         student={selectedStudent} 
//         onClose={closePopup} 
//         />
//       )}
//       {showIdCardPopup && (
//         <IdCardView 
//         student={selectedStudent} 
//         onClose={closePopup} 
//         />
//       )}
//       {showSharePopup && (
//         <SharePopup 
//         student={selectedStudent} 
//         onClose={closePopup} 
//         />
//       )}
//     </div>
//   );
// };

// export default StudentAdmissionList;
