
  // import React, { useState, useEffect } from "react";
  // import { useParams, useNavigate, useLocation } from "react-router-dom";
  // import { ArrowLeft, Save, Loader2 } from "lucide-react";
  // import API_BASE_URL from "../../../config";

  // const EditExam = () => {
  //   const { examId } = useParams();
  //   const navigate = useNavigate();
  //   const location = useLocation();
  //   const { exam } = location.state || {};

  //   const [examData, setExamData] = useState({
  //     id: examId || "",
  //     ExamID: "",
  //     courseCode: "",
  //     batch: {},
  //     examDate: "",
  //     examType: "Weekly Test",
  //     examStartTime: "",
  //     examEndTime: "",
  //     examDurationMinutes: "",
  //     totalQuestions: "",
  //     totalMarks: "",
  //     passingMarks: "",
  //     examMode: "Offline",
  //     status: "Active",
  //   });
  //   const [loading, setLoading] = useState(true);
  //   const [saving, setSaving] = useState(false); // New state for save operation
  //   const [error, setError] = useState(null);
  //   const [successMessage, setSuccessMessage] = useState("");
  //   const [courses, setCourses] = useState([]);
  //   const [batches, setBatches] = useState([]);
  //   const [courseSearchQuery, setCourseSearchQuery] = useState("");
  //   const [batchSearchQuery, setBatchSearchQuery] = useState("");
  //   const [isOnlineExam, setIsOnlineExam] = useState(false);

  //   useEffect(() => {
  //     if (exam) {
  //       // Handle batch data as object
  //       let batchData = {};
  //       if (exam.batch) {
  //         if (Array.isArray(exam.batch)) {
  //           // If batch comes as array, take the first item or convert to object
  //           batchData = exam.batch.length > 0 ? exam.batch[0] : {};
  //         } else if (typeof exam.batch === 'object') {
  //           // If batch is already an object, use it directly
  //           batchData = exam.batch;
  //         }
  //       }

  //       setExamData({
  //         id: exam.id,
  //         ExamID: exam.examId,
  //         courseCode: exam.courseCode,
  //         batch: batchData,
  //         examDate: exam.examDate.split("T")[0],
  //         examType: exam.examType,
  //         examStartTime: exam.examStartTime || "",
  //         examEndTime: exam.examEndTime || "",
  //         examDurationMinutes: exam.examDurationMinutes || "",
  //         totalQuestions: exam.totalQuestions,
  //         totalMarks: exam.totalMarks,
  //         passingMarks: exam.passingMarks,
  //         examMode: exam.modeOnline ? "Online" : "Offline",
  //         status: exam.status || "Active",
  //       });
  //       setIsOnlineExam(exam.modeOnline);
  //       setLoading(false);
        
  //       // Debug log to check batch structure
  //       console.log("Batch data processed:", batchData);
  //       console.log("Batch object keys:", Object.keys(batchData));
  //       console.log("Batches in examdata" , examData.batch , "length of examData" , examData.batch.length);
  //     } else {
  //       setError("Exam data not found. Please try again.");
  //       setLoading(false);
  //     }
  //   }, [exam]);

  //   // Add a separate useEffect to log examData after it's updated
  //   useEffect(() => {
  //     if (examData.batch) {
  //       console.log("ExamData batch after state update:", examData.batch);
  //       console.log("ExamData batch keys:", Object.keys(examData.batch));
  //       console.log("ExamData batch length:", examData.batch.length);
  //     }
  //   }, [examData.batch]);

  //   useEffect(() => {
  //     if (examData.examStartTime && examData.examEndTime) {
  //       const startTime = new Date(`1970-01-01T${examData.examStartTime}:00`);
  //       const endTime = new Date(`1970-01-01T${examData.examEndTime}:00`);
  //       if (endTime > startTime) {
  //         const durationMs = endTime - startTime;
  //         const durationMinutes = Math.floor(durationMs / (1000 * 60));
  //         setExamData((prev) => ({
  //           ...prev,
  //           examDurationMinutes: durationMinutes.toString(),
  //         }));
  //       } else {
  //         setExamData((prev) => ({
  //           ...prev,
  //           examDurationMinutes: "",
  //         }));
  //       }
  //     }
  //   }, [examData.examStartTime, examData.examEndTime]);

  //   const fetchCourses = async () => {
  //     try {
  //       const response = await fetch(
  //         `${API_BASE_URL}/api/v1/institute_courses/getCourses`,
  //         {
  //           method: "GET",
  //           headers: { "Content-Type": "application/json" },
  //         }
  //       );
  //       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  //       const coursesData = await response.json();
  //       setCourses(coursesData);
  //     } catch (err) {
  //       console.error("Error fetching courses:", err);
  //       setCourses([]);
  //     }
  //   };

  //   const fetchBatches = async () => {
  //     try {
  //       const franchiseId = localStorage.getItem("franchiseID");
  //       console.log("Fetching batches for franchiseId:", franchiseId);
  //       const response = await fetch(
  //         `${API_BASE_URL}/api/v1/institute_batche/allBatches?franchiseId=${franchiseId}`,
  //         { method: "GET", headers: { "Content-Type": "application/json" } }
  //       );
  //       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  //       const batchesData = await response.json();
  //       console.log("Batches fetched:", batchesData);
  //       setBatches(batchesData.data);
  //     } catch (err) {
  //       console.error("Error fetching batches:", err);
  //       setBatches([]);
  //     }
  //   };

  //   const handleInputChange = (e) => {
  //     const { name, value } = e.target;
  //     setExamData((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   };

  //   const handleBatchChange = (timings, name, id) => {
  //     // Since we're treating batch as an object, we can toggle or set the batch
  //     setExamData((prev) => {
  //       const currentBatch = prev.batch;
        
  //       // Check if this is the same batch (to toggle off)
  //       if (currentBatch.timings === timings && currentBatch.name === name && currentBatch.id === id) {
  //         // If same batch, clear it (set to empty object)
  //         return { ...prev, batch: {} };
  //       } else {
  //         // Set new batch
  //         return { ...prev, batch: { timings, name, id } };
  //       }
  //     });
  //   };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
      
  //     // Prevent multiple submissions
  //     if (saving) return;
      
  //     setSaving(true); // Start loading state
  //     setError(null); // Clear any previous errors
      
  //     try {
  //       const examId = examData.id || examId;
  //       console.log("Submitting exam data:", examData);
  //       const response = await fetch(
  //         `${API_BASE_URL}/api/v1/institute_exam/exams/updateExam/${examId}`,
  //         {
  //           method: "PUT",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(examData), // No questions sent to the backend
  //         }
  //       );
  //       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  //       const result = await response.json();
  //       setSuccessMessage("Exam updated successfully!");
  //       setTimeout(() => {
  //         navigate("/institute/Exam");
  //       }, 2000);
  //     } catch (err) {
  //       console.error("Error updating exam:", err);
  //       setError("Failed to update exam. Please try again.");
  //     } finally {
  //       setSaving(false); // Stop loading state
  //     }
  //   };

  //   useEffect(() => {
  //     fetchCourses();
  //   }, []);

  //   useEffect(() => {
  //     fetchBatches();
  //   }, [examData.courseCode]);

  //   const getExamTypeColor = (examType) => {
  //     switch (examType) {
  //       case "Weekly Test":
  //         return "bg-green-100 text-green-800 border-green-300";
  //       case "Monthly Test":
  //         return "bg-yellow-100 text-yellow-800 border-yellow-300";
  //       case "Final Test":
  //         return "bg-red-100 text-red-800 border-red-300";
  //       default:
  //         return "bg-gray-100 text-gray-800 border-gray-300";
  //     }
  //   };

  //   const filteredCourses = courses.filter(
  //     (course) =>
  //       course.courseCode.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
  //       course.courseName.toLowerCase().includes(courseSearchQuery.toLowerCase())
  //   );

  //   const filteredBatches = batches.filter(
  //     (batch) =>
  //       batch.timings.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
  //       batch.name.toLowerCase().includes(batchSearchQuery.toLowerCase())
  //   );

  //   if (loading) {
  //     return (
  //       <div className="min-h-screen p-8 bg-gray-100">
  //         <div className="bg-white p-6 shadow-md rounded-md">
  //           <div className="flex justify-center items-center h-64">
  //             <div className="text-center">
  //               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
  //               <p className="text-gray-600">Loading exam details...</p>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   if (error && !saving) { // Don't show error if we're currently saving
  //     return (
  //       <div className="min-h-screen p-8 bg-gray-100">
  //         <div className="bg-white p-6 shadow-md rounded-md">
  //           <div className="flex justify-center items-center h-64">
  //             <div className="text-center">
  //               <div className="text-red-500 text-4xl mb-4">⚠️</div>
  //               <p className="text-gray-600 mb-4">{error}</p>
  //               <button
  //                 onClick={() => navigate("/institute/Exam")}
  //                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
  //               >
  //                 Back to Exams
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="min-h-screen p-8 bg-gray-100">
  //       <div className="flex items-center justify-between mb-6">
  //         <div className="flex items-center space-x-4">
  //           <button
  //             onClick={() => navigate("/institute/Exam")}
  //             className="p-2 hover:bg-gray-200 rounded-lg"
  //             disabled={saving} // Disable navigation during save
  //           >
  //             <ArrowLeft size={24} />
  //           </button>
  //           <h1 className="text-4xl font-bold text-red-500">Edit Exam</h1>
  //           <div
  //             className={`px-3 py-1 rounded-full border text-sm font-medium ${getExamTypeColor(
  //               examData.examType
  //             )}`}
  //           >
  //             {examData.examType}
  //           </div>
  //         </div>
  //         {/* READ-ONLY Online/Offline Toggle - Disabled */}
  //         <div className="flex items-center space-x-4 opacity-60">
  //           <span
  //             className={`font-semibold ${
  //               !isOnlineExam ? "text-blue-600" : "text-gray-500"
  //             }`}
  //           >
  //             Offline Exam
  //           </span>
  //           <label className="relative inline-flex items-center cursor-not-allowed">
  //             <input
  //               type="checkbox"
  //               className="sr-only peer"
  //               checked={isOnlineExam}
  //               disabled={true} // Make toggle read-only
  //             />
  //             <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gray-400"></div>
  //           </label>
  //           <span
  //             className={`font-semibold ${
  //               isOnlineExam ? "text-blue-600" : "text-gray-500"
  //             }`}
  //           >
  //             Online Exam
  //           </span>
  //           <span className="text-xs text-gray-500">(Read Only)</span>
  //         </div>
  //       </div>

  //       <div className="bg-white p-6 shadow-md rounded-md">
  //         {successMessage && (
  //           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
  //             {successMessage}
  //           </div>
  //         )}
          
  //         {/* Show error message inline if saving failed */}
  //         {error && saving === false && (
  //           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
  //             {error}
  //           </div>
  //         )}
          
  //         <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mb-4">
  //           {/* READ-ONLY Exam ID Field */}
  //           <div>
  //             <label className="block text-gray-700 mb-2">Exam ID (Read Only)</label>
  //             <input
  //               type="text"
  //               name="ExamID"
  //               value={examData.ExamID}
  //               className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
  //               readOnly
  //               disabled
  //             />
  //           </div>

  //           {/* READ-ONLY Exam Type */}
  //           <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 opacity-60">
  //             <label className="block text-gray-700 font-semibold mb-3">
  //               Exam Type (Read Only)
  //             </label>
  //             <div className="grid grid-cols-3 gap-4">
  //               {["Weekly Test", "Monthly Test", "Final Test"].map((type) => (
  //                 <label
  //                   key={type}
  //                   className="flex items-center space-x-3 cursor-not-allowed"
  //                 >
  //                   <input
  //                     type="radio"
  //                     name="examType"
  //                     value={type}
  //                     checked={examData.examType === type}
  //                     className="w-5 h-5 text-blue-600 cursor-not-allowed"
  //                     disabled
  //                     readOnly
  //                   />
  //                   <div className="flex flex-col">
  //                     <span className="font-medium text-gray-500">{type}</span>
  //                   </div>
  //                 </label>
  //               ))}
  //             </div>
  //           </div>
  
  //           {/* READ-ONLY Course Code */}
  //           <div>
  //             <label className="block text-gray-700 mb-2">Course Code (Read Only)</label>
  //             <div className="relative opacity-60">
  //               <select
  //                 name="courseCode"
  //                 value={examData.courseCode}
  //                 className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
  //                 disabled
  //                 readOnly
  //               >
  //                 <option value="">Select Course</option>
  //                 {filteredCourses.map((course) => (
  //                   <option key={course.id || course.courseCode} value={course.courseCode}>
  //                     {course.courseCode} ({course.courseName})
  //                   </option>
  //                 ))}
  //               </select>
  //             </div>
  //           </div>

  //           {/* READ-ONLY Batch Selection */}
  //           <div>
  //             <label className="block text-gray-700 mb-2">Batch Selection (Read Only)</label>
  //             <div className="relative opacity-60">
  //               <div className="border rounded p-2 max-h-40 overflow-y-auto bg-gray-100">
  //                 {examData.batch || examData.batch.length > 0 ? (
  //                     <div  className="flex items-center mb-2">
  //                       <input
  //                         type="checkbox"
  //                         className="w-4 h-4 mr-2 cursor-not-allowed"
  //                         checked={true}
  //                         disabled
  //                         readOnly
  //                       />
  //                       <label className="text-gray-600">
  //                         {examData.batch.timings} ({examData.batch.name})
  //                       </label>
  //                     </div>
                  
  //                 ) : (
  //                   <div className="text-gray-500">No batch selected</div>
  //                 )}
  //               </div>
  //             </div>
  //           </div>

  //           {/* READ-ONLY Exam Date */}
  //           <div>
  //             <label className="block text-gray-700">Exam Date (Read Only)</label>
  //             <input
  //               type="date"
  //               name="examDate"
  //               value={examData.examDate}
  //               className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
  //               readOnly
  //               disabled
  //             />
  //           </div>

  //           {/* EDITABLE FIELDS START HERE */}
  //           <div className="grid grid-cols-3 gap-4">
  //             <div>
  //               <label className="block text-gray-700">Exam Start Time</label>
  //               <input
  //                 type="time"
  //                 name="examStartTime"
  //                 value={examData.examStartTime}
  //                 onChange={handleInputChange}
  //                 className="w-full p-2 border rounded"
  //                 disabled={saving} // Disable during save
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-gray-700">Exam End Time</label>
  //               <input
  //                 type="time"
  //                 name="examEndTime"
  //                 value={examData.examEndTime}
  //                 onChange={handleInputChange}
  //                 className="w-full p-2 border rounded"
  //                 disabled={saving} // Disable during save
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-gray-700">
  //                 Duration (Auto-calculated)
  //               </label>
  //               <input
  //                 type="text"
  //                 className="w-full p-2 border rounded bg-gray-100"
  //                 value={examData.examDurationMinutes ? `${examData.examDurationMinutes} minutes` : ""}
  //                 readOnly
  //               />
  //             </div>
  //           </div>

  //           <div className="grid grid-cols-3 gap-4">
  //             <div>
  //               <label className="block text-gray-700">Total Questions</label>
  //               <input
  //                 type="number"
  //                 name="totalQuestions"
  //                 value={examData.totalQuestions}
  //                 onChange={handleInputChange}
  //                 className="w-full p-2 border rounded"
  //                 disabled={saving} // Disable during save
  //                 required
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-gray-700">Total Marks</label>
  //               <input
  //                 type="number"
  //                 name="totalMarks"
  //                 value={examData.totalMarks}
  //                 onChange={handleInputChange}
  //                 className="w-full p-2 border rounded"
  //                 disabled={saving} // Disable during save
  //                 required
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-gray-700">Passing Marks</label>
  //               <input
  //                 type="number"
  //                 name="passingMarks"
  //                 value={examData.passingMarks}
  //                 onChange={handleInputChange}
  //                 className="w-full p-2 border rounded"
  //                 disabled={saving} // Disable during save
  //                 required
  //               />
  //             </div>
  //           </div>

  //           <div>
  //             <label className="block text-gray-700 mb-2">Status</label>
  //             <div className="flex space-x-4">
  //               <label className="flex items-center space-x-2">
  //                 <input
  //                   type="radio"
  //                   name="status"
  //                   value="Active"
  //                   checked={examData.status === "Active"}
  //                   onChange={handleInputChange}
  //                   className="w-5 h-5"
  //                   disabled={saving} // Disable during save
  //                 />
  //                 <span>Active</span>
  //               </label>
  //               <label className="flex items-center space-x-2">
  //                 <input
  //                   type="radio"
  //                   name="status"
  //                   value="Inactive"
  //                   checked={examData.status === "Inactive"}
  //                   onChange={handleInputChange}
  //                   className="w-5 h-5"
  //                   disabled={saving} // Disable during save
  //                 />
  //                 <span>Inactive</span>
  //               </label>
  //             </div>
  //           </div>

  //           <div className="flex space-x-4 mt-6">
  //             <button
  //               type="submit"
  //               className={`px-6 py-2 rounded shadow transition-all duration-200 flex items-center gap-2 min-w-[140px] justify-center ${
  //                 saving 
  //                   ? 'bg-blue-400 cursor-not-allowed opacity-70 pointer-events-none' 
  //                   : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg'
  //               } text-white`}
  //               disabled={saving} // Disable button during save
  //             >
  //               {saving ? (
  //                 <>
  //                   <Loader2 size={20} className="animate-spin" />
  //                   <span className="ml-1">Saving...</span>
  //                 </>
  //               ) : (
  //                 <>
  //                   <Save size={20} />
  //                   <span>Save Changes</span>
  //                 </>
  //               )}
  //             </button>
  //             <button
  //               type="button"
  //               onClick={() => !saving && navigate("/institute/Exam")}
  //               className={`px-6 py-2 rounded transition-all duration-200 ${
  //                 saving 
  //                   ? 'bg-gray-400 cursor-not-allowed opacity-70 pointer-events-none' 
  //                   : 'bg-red-500 hover:bg-red-600 hover:shadow-lg'
  //               } text-white shadow`}
  //               disabled={saving} // Disable cancel during save
  //             >
  //               Cancel
  //             </button>
  //           </div>
  //         </form>
  //       </div>
  //     </div>
  //   );
  // };

  // export default EditExam;

  //exam feature is getting added. 
  import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Plus, Trash2, Edit3 } from "lucide-react";
