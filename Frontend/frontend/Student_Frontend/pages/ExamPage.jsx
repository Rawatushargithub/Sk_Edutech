// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//     Calendar,
//     Clock,
//     FileText,
//     Award,
//     CheckCircle,
//     Users,
//     Hash,
//     Trophy,
//     Medal,
//     Clock1,
//     Activity,
//     BookOpen,
//     Download,
//     Timer,
//     AlertCircle,
//     PlayCircle
// } from "lucide-react";
// import API_BASE_URL from "../../config";

// const ExamDetails = () => {
//     const [exams, setExams] = useState([]);
//     const [error, setError] = useState("");
//     const [downloadingAdmit, setDownloadingAdmit] = useState(null);
//     const [currentTime, setCurrentTime] = useState(new Date());
//     const navigate = useNavigate();

//     const storedStudent = localStorage.getItem("student");
//     const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;
//     const courseCode = parsedStudent?.courseCode;
//     const rollNumber = parsedStudent?.rollNumber;

//     // Update current time every minute
//     useEffect(() => {
//         const timer = setInterval(() => {
//             setCurrentTime(new Date());
//         }, 60000); // Update every minute

//         return () => clearInterval(timer);
//     }, []);

//     console.log("Roll No .", rollNumber);
//     useEffect(() => {
//         const fetchExams = async () => {
//             try {
//                 // Send POST request with roll number and course code
//                 const res = await fetch(`${API_BASE_URL}/api/exams/by-student-details`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         rollNumber: rollNumber,
//                         courseCode: courseCode
//                     })
//                 });

//                 const data = await res.json();
//                 if (res.ok) {
//                     setExams(data.exams);
//                     console.log("Exams fetched successfully:", data.exams);
//                 } else {
//                     setError(data.message || "Failed to fetch exams");
//                 }
//             } catch (err) {
//                 setError("Server error: " + (err.message || "An error occurred while fetching exams"));
//             }
//         };

//         if (courseCode && rollNumber) fetchExams();
//     }, [courseCode, rollNumber]);

//     // Helper function to convert time string (HH:MM) to minutes
//     const timeToMinutes = (timeStr) => {
//         if (!timeStr || typeof timeStr !== 'string') return 0; // or return null, or throw error
//         const [hours, minutes] = timeStr.split(':').map(Number);
//         return hours * 60 + minutes;
//     };

//     // Helper function to get current time in minutes
//     const getCurrentTimeInMinutes = () => {
//         const now = new Date();
//         return now.getHours() * 60 + now.getMinutes();
//     };

//     // Helper function to format minutes to time string
//     const minutesToTimeString = (minutes) => {
//         const hours = Math.floor(minutes / 60);
//         const mins = minutes % 60;
//         return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
//     };

//     // Function to format duration in a readable way
//     const formatDuration = (minutes) => {
//         const hours = Math.floor(minutes / 60);
//         const mins = minutes % 60;
//         if (hours > 0) {
//             return `${hours}h ${mins}m`;
//         }
//         return `${mins}m`;
//     };

//     // Check exam time status and get time information
//     const getExamTimeStatus = (exam) => {
//         const currentTime = getCurrentTimeInMinutes();
//         const examStartMinutes = timeToMinutes(exam.examStartTime);
//         const examEndMinutes = timeToMinutes(exam.examEndTime);

//         const minutesUntilStart = examStartMinutes - currentTime;
//         const minutesUntilEnd = examEndMinutes - currentTime;

//         let status, message, canTakeExam = false;
//         let timeInfo = null;

