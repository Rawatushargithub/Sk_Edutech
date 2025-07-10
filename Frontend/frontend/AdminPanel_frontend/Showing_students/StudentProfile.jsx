import React, { useState } from "react";
import StudentFormView from "../../AdminPanel_frontend/Showing_students/StudentFormView";

const StudentProfile = ({
  student,
  onClose,
  onEdit,
  onViewIDCard,
  onShare,
}) => {
  const [showFormView, setShowFormView] = useState(false);

  // Handle edit with student data
  const handleEditProfile = () => {
    // Call the onEdit function from parent with student data
    if (onEdit) {
      onEdit(student.id);
    }
  };

  // Handle view form
  const handleViewForm = () => {
    setShowFormView(true);
  };

  // Handle close form view
  const handleCloseFormView = () => {
    setShowFormView(false);
  };

  return (
    <>
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
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
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
              <h2 className="text-xl font-bold text-gray-800">
                {student.studentName || "Student Name"}
              </h2>
              <div className={`font-medium text-gray-400 mb-2`}>{student.rollNumber}</div>
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
                <span className="text-sm font-medium text-gray-700">
                  Mobile
                </span>
                <span className="text-sm text-gray-800">
                  {student.studentMobile || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <span className="text-sm text-gray-800 truncate ml-2">
                  {student.email || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  Course
                </span>
                <span className="text-sm text-gray-800">
                  {student.courseInterested?.courseName || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Batch</span>
                <span className="text-sm text-gray-800">
                  {student.batch || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  Username
                </span>
                <span className="text-sm text-gray-800">
                  {student.username || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  Password
                </span>
                <span className="text-sm text-gray-800">
                  {student.username || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  Admission Date
                </span>
                <span className="text-sm text-gray-800">
                  {student.admissionDate || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">
                  Referral Code
                </span>
                <span className="text-sm text-gray-800">
                  {student.referralCode || "N/A"}
                </span>
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
                  onClick={handleViewForm}
                  title="View Form"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>

                <button
                  className="flex items-center justify-center w-10 h-10 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  onClick={onViewIDCard}
                  title="View ID Card"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </button>

                <button
                  className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={onShare}
                  title="Share"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Form View Modal */}
      {showFormView && (
        <StudentFormView student={student} onClose={handleCloseFormView} />
      )}
    </>
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
//         className="absolute inset-0 bg-opacity-100 backdrop-blur-sm"
//         onClick={onClose}
//       ></div>

//       {/* Profile Card */}
//       <div className="relative bg-gray-100 rounded-2xl shadow-2xl w-full max-w-sm mx-4 z-10 overflow-hidden">
//         {/* Header with gradient */}
//         <div className="h-14">
//           {/* Close Button */}
//           <button
//             className="absolute top-4 right-4 text-black hover:text-gray-200 cursor-pointer transition-colors"
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
//           <div className="mb-4">
//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-700">Mobile</span>
//               <span className="text-sm text-gray-800">{student.studentMobile || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-700">Email</span>
//               <span className="text-sm text-gray-800 truncate ml-2">{student.email || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-700">Course</span>
//               <span className="text-sm text-gray-800">{student.courseInterested?.courseName || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-700">Batch</span>
//               <span className="text-sm text-gray-800">{student.batch || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-700">Username</span>
//               <span className="text-sm text-gray-800">{student.username || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-700">Password</span>
//               <span className="text-sm text-gray-800">{student.username || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2 border-b border-gray-100">
//               <span className="text-sm font-medium text-gray-700">Admission Date</span>
//               <span className="text-sm text-gray-800">{student.admissionDate || "N/A"}</span>
//             </div>

//             <div className="flex items-center justify-between py-2">
//               <span className="text-sm font-medium text-gray-700">Referral Code</span>
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
