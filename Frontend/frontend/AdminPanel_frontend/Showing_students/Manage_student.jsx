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
import { FaArrowUp, FaUser, FaSearch, FaTimes } from "react-icons/fa";

const StudentAdmissionList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [showIdCardPopup, setShowIdCardPopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Then modify your useEffect fetch to ensure you're setting an array
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/admin_student/get_students`
        );
        console.log("students data 1 :: ", response.data);

        // Check if response.data is an array, if not, handle appropriately
        if (Array.isArray(response.data)) {
          setStudents(response.data);
          setFilteredStudents(response.data);
        } else if (response.data && typeof response.data === "object") {
          // If response.data is an object that contains the array (common API pattern)
          // For example, if your API returns {data: [...students]}
          const studentsArray =
            response.data.data || response.data.students || [];
          setStudents(studentsArray);
          setFilteredStudents(studentsArray);
        } else {
          console.error("Unexpected response format:", response.data);
          setStudents([]);
          setFilteredStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
        setFilteredStudents([]);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.franchiseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setFilteredStudents(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, students]);
 console.log("Filtered Students: ", filteredStudents);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  useEffect(() => {
    // Simulate fetching from backend
    console.log("updated Student data :: ", filteredStudents);
  }, []);

  const totalPages =
    filteredStudents && filteredStudents.length
      ? Math.ceil(filteredStudents.length / entriesPerPage)
      : 0;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = Array.isArray(filteredStudents)
    ? filteredStudents.slice(startIndex, startIndex + entriesPerPage)
    : [];

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const previousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // toggle the state of student active or not
  
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
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="flex items-center">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Franchise ID or Student Name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Export Button */}
            <button className="bg-sky-900 flex text-white font-medium px-4 py-2 rounded-md cursor-pointer">
              Export <span className="text-md ml-1">▲</span>
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredStudents.length > 0 ? (
              <span>Found {filteredStudents.length} student(s) with Franchise ID or Student Name containing "{searchTerm}"</span>
            ) : (
              <span className="text-red-600">No students found with Franchise ID or Student Name containing "{searchTerm}"</span>
            )}
          </div>
        )}

        <div className="w-full overflow-auto max-h-[550px] border border-gray-300 rounded-md">
          <table className="w-[1400px] border-collapse border-gray-300">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">S/N</th>
                <th className="border border-gray-300 px-4 py-2">FranchiseId</th>
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
              {currentEntries.length > 0 ? (
                currentEntries.map((student, index) => (
                  <tr key={student._id} className="text-center border w-96">
                    <td className="border border-gray-300 px-4 py-2">
                      {startIndex + index + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.franchiseId}
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
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                    {searchTerm ? "No students found matching your search." : "No students found."}
                  </td>
                </tr>
              )}
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
// import { FaCircleCheck, FaPerson, FaPersonCirclePlus, FaPersonDotsFromLine, FaPersonRifle } from "react-icons/fa6";
// import { FaArrowUp, FaUser } from "react-icons/fa";

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
//           `${API_BASE_URL}/api/v1/admin_student/get_students`
//         );
//         console.log("students data 1 :: ", response.data);

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


//   return (
//     <div className="min-h-full bg-blue-50">
//       <div className="mx-auto bg-white p-6 rounded-2xl shadow">
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-bold">List Student Admission</h1>
//           <div >
//             <button className="bg-sky-900 flex text-white font-medium px-4 py-2 rounded-md cursor-pointer">
//               Export <span className="text-md ml-1">▲</span>
             
//             </button>
//           </div>
//         </div>

//         <div className="w-full overflow-auto max-h-[550px] border border-gray-300 rounded-md">
//           <table className="w-[1400px] border-collapse border-gray-300">
//             <thead className="sticky top-0 bg-gray-100">
//               <tr>
//                 <th className="border border-gray-300 px-4 py-2">S/N</th>
//                  <th className="border border-gray-300 px-4 py-2">FranchiseId</th>
//                 <th className="border border-gray-300 px-4 py-2">Action</th>
//                 <th className="border border-gray-300 px-4 py-2">Status</th> 
//                 <th className="border border-gray-300 px-4 py-2">
//                   Student Name
//                 </th>
//                  <th className="border border-gray-300 px-4 py-2">Student ID</th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Course Name
//                 </th>
//                  <th className="border border-gray-300 px-4 py-2">
//                   Course ID
//                 </th>
//                 <th className="border border-gray-300 px-4 py-2">Mobile</th>
//                 <th className="border border-gray-300 px-4 py-2">
//                   Referral Code
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
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.franchiseId}
//                   </td>
//                   <td className="border-gray-500 px-4 py-2 flex justify-center gap-2">
//                     <button
//                       className="bg-sky-800 text-white p-2 rounded-md text-sm font-medium"
//                       onClick={() => handleViewProfile(student)}
//                     >
//                       <FaUser className="w-8 h-8 items-center"/>
//                     </button>
//                   </td>
                  
//                   <td className="p-2 border">
//                     <button 
                      
//                       className={`px-2 py-1 rounded-full text-sm font-medium  ${
//                         student.status ? "bg-green-200 text-green-800 " : "bg-red-200 text-red-800"
//                       }`}
//                     >
                      
//                       {student.status ? "Active" : "Inactive"}
//                     </button>
//                   </td>                
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.studentName}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.rollNumber}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.courseInterested.courseName}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.courseInterested.courseCode}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.studentMobile}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2">
//                     {student.referralCode}
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