//         if (currentTime < examStartMinutes) {
//             status = "not_started";
//             message = `Exam starts in ${formatDuration(minutesUntilStart)}`;
//             timeInfo = {
//                 type: "warning",
//                 text: `Exam starts in: ${formatDuration(minutesUntilStart)}`,
//                 icon: AlertCircle
//             };
//         } else if (currentTime >= examStartMinutes && currentTime < examEndMinutes) {
//             status = "active";
//             message = "Exam can be taken now";
//             canTakeExam = true;
//             timeInfo = {
//                 type: "success",
//                 text: `Time remaining: ${formatDuration(minutesUntilEnd)}`,
//                 icon: CheckCircle
//             };
//         } else {
//             status = "ended";
//             message = "Exam time has ended";
//             timeInfo = {
//                 type: "error",
//                 text: "Exam time has ended",
//                 icon: AlertCircle
//             };
//         }

//         return {
//             status,
//             message,
//             canTakeExam,
//             timeInfo,
//             minutesUntilStart: Math.max(0, minutesUntilStart),
//             minutesUntilEnd: Math.max(0, minutesUntilEnd)
//         };
//     };

//     // Legacy function for batch timing display (keeping for compatibility)
//     const getTimeUntilExam = (examDate, examTime) => {
//         try {
//             // Extract start time (before the dash)
//             const startTimeRaw = examTime.split('-')[0].trim(); // "9AM"
//             console.log("Start time : ", startTimeRaw);

//             // Normalize time (e.g., 9AM -> 09:00 AM)
//             const normalizedTime = new Date(`1970-01-01T${parseTo24Hour(startTimeRaw)}`);
//             console.log("Normal time : ", normalizedTime);

//             if (isNaN(normalizedTime)) return "Invalid start time";

//             // Combine exam date and normalized time
//             const examDateTime = new Date(`${examDate}T${parseTo24Hour(startTimeRaw)}`);

//             const timeDiff = examDateTime.getTime() - new Date().getTime();
//             if (timeDiff <= 0) return "Exam time has started";

//             const totalMinutes = Math.floor(timeDiff / (1000 * 60));
//             const days = Math.floor(totalMinutes / (60 * 24));
//             const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
//             const minutes = totalMinutes % 60;

//             if (days > 0) {
//                 return `${days} day(s) ${hours} hour(s) ${minutes} minute(s) remaining`;
//             } else if (hours > 0) {
//                 return `${hours} hour(s) ${minutes} minute(s) remaining`;
//             } else {
//                 return `${minutes} minute(s) remaining`;
//             }
//         } catch (error) {
//             return "Invalid date/time";
//         }
//     };

//     // Helper to convert time like "9AM" to "09:00"
//     const parseTo24Hour = (timeStr) => {
//         const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
//         if (!match) return null;

//         let hour = parseInt(match[1]);
//         const minutes = match[2] ? parseInt(match[2]) : 0;
//         const period = match[3].toUpperCase();

//         if (period === "PM" && hour !== 12) hour += 12;
//         if (period === "AM" && hour === 12) hour = 0;

//         const hourStr = hour.toString().padStart(2, "0");
//         const minuteStr = minutes.toString().padStart(2, "0");

//         return `${hourStr}:${minuteStr}`;
//     };

//     const downloadAdmitCard = async (examId) => {
//         try {
//             const stringExamId = String(examId); // Ensure consistency
//             setDownloadingAdmit(stringExamId);
//             const encodedRollNumber = encodeURIComponent(rollNumber);

//             const response = await fetch(
//                 `${API_BASE_URL}/api/v1/admit-card/generate/${examId}/${encodedRollNumber}`,
//                 {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     }
//                 }
//             );

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to generate admit card');
//             }

//             const blob = await response.blob();
//             const url = window.URL.createObjectURL(blob);

//             const link = document.createElement('a');
//             link.href = url;
//             link.download = `admit-card-${examId}-${rollNumber}.pdf`;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);

//         } catch (error) {
//             console.error('Error downloading admit card:', error);
//             setError(error.message || 'Failed to download admit card');
//         } finally {
//             setDownloadingAdmit(null);
//         }
//     };