import API_BASE_URL from "../../../config";

const EditExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { exam } = location.state || {};

  const [examData, setExamData] = useState({
    id: examId || "",
    ExamID: "",
    courseCode: "",
    batch: {},
    examDate: "",
    examType: "Weekly Test",
    examStartTime: "",
    examEndTime: "",
    examDurationMinutes: "",
    totalQuestions: "",
    totalMarks: "",
    passingMarks: "",
    examMode: "Offline",
    status: "Active",
  });
  
  // New state for questions
  const [questions, setQuestions] = useState([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    marks: 1,
    questionType: "multiple-choice"
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [batchSearchQuery, setBatchSearchQuery] = useState("");
  const [isOnlineExam, setIsOnlineExam] = useState(false);

  useEffect(() => {
    if (exam) {
      let batchData = {};
      if (exam.batch) {
        if (Array.isArray(exam.batch)) {
          batchData = exam.batch.length > 0 ? exam.batch[0] : {};
        } else if (typeof exam.batch === 'object') {
          batchData = exam.batch;
        }
      }

      setExamData({
        id: exam.id,
        ExamID: exam.examId,
        courseCode: exam.courseCode,
        batch: batchData,
        examDate: exam.examDate.split("T")[0],
        examType: exam.examType,
        examStartTime: exam.examStartTime || "",
        examEndTime: exam.examEndTime || "",
        examDurationMinutes: exam.examDurationMinutes || "",
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        examMode: exam.modeOnline ? "Online" : "Offline",
        status: exam.status || "Active",
      });
      setIsOnlineExam(exam.modeOnline);
      setLoading(false);
      
      // Fetch questions if it's an online exam
      if (exam.modeOnline) {
        fetchQuestions(exam.id);
      }
    } else {
      setError("Exam data not found. Please try again.");
      setLoading(false);
    }
  }, [exam]);

  // Fetch questions for online exams
  const fetchQuestions = async (examId) => {
    try {
      setLoadingQuestions(true);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/exams/${examId}/questions`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const questionsData = await response.json();
      console.log("Fetched questions:", questionsData);
      setQuestions(questionsData.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      // Don't set error for questions, just log it
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Add new question
  const handleAddQuestion = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/exams/${examData.id}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newQuestion),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setQuestions([...questions, result.question]);
      setNewQuestion({
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        marks: 1,
        questionType: "multiple-choice"
      });
      setShowAddQuestion(false);
      setSuccessMessage("Question added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error adding question:", err);
      setError("Failed to add question. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Update question
  const handleUpdateQuestion = async (questionId, updatedQuestion) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/questions/${questionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedQuestion),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setQuestions(questions.map(q => q._id === questionId ? result.question : q));
      setEditingQuestion(null);
      setSuccessMessage("Question updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating question:", err);
      setError("Failed to update question. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/questions/${questionId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setQuestions(questions.filter(q => q._id !== questionId));
      setSuccessMessage("Question deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting question:", err);
      setError("Failed to delete question. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    if (examData.examStartTime && examData.examEndTime) {
      const startTime = new Date(`1970-01-01T${examData.examStartTime}:00`);
      const endTime = new Date(`1970-01-01T${examData.examEndTime}:00`);
      if (endTime > startTime) {
        const durationMs = endTime - startTime;
        const durationMinutes = Math.floor(durationMs / (1000 * 60));
        setExamData((prev) => ({
          ...prev,
          examDurationMinutes: durationMinutes.toString(),
        }));
      } else {
        setExamData((prev) => ({
          ...prev,
          examDurationMinutes: "",
        }));
      }
    }
  }, [examData.examStartTime, examData.examEndTime]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_courses/getCourses`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const coursesData = await response.json();
      setCourses(coursesData);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  };

  const fetchBatches = async () => {
    try {
      const franchiseId = localStorage.getItem("franchiseID");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_batche/allBatches?franchiseId=${franchiseId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const batchesData = await response.json();
      setBatches(batchesData.data);
    } catch (err) {
      console.error("Error fetching batches:", err);
      setBatches([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExamData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBatchChange = (timings, name, id) => {
    setExamData((prev) => {
      const currentBatch = prev.batch;
      
      if (currentBatch.timings === timings && currentBatch.name === name && currentBatch.id === id) {
        return { ...prev, batch: {} };
      } else {
        return { ...prev, batch: { timings, name, id } };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (saving) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const examId = examData.id || examId;
      const response = await fetch(
        `${API_BASE_URL}/api/v1/institute_exam/exams/updateExam/${examId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(examData),
        }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setSuccessMessage("Exam updated successfully!");
      setTimeout(() => {
        navigate("/institute/Exam");
      }, 2000);
    } catch (err) {
      console.error("Error updating exam:", err);
      setError("Failed to update exam. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [examData.courseCode]);

  const getExamTypeColor = (examType) => {
    switch (examType) {
      case "Weekly Test":
        return "bg-green-100 text-green-800 border-green-300";
      case "Monthly Test":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Final Test":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.courseCode.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
      course.courseName.toLowerCase().includes(courseSearchQuery.toLowerCase())
  );

  const filteredBatches = batches.filter(
    (batch) =>
      batch.timings.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
      batch.name.toLowerCase().includes(batchSearchQuery.toLowerCase())
  );

  // Question component for editing
  const QuestionEditor = ({ question, isNew = false, onSave, onCancel }) => {
    const [questionData, setQuestionData] = useState(
      isNew ? newQuestion : {
        questionText: question.questionText || "",
        options: question.options || ["", "", "", ""],
        correctAnswer: question.correctAnswer || 0,
        marks: question.marks || 1,
        questionType: question.questionType || "multiple-choice"
      }
    );

    const handleQuestionChange = (field, value) => {
      setQuestionData(prev => ({ ...prev, [field]: value }));
    };

    const handleOptionChange = (index, value) => {
      const newOptions = [...questionData.options];
      newOptions[index] = value;
      setQuestionData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSave = () => {
      if (isNew) {
        setNewQuestion(questionData);
        onSave();
      } else {
        onSave(question._id, questionData);
      }
    };

    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <textarea
              value={questionData.questionText}
              onChange={(e) => handleQuestionChange("questionText", e.target.value)}
              className="w-full p-2 border rounded-md"
              rows="3"
              placeholder="Enter your question here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {questionData.options.map((option, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option {index + 1}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correct-${isNew ? 'new' : question._id}`}
                    checked={questionData.correctAnswer === index}
                    onChange={() => handleQuestionChange("correctAnswer", index)}
                    className="text-green-600"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marks
              </label>
              <input
                type="number"
                value={questionData.marks}
                onChange={(e) => handleQuestionChange("marks", parseInt(e.target.value))}
                className="w-20 p-2 border rounded-md"
                min="1"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              {isNew ? "Add Question" : "Update Question"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="bg-white p-6 shadow-md rounded-md">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading exam details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !saving) {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="bg-white p-6 shadow-md rounded-md">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => navigate("/institute/Exam")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Back to Exams
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/institute/Exam")}
            className="p-2 hover:bg-gray-200 rounded-lg"
            disabled={saving}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold text-red-500">Edit Exam</h1>
          <div
            className={`px-3 py-1 rounded-full border text-sm font-medium ${getExamTypeColor(
              examData.examType
            )}`}
          >
            {examData.examType}
          </div>
        </div>
        <div className="flex items-center space-x-4 opacity-60">
          <span
            className={`font-semibold ${
              !isOnlineExam ? "text-blue-600" : "text-gray-500"
            }`}
          >
            Offline Exam
          </span>
          <label className="relative inline-flex items-center cursor-not-allowed">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isOnlineExam}
              disabled={true}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gray-400"></div>
          </label>
          <span
            className={`font-semibold ${
              isOnlineExam ? "text-blue-600" : "text-gray-500"
            }`}
          >
            Online Exam
          </span>
          <span className="text-xs text-gray-500">(Read Only)</span>
        </div>
      </div>

      <div className="bg-white p-6 shadow-md rounded-md">
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {successMessage}
          </div>
        )}
        
        {error && saving === false && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mb-4">
          {/* READ-ONLY Exam ID Field */}
          <div>
            <label className="block text-gray-700 mb-2">Exam ID (Read Only)</label>
            <input
              type="text"
              name="ExamID"
              value={examData.ExamID}
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              readOnly
              disabled
            />
          </div>

          {/* READ-ONLY Exam Type */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 opacity-60">
            <label className="block text-gray-700 font-semibold mb-3">
              Exam Type (Read Only)
            </label>
            <div className="grid grid-cols-3 gap-4">
              {["Weekly Test", "Monthly Test", "Final Test"].map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-3 cursor-not-allowed"
                >
                  <input
                    type="radio"
                    name="examType"
                    value={type}
                    checked={examData.examType === type}
                    className="w-5 h-5 text-blue-600 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-500">{type}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
 
          {/* READ-ONLY Course Code */}
          <div>
            <label className="block text-gray-700 mb-2">Course Code (Read Only)</label>
            <div className="relative opacity-60">
              <select
                name="courseCode"
                value={examData.courseCode}
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                disabled
                readOnly
              >
                <option value="">Select Course</option>
                {filteredCourses.map((course) => (
                  <option key={course.id || course.courseCode} value={course.courseCode}>
                    {course.courseCode} ({course.courseName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* READ-ONLY Batch Selection */}
          <div>
            <label className="block text-gray-700 mb-2">Batch Selection (Read Only)</label>
            <div className="relative opacity-60">
              <div className="border rounded p-2 max-h-40 overflow-y-auto bg-gray-100">
                {examData.batch && Object.keys(examData.batch).length > 0 ? (
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 mr-2 cursor-not-allowed"
                        checked={true}
                        disabled
                        readOnly
                      />
                      <label className="text-gray-600">
                        {examData.batch.timings} ({examData.batch.name})
                      </label>
                    </div>
                ) : (
                  <div className="text-gray-500">No batch selected</div>
                )}
              </div>
            </div>
          </div>

          {/* READ-ONLY Exam Date */}
          <div>
            <label className="block text-gray-700">Exam Date (Read Only)</label>
            <input
              type="date"
              name="examDate"
              value={examData.examDate}
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              readOnly
              disabled
            />
          </div>

          {/* EDITABLE FIELDS START HERE */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700">Exam Start Time</label>
              <input
                type="time"
                name="examStartTime"
                value={examData.examStartTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-gray-700">Exam End Time</label>
              <input
                type="time"
                name="examEndTime"
                value={examData.examEndTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-gray-700">
                Duration (Auto-calculated)
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-100"
                value={examData.examDurationMinutes ? `${examData.examDurationMinutes} minutes` : ""}
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700">Total Questions</label>
              <input
                type="number"
                name="totalQuestions"
                value={examData.totalQuestions}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={saving}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Total Marks</label>
              <input
                type="number"
                name="totalMarks"
                value={examData.totalMarks}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={saving}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Passing Marks</label>
              <input
                type="number"
                name="passingMarks"
                value={examData.passingMarks}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={saving}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={examData.status === "Active"}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                  disabled={saving}
                />
                <span>Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={examData.status === "Inactive"}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                  disabled={saving}
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className={`px-6 py-2 rounded shadow transition-all duration-200 flex items-center gap-2 min-w-[140px] justify-center ${
                saving 
                  ? 'bg-blue-400 cursor-not-allowed opacity-70 pointer-events-none' 
                  : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg'
              } text-white`}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="ml-1">Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => !saving && navigate("/institute/Exam")}
              className={`px-6 py-2 rounded transition-all duration-200 ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed opacity-70 pointer-events-none' 
                  : 'bg-red-500 hover:bg-red-600 hover:shadow-lg'
              } text-white shadow`}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Questions Section - Only show for Online Exams */}
        {isOnlineExam && (
          <div className="mt-8 border-t pt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Exam Questions</h2>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                disabled={saving}
              >
                <Plus size={20} />
                Add Question
              </button>
            </div>

            {loadingQuestions ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading questions...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Add Question Form */}
                {showAddQuestion && (
                  <QuestionEditor
                    isNew={true}
                    onSave={handleAddQuestion}
                    onCancel={() => setShowAddQuestion(false)}
                  />
                )}

                {/* Existing Questions */}
                {questions.length > 0 ? (
                  questions.map((question, index) => (
                    <div key={question._id} className="border rounded-lg p-4 bg-white">
                      {editingQuestion === question._id ? (
                        <QuestionEditor
                          question={question}
                          onSave={handleUpdateQuestion}
                          onCancel={() => setEditingQuestion(null)}
                        />
                      ) : (
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Question {index + 1}
                            </h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingQuestion(question._id)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                title="Edit Question"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(question._id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Delete Question"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-gray-700 mb-3">{question.questionText}</p>
                            
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`p-2 rounded border ${
                                    question.correctAnswer === optionIndex
                                      ? 'bg-green-100 border-green-500 text-green-800'
                                      : 'bg-gray-50 border-gray-300'
                                  }`}
                                >
                                  <span className="font-medium">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>{' '}
                                  {option}
                                  {question.correctAnswer === optionIndex && (
                                    <span className="ml-2 text-green-600 font-bold">✓</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-between items-center text-sm text-gray-600">
                              <span>Marks: {question.marks}</span>
                              <span>Type: {question.questionType}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg mb-2">No questions added yet</p>
                    <p className="text-sm">Click "Add Question" to create your first question</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditExam;