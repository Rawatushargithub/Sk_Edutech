import React, { useState } from "react";

const StudentProfile = ({ student, onClose, onEdit, onViewForm, onViewIDCard, onShare }) => {
  // Handle edit with student data
  const handleEditProfile = () => {
    // Store student data in localStorage as fallback
    localStorage.setItem('editStudentData', JSON.stringify(student));
    // Call the onEdit function from parent with student data
    if (onEdit) {
      onEdit(student.id);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-opacity-100 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Profile Card */}
      <div className="relative bg-gray-100 rounded-2xl shadow-2xl w-full max-w-sm mx-4 z-10 overflow-hidden">
        {/* Header with gradient */}
        <div className="h-14">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-black hover:text-gray-200 cursor-pointer transition-colors"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Profile Image */}
        <div className="flex justify-center -mt-12">
          <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
            <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
              {student.studentPhoto ? (
                <img
                  src={student.studentPhoto}
                  alt={student.studentName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-4">
          {/* Name and Status */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {student.studentName || "Student Name"}
            </h2>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                student.status 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}
            >
              {student.status ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Details Grid */}
          <div className="mb-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Mobile</span>
              <span className="text-sm text-gray-800">{student.studentMobile || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <span className="text-sm text-gray-800 truncate ml-2">{student.email || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Course</span>
              <span className="text-sm text-gray-800">{student.courseInterested?.courseName || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Batch</span>
              <span className="text-sm text-gray-800">{student.batch || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Username</span>
              <span className="text-sm text-gray-800">{student.username || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <span className="text-sm text-gray-800">{student.username || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Admission Date</span>
              <span className="text-sm text-gray-800">{student.admissionDate || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">Referral Code</span>
              <span className="text-sm text-gray-800">{student.referralCode || "N/A"}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            {/* Certificate Button */}
            <button className="w-full py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Certificate
            </button>

            {/* Icon Buttons */}
            <div className="flex justify-center space-x-3">
              <button
                className="flex items-center justify-center w-10 h-10 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                onClick={onViewForm}
                title="View Form"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <button
                className="flex items-center justify-center w-10 h-10 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                onClick={onViewIDCard}
                title="View ID Card"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </button>
              
              <button
                className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={onShare}
                title="Share"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

// import React, { useState } from "react";

// const StudentProfile = ({ student, onClose, onEdit, onViewForm, onViewIDCard, onShare }) => {
//   // Handle edit with student data
//   const handleEditProfile = () => {
//     // Store student data in localStorage as fallback
//     localStorage.setItem('editStudentData', JSON.stringify(student));
//     // Call the onEdit function from parent with student data
//     if (onEdit) {
//       onEdit(student.id);
//     }
//   };
  
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       {/* Overlay */}
//       <div
//         className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
//         onClick={onClose}
//       ></div>

//       {/* Profile Card */}
//       <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-300px mx-4 z-10 overflow-hidden">
//         {/* Header with gradient */}
//         <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-28 relative">
//           {/* Close Button */}
//           <button
//             className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
//             onClick={onClose}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>

//         {/* Profile Image */}
//         <div className="flex justify-center -mt-12">
//           <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
//             <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
//               {student.studentPhoto ? (
//                 <img
//                   src={student.studentPhoto}
//                   alt={student.studentName}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-gray-400">
//                   <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
//                   </svg>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Profile Content */}
//         <div className="px-6 pb-6 pt-4">
//           {/* Name and Status */}
//           <div className="text-center mb-6">
//             <h2 className="text-xl font-bold text-gray-800 mb-2">
//               {student.studentName || "Student Name"}
//             </h2>
//             <span
//               className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
//                 student.status 
//                   ? "bg-green-100 text-green-800" 
//                   : "bg-red-100 text-red-800"
//               }`}
//             >
//               {student.status ? "Active" : "Inactive"}
//             </span>
//           </div>

//           {/* Details Grid */}
//           <div className="space-y-3 mb-6">
//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-600">Mobile</span>
//               <span className="text-sm text-gray-800">{student.studentMobile || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-600">Email</span>
//               <span className="text-sm text-gray-800 truncate ml-2">{student.email || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-600">Course</span>
//               <span className="text-sm text-gray-800">{student.courseInterested?.courseName || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-600">Batch</span>
//               <span className="text-sm text-gray-800">{student.batch || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-600">Username</span>
//               <span className="text-sm text-gray-800">{student.username || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-600">Password</span>
//               <span className="text-sm text-gray-800">{student.username || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-600">Admission Date</span>
//               <span className="text-sm text-gray-800">{student.admissionDate || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2">
//               <span className="text-sm font-medium text-gray-600">Referral Code</span>
//               <span className="text-sm text-gray-800">{student.referralCode || "N/A"}</span>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-col space-y-3">
//             {/* Certificate Button */}
//             <button className="w-full py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
//               Certificate
//             </button>

//             {/* Icon Buttons */}
//             <div className="flex justify-center space-x-3">
//               <button
//                 className="flex items-center justify-center w-10 h-10 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
//                 onClick={onViewForm}
//                 title="View Form"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//               </button>
              
//               <button
//                 className="flex items-center justify-center w-10 h-10 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
//                 onClick={onViewIDCard}
//                 title="View ID Card"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
//                 </svg>
//               </button>
              
//               <button
//                 className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                 onClick={onShare}
//                 title="Share"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentProfile;

// import React, { useState } from "react";

// const StudentProfile = ({ student, onClose, onEdit , onViewForm , onViewIDCard , onShare}) => {

//   // Handle edit with student data
//   const handleEditProfile = () => {
//     // Store student data in localStorage as fallback
//     localStorage.setItem('editStudentData', JSON.stringify(student));
//     // Call the onEdit function from parent with student data
//     if (onEdit) {
//       onEdit(student.id);
//     }
//   };
  
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       {/* Overlay with blur effect */}
//       <div
//         className="absolute inset-0 bg-grey-300 bg-opacity-50 backdrop-blur-sm"
//         onClick={onClose}
//       ></div>

//       {/* Profile Card */}
//       <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 z-10">
//         {/* Profile Header */}
//         <div className="bg-black h-40 rounded-t-lg"></div>

//         {/* Profile Image */}
//         <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
//           <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white overflow-hidden">
//             {student.studentPhoto ? (
//               <img
//                 src={student.studentPhoto}
//                 alt={student.studentName}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center text-gray-500">
//                 No Image
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Close Button */}
//         <button
//           className="absolute top-3 right-3 text-white bg-red-500 rounded-full p-1"
//           onClick={onClose}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-6 w-6"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         </button>

//         {/* Profile Content */}
//         <div className="pt-16 pb-6 px-6">
//           <h2 className="text-2xl font-bold text-center mb-6">
//             {student.studentName || "Student Name"}
//           </h2>

//           <div className="space-y-4">
//             <div className="flex">
//               <div className="w-1/2 font-semibold">Mobile No:</div>
//               <div className="w-1/2">{student.studentMobile || "N/A"}</div>
//             </div>

//             <div className="flex">
//               <div className="w-1/2 font-semibold">E-Mail:</div>
//               <div className="w-1/2">{student.email || "N/A"}</div>
//             </div>

//             <div className="flex">
//               <div className="w-1/2 font-semibold">Course:</div>
//               <div className="w-1/2">{student.courseInterested.courseName || "N/A"}</div>
//             </div>

//             <div className="flex">
//               <div className="w-1/2 font-semibold">Batch:</div>
//               <div className="w-1/2">{student.batch || "N/A"}</div>
//             </div>

//             <div className="flex">
//               <div className="w-1/2 font-semibold">Username:</div>
//               <div className="w-1/2">{student.username || "N/A"}</div>
//             </div>

//             <div className="flex">
//               <div className="w-1/2 font-semibold">Password:</div>
//               <div className="w-1/2">{student.username || "N/A"}</div>
//             </div>

//             <div className="flex">
//               <div className="w-1/2 font-semibold">Admission Date:</div>
//               <div className="w-1/2">{student.admissionDate || "N/A"}</div>
//             </div>

//             <div className="flex">
//               <div className="w-1/2 font-semibold">Referral Code:</div>
//               <div className="w-1/2">{student.referralCode || "N/A"}</div>
//             </div>

//             <div className="flex">
//               <div className="w-1/2 font-semibold">Status:</div>
//               <div className="w-1/2">
//                 <span
//                   className={`px-2 py-1 rounded text-white ${
//                     student.status ? "bg-green-500" : "bg-red-500"
//                   }`}
//                 >
//                   {student.status ? "Active" : "Inactive"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="mt-8 flex justify-center space-x-4">
//             {/* <button
//               className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
//               onClick={handleEditProfile}
//             >
//               Edit Profile
//             </button> */}

//             <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition">
//               Certificate
//             </button>

//             {/* <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition">
//               Reset Password
//             </button> */}
                
//           <div className="flex">
//           <button
//               className="bg-yellow-500 text-white p-2 rounded mr-2 hover:bg-yellow-600"
//               onClick={onViewForm}
//             >
//               📄
//             </button>
//             <button
//               className="bg-green-500 text-white p-2 rounded mr-2 hover:bg-green-600"
//               onClick={onViewIDCard}
//             >
//               🆔
//             </button>
//             <button
//               className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
//               onClick={onShare}
//             >
//               🔗
//             </button>
//           </div>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default StudentProfile;
