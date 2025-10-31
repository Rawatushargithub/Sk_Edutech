import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Clock,
  DollarSign,
  Award,
  MapPin,
  CheckCircle,
  XCircle,
  User,
  Loader2,
  Receipt,
} from "lucide-react";
import API_BASE_URL from "../../config";
import axios from "axios";
import AdminFranchiseCourseList from "./AdminFranchiseCourses";

const CourseDetails = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [feeDetails, setFeeDetails] = useState([]);
  const [coursedetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentData = JSON.parse(localStorage.getItem("student"));

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        let studentId = studentData.studentId;
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/coursedetails/student/${studentId}`
        );
        if (res.data.success) {
          console.log("response data:: ", res.data.data);
          setStudentInfo(res.data.data.student);
          setFeeDetails(res.data.data.feeDetails);
          setCourseDetails(res.data.data.coursedetails);
        } else {
          setError("Course details not found");
        }
      } catch (err) {
        setError("Failed to fetch course details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (studentData?.studentId) {
      fetchCourseDetails();
    }
  }, [studentData?.studentId]);

  // Loading Component
  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <Loader2 className="w-6 h-6 text-sky-500 animate-spin absolute -bottom-2 -right-2 bg-white rounded-full p-1" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Loading Course Details
        </h3>
        <p className="text-gray-600">
          Please wait while we fetch your course information...
        </p>
      </div>
    </div>
  );

  // Error Component
  const ErrorScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;
  if (!studentInfo) return null;  // Remove feeDetails check since we're not using it anymore

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Student Information Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
          {/* Student Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {studentInfo.name}
              </h1>
              <p className="text-sky-600 text-lg">{studentInfo.course.courseName}</p>
            </div>
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ">
            <div className="bg-sky-50 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-2">Email</p>
              <p className="font-semibold text-gray-800 break-all">
                {studentInfo.email}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-2">Mobile</p>
              <p className="font-semibold text-gray-800">
                {studentInfo.mobile}
              </p>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-gradient-to-r from-green-50 shadow-2xl to-emerald-100 rounded-xl p-6 ">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Receipt className="w-6 h-6 text-green-600 mr-2" />
              Course Fee Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-1">Course Fees</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(feeDetails[0].courseFees)}
                </p>
              </div>
              <div className="text-center bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-1">Discount</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(feeDetails[0].discountAmount)}
                </p>
              </div>
              <div className="text-center bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-1">Total Fees</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(feeDetails[0].totalFees)}
                </p>
              </div>
            </div>
          </div>

          {/* Course Details Section - Add this below the Fee Summary section */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 text-sky-600 mr-2" />
              Course Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Course Overview */}
              <div>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Overview</h3>
                  <div className="space-y-4">
                    <div className="bg-sky-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Course Name</p>
                      <p className="font-semibold text-gray-800">{coursedetails?.courseName}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Course Code</p>
                      <p className="font-semibold text-gray-800">{coursedetails?.courseCode}</p>
                    </div>
                    <div className="bg-sky-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <p className="font-semibold text-gray-800">{coursedetails?.courseDuration} months</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Eligibility</p>
                      <p className="font-semibold text-gray-800">{coursedetails?.courseEligibility}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Syllabus */}
              <div>
                <div className="bg-sky-50 rounded-xl p-6 h-full">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Syllabus</h3>
                  <div className="space-y-3">
                    {coursedetails?.courseSyllabus?.split('\r\n').map((item, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-gray-700">{item.trim()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Subjects */}
            {coursedetails?.courseSubject && (
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Subjects Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {coursedetails.courseSubject.split(', ').map((subject, index) => (
                    <span
                      key={index}
                      className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                    >
                      {subject.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
      <AdminFranchiseCourseList />
    </div>
  );
};

export default CourseDetails;

// import React, { useEffect, useState } from "react";
// import {
//   BookOpen,
//   Clock,
//   DollarSign,
//   Award,
//   MapPin,
//   CheckCircle,
//   XCircle,
//   User,
//   Loader2,
// } from "lucide-react";
// import API_BASE_URL from "../../config";
// import axios from "axios";
// import AdminFranchiseCourseList from "./AdminFranchiseCourses";

// const CourseDetails = () => {
//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const studentData = JSON.parse(localStorage.getItem("student"));
//   const courseCode = studentData?.courseCode || "";

//   useEffect(() => {
//     const fetchCourse = async () => {
//       try {
//         setLoading(true);
//         await new Promise((resolve) => setTimeout(resolve, 800));
//         let studentId = studentData.studentId;
//         const res = await axios.get(
//           `${API_BASE_URL}/api/v1/coursedetails/student/${studentId}`
//         );
//         if (res.data.success) {
//           console.log("response data:: ",res.data.data)
//           setCourse(res.data.data[0]);
//         } else {
//           setError("Course not found");
//         }
//       } catch (err) {
//         setError("Failed to fetch course details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (courseCode) {
//       fetchCourse();
//     }
//   }, [courseCode]);

//   // Loading Component
//   const LoadingScreen = () => (
//     <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//         <div className="relative mb-6">
//           <div className="w-20 h-20 mx-auto bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
//             <BookOpen className="w-10 h-10 text-white" />
//           </div>
//           <Loader2 className="w-6 h-6 text-sky-500 animate-spin absolute -bottom-2 -right-2 bg-white rounded-full p-1" />
//         </div>
//         <h3 className="text-xl font-semibold text-gray-800 mb-2">
//           Loading Course Details
//         </h3>
//         <p className="text-gray-600">
//           Please wait while we fetch your course information...
//         </p>
//       </div>
//     </div>
//   );

//   // Error Component
//   const ErrorScreen = () => (
//     <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//         <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
//           <XCircle className="w-10 h-10 text-red-500" />
//         </div>
//         <h3 className="text-xl font-semibold text-gray-800 mb-2">
//           Oops! Something went wrong
//         </h3>
//         <p className="text-red-600 mb-4">{error}</p>
//         <button
//           onClick={() => window.location.reload()}
//           className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200"
//         >
//           Try Again
//         </button>
//       </div>
//     </div>
//   );

//   if (loading) return <LoadingScreen />;
//   if (error) return <ErrorScreen />;
//   if (!course) return null;

//   const getStatusIcon = (status) =>
//     status === "active" ? (
//       <CheckCircle className="w-5 h-5 text-green-500" />
//     ) : (
//       <XCircle className="w-5 h-5 text-red-500" />
//     );

//   const getStatusBadge = (status) =>
//     status === "active"
//       ? "bg-green-100 text-green-800"
//       : "bg-red-100 text-red-800";

//   const formatCurrency = (amount) =>
//     new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       maximumFractionDigits: 0,
//     }).format(amount);

//   const discount = course.courseMRP - course.courseFees;
//   const discountPercentage = Math.round((discount / course.courseMRP) * 100);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-12 px-4">
//       <div className="max-w-6xl mx-auto">
//         {/* Card Container */}
//         <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
//           {/* Title */}
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
//             {course.courseName}
//           </h1>
//           <p className="text-sky-600 text-lg mb-10 text-center">
//             {course.courseSubject}
//           </p>

//           {/* Top Layout: Image + Details */}
//           <div className="flex flex-col lg:flex-row items-start gap-10">
//             {/* Left - Thumbnail */}
//             <div className="w-full lg:w-[380px] h-[260px] rounded-xl overflow-hidden shadow-md flex-shrink-0">
//               {course.courseImage ? (
//                 <img
//                   src={course.courseImage}
//                   alt={course.courseName}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="bg-sky-100 w-full h-full flex items-center justify-center">
//                   <BookOpen className="w-16 h-16 text-sky-500" />
//                 </div>
//               )}
//             </div>

//             {/* Right - Course Information */}
//             <div className="flex-1 space-y-6">
//               {/* Quick Info */}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
//                 <div>
//                   <p className="text-sm text-gray-600 flex items-center gap-2">
//                     <Award className="w-4 h-4 text-sky-600" /> Code
//                   </p>
//                   <p className="font-semibold text-gray-800">
//                     {course.courseCode}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600 flex items-center gap-2">
//                     <Clock className="w-4 h-4 text-sky-600" /> Duration
//                   </p>
//                   <p className="font-semibold text-gray-800">
//                     {course.courseDuration} months
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600 flex items-center gap-2">
//                     <MapPin className="w-4 h-4 text-sky-600" /> Franchise
//                   </p>
//                   <p className="font-semibold text-gray-800">
//                     {course.franchiseId}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600 flex items-center gap-2">
//                     {getStatusIcon(course.instituteStatus)} Status
//                   </p>
//                   <span
//                     className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadge(
//                       course.instituteStatus
//                     )}`}
//                   >
//                     {course.instituteStatus}
//                   </span>
//                 </div>
//               </div>

//               {/* Pricing */}
//               <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-6 shadow-sm">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
//                   Course Fees
//                 </h3>
//                 <div className="grid grid-cols-3 text-center">
//                   <div>
//                     <p className="text-xs text-gray-500">MRP</p>
//                     <p className="text-sm font-bold text-red-500 line-through">
//                       {formatCurrency(course.courseMRP)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">Discounted</p>
//                     <p className="text-lg font-bold text-green-600">
//                       {formatCurrency(course.courseFees)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">You Save</p>
//                     <p className="text-sm font-bold text-emerald-600">
//                       {formatCurrency(discount)} ({discountPercentage}%)
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Bottom Section: Syllabus & Eligibility */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
//             {/* Syllabus */}
//             <div className="bg-sky-50 rounded-xl p-6 text-gray-700 shadow-sm">
//               <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <BookOpen className="w-6 h-6 text-sky-600 mr-2" /> Syllabus
//               </h3>
//               <p className="leading-relaxed whitespace-pre-line">
//                 {course.courseSyllabus || "Not available"}
//               </p>
//             </div>

//             {/* Eligibility */}
//             <div className="bg-blue-50 rounded-xl p-6 text-gray-700 shadow-sm">
//               <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <User className="w-6 h-6 text-blue-600 mr-2" /> Eligibility
//               </h3>
//               <p className="leading-relaxed whitespace-pre-line">
//                 {course.courseEligibility || "Not provided"}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//       <AdminFranchiseCourseList />
//     </div>
//   );
// };

// export default CourseDetails;