//     const getStatusIcon = (status) => {
//         switch (status?.toLowerCase()) {
//             case "active":
//                 return <Activity className="w-4 h-4 text-green-800" />;
//             case "scheduled":
//                 return <Calendar className="w-4 h-4 text-blue-900" />;
//             case "completed":
//                 return <CheckCircle className="w-4 h-4 text-blue-900" />;
//             default:
//                 return <Clock className="w-4 h-4 text-yellow-400" />;
//         }
//     };

//     const getStatusColor = (status) => {
//         switch (status?.toLowerCase()) {
//             case "active":
//                 return "text-green-400 border-blue-900";
//             case "scheduled":
//                 return "text-blue-900 bg-blue-900/20";
//             case "completed":
//                 return "text-blue-900 bg-blue-900/20";
//             default:
//                 return "text-yellow-400 bg-yellow-900/20";
//         }
//     };

//     const getTimeInfoStyle = (type) => {
//         switch (type) {
//             case "success":
//                 return "bg-green-100 border-green-300 text-green-800";
//             case "warning":
//                 return "bg-yellow-100 border-yellow-300 text-yellow-800";
//             case "error":
//                 return "bg-red-100 border-red-300 text-red-800";
//             default:
//                 return "bg-blue-100 border-blue-300 text-blue-800";
//         }
//     };

//     // Function to render exam results for both online and offline exams
//     const renderExamResults = (exam, studentResult, alreadyGiven) => {
//         if (!alreadyGiven) return null;

//         return (
//             <div className="bg-green-100 text-green-800 px-4 py-2 rounded space-y-1">
//                 <div className="flex items-center gap-2">
//                     <CheckCircle className="w-4 h-4" />
//                     {exam.examMode === "Online" 
//                         ? "You have already given this test." 
//                         : "Your exam result is available."}
//                 </div>
//                 <div className="border-1 border-blue-900 rounded-lg p-4 bg-white space-y-2 flex justify-between">
//                     <div className="flex items-center gap-3">
//                         <Award className="w-4 h-4 text-blue-900" />
//                         <div>
//                             <p className="text-sm text-blue-900">Marks Obtained</p>
//                             <p className="font-medium text-blue-900">{studentResult.marksObtained}</p>
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                         <Medal className="w-4 h-4 text-blue-900" />
//                         <div>
//                             <p className="text-sm text-blue-900">Status: </p>
//                             <p className="font-medium text-blue-900">{studentResult.status}</p>
//                         </div>
//                     </div>
//                     {studentResult.createdAt && (
//                         <div className="flex items-center gap-3">
//                             <Clock1 className="w-4 h-4 text-blue-900" />
//                             <div>
//                                 <p className="text-sm text-blue-900">
//                                     {exam.examMode === "Online" ? "Submitted At:" : "Result Date:"}
//                                 </p>
//                                 <p className="font-medium text-blue-900">
//                                     {new Date(studentResult.createdAt).toLocaleString()}
//                                 </p>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     // Function to render action buttons based on exam type and status
//     const renderExamActions = (exam, studentResult, alreadyGiven, examTimeStatus) => {
//         // Show results for both online and offline exams if student has given the exam
//         if (alreadyGiven) {
//             return renderExamResults(exam, studentResult, alreadyGiven);
//         }

//         // For online exams, show the "Give Test" button
//         if (exam.examMode === "Online" && exam.status === "Active") {
//             return (
//                 <button
//                     onClick={() => navigate(`/student/exam/give/${exam._id}`)}
//                     disabled={!examTimeStatus.canTakeExam}
//                     className={`mt-2 px-4 py-2 rounded flex items-center gap-2 transition-colors ${
//                         examTimeStatus.canTakeExam
//                             ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
//                             : 'bg-gray-400 text-gray-600 cursor-not-allowed'
//                     }`}
//                     title={
//                         !examTimeStatus.canTakeExam
//                             ? examTimeStatus.message
//                             : 'Click to start exam'
//                     }
//                 >
//                     {examTimeStatus.canTakeExam ? (
//                         <>
//                             <PlayCircle className="w-4 h-4" />
//                             Give Test
//                         </>
//                     ) : (
//                         <>
//                             <Clock className="w-4 h-4" />
//                             {examTimeStatus.status === 'not_started' && 'Exam Not Started'}
//                             {examTimeStatus.status === 'ended' && 'Exam Ended'}
//                             {examTimeStatus.status === 'insufficient_time' && 'Insufficient Time'}
//                         </>
//                     )}
//                 </button>
//             );
//         }

//         // For offline exams, show appropriate message
//         if (exam.examMode === "Offline") {
//             if (exam.status === "Active") {
//                 return (
//                     <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded">
//                         <div className="flex items-center gap-2">
//                             <Calendar className="w-4 h-4" />
//                             This is an offline exam. Please attend at the designated venue.
//                         </div>
//                     </div>
//                 );
//             } else if (exam.status === "Completed") {
//                 return (
//                     <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded">
//                         <div className="flex items-center gap-2">
//                             <CheckCircle className="w-4 h-4" />
//                             This offline exam has been completed. Results will be published soon.
//                         </div>
//                     </div>
//                 );
//             }
//         }

//         return null;
//     };

//     return (
//         <div className="min-h-screen p-6">
//             <div className="max-w-4xl mx-auto">
//                 <div className="mb-8">
//                     <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-3">
//                         <BookOpen className="w-8 h-8 text-blue-900" />
//                         Exams for {courseCode}
//                     </h1>
//                     <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></div>
//                     <p className="text-sm text-gray-600 mt-2">
//                         Current Time: {currentTime.toLocaleString()}
//                     </p>
//                 </div>

                

//                 {exams.length === 0 ? (
//                     <div className="text-center py-12">
//                         <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
//                         <p className="text-blue-900 text-lg">No exams found for your course and batch.</p>
//                     </div>
//                 ) : (
//                     <div className="space-y-4">
//                         {exams.map((exam) => {
//                             const studentResult = exam.results?.find((r) => r.rollNumber === rollNumber);
//                             const alreadyGiven = !!studentResult;

//                             // Get time status using new logic
//                             const examTimeStatus = getExamTimeStatus(exam);

//                             return (
//                                 <div
//                                     key={exam.ExamID}
//                                     className="border border-blue-900 rounded-xl p-6 hover:border-blue-900 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
//                                 >
//                                     <div className="flex items-start justify-between mb-4">
//                                         <div className="flex items-center gap-3">
//                                             <Hash className="w-5 h-5 text-blue-900" />
//                                             <h3 className="text-xl font-semibold text-blue-900">
//                                                 Exam ID: {exam.ExamID}
//                                             </h3>
//                                         </div>

//                                         <span
//                                             className={`px-3 py-1 rounded-full border-blue-900 border-1 text-sm font-medium flex items-center gap-2 ${getStatusColor(
//                                                 exam.status
//                                             )}`}
//                                         >
//                                             {getStatusIcon(exam.status)}
//                                             {exam.status}
//                                         </span>
//                                     </div>

//                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                         <div className="flex items-center gap-3">
//                                             <Users className="w-4 h-4 text-blue-900" />
//                                             <div>
//                                                 <p className="text-sm text-blue-900">Batch</p>
//                                                 <p className="font-medium text-blue-900">{exam.batch.name}</p>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-3">
//                                             <Calendar className="w-4 h-4 text-blue-900" />
//                                             <div>
//                                                 <p className="text-sm text-blue-900">Exam Date</p>
//                                                 <p className="font-medium text-blue-900">{exam.examDate}</p>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-3">
//                                             <Timer className="w-4 h-4 text-blue-900" />
//                                             <div>
//                                                 <p className="text-sm text-blue-900">Exam Time</p>
//                                                 <p className="font-medium text-blue-900">
//                                                     {exam.examStartTime} - {exam.examEndTime}
//                                                 </p>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-3">
//                                             <Clock className="w-4 h-4 text-blue-900" />
//                                             <div>
//                                                 <p className="text-sm text-blue-900">Duration</p>
//                                                 <p className="font-medium text-blue-900">{exam.examDurationMinutes} mins</p>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-3">
//                                             <FileText className="w-4 h-4 text-blue-900" />
//                                             <div>
//                                                 <p className="text-sm text-blue-900">Questions</p>
//                                                 <p className="font-medium text-blue-900">{exam.totalQuestions}</p>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-3">
//                                             <Trophy className="w-4 h-4 text-blue-900" />
//                                             <div>
//                                                 <p className="text-sm text-blue-900">Total Marks</p>
//                                                 <p className="font-medium text-blue-900">{exam.totalMarks}</p>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-3">
//                                             <Award className="w-4 h-4 text-blue-900" />
//                                             <div>
//                                                 <p className="text-sm text-blue-900">Passing Marks</p>
//                                                 <p className="font-medium text-blue-900">{exam.passingMarks}</p>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-3">
//                                             <CheckCircle className="w-4 h-4 text-blue-900" />
//                                             <div>
//                                                 <p className="text-sm text-blue-900">Mode</p>
//                                                 <p className="font-medium text-blue-900">{exam.examMode}</p>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-3">
//                                             <FileText className="w-4 h-4 text-blue-900" />
//                                             <div>
//                                                 <p className="text-sm text-blue-900">Exam Type</p>
//                                                 <p className="font-medium text-blue-900">{exam.examType}</p>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Time Status Display - only for active online exams */}
//                                     {exam.status === "Active" && exam.examMode === "Online" && examTimeStatus.timeInfo && (
//                                         <div className="mt-4 pt-4 border-t border-gray-200">
//                                             <div className={`border rounded-lg p-3 ${getTimeInfoStyle(examTimeStatus.timeInfo.type)}`}>
//                                                 <div className="flex items-center gap-2">
//                                                     <examTimeStatus.timeInfo.icon className="w-4 h-4" />
//                                                     <span className="font-medium">{examTimeStatus.timeInfo.text}</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* Show Admit Card Download Button for Active Exams */}
//                                     {exam.status === "Active" && (
//                                         <div className="mt-4 pt-4 border-t border-gray-200">
//                                             <button
//                                                 onClick={() => downloadAdmitCard(exam.ExamID)}
//                                                 disabled={downloadingAdmit === String(exam.ExamID)}
//                                                 className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
//                                             >
//                                                 <Download className="w-4 h-4" />
//                                                 {downloadingAdmit === String(exam.ExamID) ? 'Generating...' : 'Download Admit Card'}
//                                             </button>
//                                         </div>
//                                     )}

//                                     {/* Show Results or Action Buttons for both Online and Offline Exams */}
//                                     <div className="mt-4">
//                                         {renderExamActions(exam, studentResult, alreadyGiven, examTimeStatus)}
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ExamDetails;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    FileText,
    Award,
    CheckCircle,
    Users,
    Hash,
    Trophy,
    Medal,
    Clock1,
    Activity,
    BookOpen,
    Download,
    Timer,
    AlertCircle,
    PlayCircle
} from "lucide-react";
import API_BASE_URL from "../../config";

const ExamDetails = () => {
    const [exams, setExams] = useState([]);
    const [error, setError] = useState("");
    const [downloadingAdmit, setDownloadingAdmit] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    const storedStudent = localStorage.getItem("student");
    const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;
    const courseCode = parsedStudent?.courseCode;
    const rollNumber = parsedStudent?.rollNumber;

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    console.log("Roll No .", rollNumber);
    useEffect(() => {
        const fetchExams = async () => {
            try {
                // Send POST request with roll number and course code
                const res = await fetch(`${API_BASE_URL}/api/exams/by-student-details`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        rollNumber: rollNumber,
                        courseCode: courseCode
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    setExams(data.exams);
                    console.log("Exams fetched successfully:", data.exams);
                } else {
                    setError(data.message || "Failed to fetch exams");
                }
            } catch (err) {
                setError("Server error: " + (err.message || "An error occurred while fetching exams"));
            }
        };

        if (courseCode && rollNumber) fetchExams();
    }, [courseCode, rollNumber]);

    // Function to create a proper date-time object from exam date and time
    const createExamDateTime = (examDate, timeStr) => {
        try {
            // Parse the date string (assuming format like "2025-01-15" or "15/01/2025")
            let dateObj;
            if (examDate.includes('/')) {
                // Handle DD/MM/YYYY format
                const [day, month, year] = examDate.split('/');
                dateObj = new Date(year, month - 1, day);
            } else {
                // Handle YYYY-MM-DD format
                dateObj = new Date(examDate);
            }

            // Parse time string (assuming format like "10:30" or "14:00")
            const [hours, minutes] = timeStr.split(':').map(Number);
            
            // Set the time on the date
            dateObj.setHours(hours, minutes, 0, 0);
            
            return dateObj;
        } catch (error) {
            console.error('Error parsing date/time:', error);
            return null;
        }
    };

    // Function to format duration in a readable way
    const formatDuration = (milliseconds) => {
        const totalMinutes = Math.floor(milliseconds / (1000 * 60));
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    // Check exam time status and get time information
    const getExamTimeStatus = (exam) => {
        const now = new Date();
        const examStartDateTime = createExamDateTime(exam.examDate, exam.examStartTime);
        const examEndDateTime = createExamDateTime(exam.examDate, exam.examEndTime);

        if (!examStartDateTime || !examEndDateTime) {
            return {
                status: "invalid",
                message: "Invalid date/time format",
                canTakeExam: false,
                timeInfo: {
                    type: "error",
                    text: "Invalid date/time format",
                    icon: AlertCircle
                }
            };
        }

        const millisUntilStart = examStartDateTime.getTime() - now.getTime();
        const millisUntilEnd = examEndDateTime.getTime() - now.getTime();

        let status, message, canTakeExam = false;
        let timeInfo = null;

        if (now < examStartDateTime) {
            status = "not_started";
            message = `Exam starts in ${formatDuration(millisUntilStart)}`;
            timeInfo = {
                type: "warning",
                text: `Exam starts in: ${formatDuration(millisUntilStart)}`,
                icon: AlertCircle
            };
        } else if (now >= examStartDateTime && now < examEndDateTime) {
            status = "active";
            message = "Exam can be taken now";
            canTakeExam = true;
            timeInfo = {
                type: "success",
                text: `Time remaining: ${formatDuration(millisUntilEnd)}`,
                icon: CheckCircle
            };
        } else {
            status = "ended";
            message = "Exam time has ended";
            timeInfo = {
                type: "error",
                text: "Exam time has ended",
                icon: AlertCircle
            };
        }

        return {
            status,
            message,
            canTakeExam,
            timeInfo,
            millisUntilStart: Math.max(0, millisUntilStart),
            millisUntilEnd: Math.max(0, millisUntilEnd)
        };
    };

    const downloadAdmitCard = async (examId) => {
        try {
            const stringExamId = String(examId); // Ensure consistency
            setDownloadingAdmit(stringExamId);
            const encodedRollNumber = encodeURIComponent(rollNumber);

            const response = await fetch(
                `${API_BASE_URL}/api/v1/admit-card/generate/${examId}/${encodedRollNumber}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate admit card');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `admit-card-${examId}-${rollNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error downloading admit card:', error);
            setError(error.message || 'Failed to download admit card');
        } finally {
            setDownloadingAdmit(null);
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return <Activity className="w-4 h-4 text-green-800" />;
            case "scheduled":
                return <Calendar className="w-4 h-4 text-blue-900" />;
            case "completed":
                return <CheckCircle className="w-4 h-4 text-blue-900" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "text-green-400 border-blue-900";
            case "scheduled":
                return "text-blue-900 bg-blue-900/20";
            case "completed":
                return "text-blue-900 bg-blue-900/20";
            default:
                return "text-yellow-400 bg-yellow-900/20";
        }
    };

    const getTimeInfoStyle = (type) => {
        switch (type) {
            case "success":
                return "bg-green-100 border-green-300 text-green-800";
            case "warning":
                return "bg-yellow-100 border-yellow-300 text-yellow-800";
            case "error":
                return "bg-red-100 border-red-300 text-red-800";
            default:
                return "bg-blue-100 border-blue-300 text-blue-800";
        }
    };

    // Function to render exam results for both online and offline exams
    const renderExamResults = (exam, studentResult, alreadyGiven) => {
        if (!alreadyGiven) return null;

        return (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded space-y-1">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {exam.examMode === "Online" 
                        ? "You have already given this test." 
                        : "Your exam result is available."}
                </div>
                <div className="border-1 border-blue-900 rounded-lg p-4 bg-white space-y-2 flex justify-between">
                    <div className="flex items-center gap-3">
                        <Award className="w-4 h-4 text-blue-900" />
                        <div>
                            <p className="text-sm text-blue-900">Marks Obtained</p>
                            <p className="font-medium text-blue-900">{studentResult.marksObtained}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Medal className="w-4 h-4 text-blue-900" />
                        <div>
                            <p className="text-sm text-blue-900">Status: </p>
                            <p className="font-medium text-blue-900">{studentResult.status}</p>
                        </div>
                    </div>
                    {studentResult.createdAt && (
                        <div className="flex items-center gap-3">
                            <Clock1 className="w-4 h-4 text-blue-900" />
                            <div>
                                <p className="text-sm text-blue-900">
                                    {exam.examMode === "Online" ? "Submitted At:" : "Result Date:"}
                                </p>
                                <p className="font-medium text-blue-900">
                                    {new Date(studentResult.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Function to render action buttons based on exam type and status
    const renderExamActions = (exam, studentResult, alreadyGiven, examTimeStatus) => {
        // Show results for both online and offline exams if student has given the exam
        if (alreadyGiven) {
            return renderExamResults(exam, studentResult, alreadyGiven);
        }

        // For online exams, show the "Give Test" button
        if (exam.examMode === "Online" && exam.status === "Active") {
            return (
                <button
                    onClick={() => navigate(`/student/exam/give/${exam._id}`)}
                    disabled={!examTimeStatus.canTakeExam}
                    className={`mt-2 px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                        examTimeStatus.canTakeExam
                            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                    title={
                        !examTimeStatus.canTakeExam
                            ? examTimeStatus.message
                            : 'Click to start exam'
                    }
                >
                    {examTimeStatus.canTakeExam ? (
                        <>
                            <PlayCircle className="w-4 h-4" />
                            Give Test
                        </>
                    ) : (
                        <>
                            <Clock className="w-4 h-4" />
                            {examTimeStatus.status === 'not_started' && 'Exam Not Started'}
                            {examTimeStatus.status === 'ended' && 'Exam Ended'}
                            {examTimeStatus.status === 'insufficient_time' && 'Insufficient Time'}
                        </>
                    )}
                </button>
            );
        }

        // For offline exams, show appropriate message
        if (exam.examMode === "Offline") {
            if (exam.status === "Active") {
                return (
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            This is an offline exam. Please attend at the designated venue.
                        </div>
                    </div>
                );
            } else if (exam.status === "Completed") {
                return (
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            This offline exam has been completed. Results will be published soon.
                        </div>
                    </div>
                );
            }
        }

        return null;
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-blue-900" />
                        Exams for {courseCode}
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></div>
                    <p className="text-sm text-gray-600 mt-2">
                        Current Time: {currentTime.toLocaleString()}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                        <p className="text-red-400 flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            {error}
                        </p>
                    </div>
                )}

                {exams.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-blue-900 text-lg">No exams found for your course and batch.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {exams.map((exam) => {
                            const studentResult = exam.results?.find((r) => r.rollNumber === rollNumber);
                            const alreadyGiven = !!studentResult;

                            // Get time status using new logic
                            const examTimeStatus = getExamTimeStatus(exam);

                            return (
                                <div
                                    key={exam.ExamID}
                                    className="border border-blue-900 rounded-xl p-6 hover:border-blue-900 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Hash className="w-5 h-5 text-blue-900" />
                                            <h3 className="text-xl font-semibold text-blue-900">
                                                Exam ID: {exam.ExamID}
                                            </h3>
                                        </div>

                                        <span
                                            className={`px-3 py-1 rounded-full border-blue-900 border-1 text-sm font-medium flex items-center gap-2 ${getStatusColor(
                                                exam.status
                                            )}`}
                                        >
                                            {getStatusIcon(exam.status)}
                                            {exam.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-4 h-4 text-blue-900" />
                                            <div>
                                                <p className="text-sm text-blue-900">Batch</p>
                                                <p className="font-medium text-blue-900">{exam.batch.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-blue-900" />
                                            <div>
                                                <p className="text-sm text-blue-900">Exam Date</p>
                                                <p className="font-medium text-blue-900">{exam.examDate}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Timer className="w-4 h-4 text-blue-900" />
                                            <div>
                                                <p className="text-sm text-blue-900">Exam Time</p>
                                                <p className="font-medium text-blue-900">
                                                    {exam.examStartTime} - {exam.examEndTime}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-blue-900" />
                                            <div>
                                                <p className="text-sm text-blue-900">Duration</p>
                                                <p className="font-medium text-blue-900">{exam.examDurationMinutes} mins</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-blue-900" />
                                            <div>
                                                <p className="text-sm text-blue-900">Questions</p>
                                                <p className="font-medium text-blue-900">{exam.totalQuestions}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Trophy className="w-4 h-4 text-blue-900" />
                                            <div>
                                                <p className="text-sm text-blue-900">Total Marks</p>
                                                <p className="font-medium text-blue-900">{exam.totalMarks}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Award className="w-4 h-4 text-blue-900" />
                                            <div>
                                                <p className="text-sm text-blue-900">Passing Marks</p>
                                                <p className="font-medium text-blue-900">{exam.passingMarks}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-4 h-4 text-blue-900" />
                                            <div>
                                                <p className="text-sm text-blue-900">Mode</p>
                                                <p className="font-medium text-blue-900">{exam.examMode}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-blue-900" />
                                            <div>
                                                <p className="text-sm text-blue-900">Exam Type</p>
                                                <p className="font-medium text-blue-900">{exam.examType}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Status Display - only for active online exams */}
                                    {exam.status === "Active" && exam.examMode === "Online" && examTimeStatus.timeInfo && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className={`border rounded-lg p-3 ${getTimeInfoStyle(examTimeStatus.timeInfo.type)}`}>
                                                <div className="flex items-center gap-2">
                                                    <examTimeStatus.timeInfo.icon className="w-4 h-4" />
                                                    <span className="font-medium">{examTimeStatus.timeInfo.text}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Show Admit Card Download Button ONLY for Active "Final Test" exams */}
                                    {exam.status === "Active" && exam.examType?.toLowerCase() === "final test" && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => downloadAdmitCard(exam.ExamID)}
                                                disabled={downloadingAdmit === String(exam.ExamID)}
                                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                {downloadingAdmit === String(exam.ExamID) ? 'Generating...' : 'Download Admit Card'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Show Results or Action Buttons for both Online and Offline Exams */}
                                    <div className="mt-4">
                                        {renderExamActions(exam, studentResult, alreadyGiven, examTimeStatus)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamDetails;