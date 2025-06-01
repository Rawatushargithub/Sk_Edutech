import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddExam = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [batchSearchQuery, setBatchSearchQuery] = useState("");
  const [questionSearchQuery, setQuestionSearchQuery] = useState("");
  const [isOnlineExam, setIsOnlineExam] = useState(false);

  // Auto update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch courses and batches from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/institute_courses/getCourses"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchBatches = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/institute_batche/allBatches"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch batches");
        }
        const data = await response.json();
        setBatches(data.data || []);
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    fetchCourses();
    fetchBatches();
  }, []);

  const [newExam, setNewExam] = useState({
    courseCode: "",
    batch: [],
    examDate: "",
    examDurationMinutes: "",
    totalQuestions: "",
    totalMarks: "",
    passingMarks: "",
    examMode: "Offline",
    status: "Active",
    createdAt: currentTime.toLocaleString(),
    selectedQuestions: [], // For online exams
  });

  // Fetch questions when course is selected for online exams
  useEffect(() => {
    if (isOnlineExam && newExam.courseCode) {
      const fetchQuestions = async () => {
        try {
          const selectedCourseCode = newExam.courseCode;
          const response = await fetch(
            `http://localhost:8000/api/v1/institute_question_bank/${selectedCourseCode}/questions`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch questions");
          }
          const data = await response.json();
          console.log("Questions API Response:", data);
          
          // Handle different possible response structures
          let questionData = [];
          if (data.data) {
            questionData = data.data;
          } else if (Array.isArray(data)) {
            questionData = data;
          } else if (data.questions) {
            questionData = data.questions;
          }
          
          console.log("Processed Questions:", questionData);
          setQuestions(questionData);
        } catch (error) {
          console.error("Error fetching questions:", error);
          setQuestions([]);
        }
      };
      fetchQuestions();
    } else {
      setQuestions([]);
    }
  }, [isOnlineExam, newExam.courseCode]);

  // Update exam mode when toggle changes
  useEffect(() => {
    setNewExam(prev => ({
      ...prev,
      examMode: isOnlineExam ? "Online" : "Offline",
      selectedQuestions: isOnlineExam ? prev.selectedQuestions : []
    }));
  }, [isOnlineExam]);

  const handleAddExam = async () => {
    try {
      // Prepare examData
      const examData = {
        ...newExam,
        batch: newExam.batch,
      };
      // Only send selectedQuestions for online exams
      if (isOnlineExam) {
        // selectedQuestions should be array of qNo (not _id)
        examData.selectedQuestions = questions
          .filter(q => newExam.selectedQuestions.includes(q._id))
          .map(q => q.qNo);
      } else {
        delete examData.selectedQuestions;
      }
      console.log("Exam data being sent:", examData);

      const response = await fetch(
        "http://localhost:8000/api/v1/institute_exam/exams",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(examData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add exam");
      }

      const result = await response.json();
      alert(result.message);

      navigate("/institute/Exam");
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding exam: " + error.message);
    }
  };

  const handleBatchChange = (timings, name, id) => {
    setNewExam((prev) => {
      const exists = prev.batch.some(
        (b) => b.timings === timings && b.name === name && b.id === id
      );

      const updatedBatches = exists
        ? prev.batch.filter(
            (b) => !(b.timings === timings && b.name === name && b.id === id)
          )
        : [...prev.batch, { timings, name, id }];

      return { ...prev, batch: updatedBatches };
    });
  };

  const handleQuestionSelection = (questionId) => {
    setNewExam((prev) => {
      const exists = prev.selectedQuestions.includes(questionId);
      const updatedQuestions = exists
        ? prev.selectedQuestions.filter(id => id !== questionId)
        : [...prev.selectedQuestions, questionId];

      return { ...prev, selectedQuestions: updatedQuestions };
    });
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(
    (course) =>
      course.courseCode
        .toLowerCase()
        .includes(courseSearchQuery.toLowerCase()) ||
      course.courseName.toLowerCase().includes(courseSearchQuery.toLowerCase())
  );

  // Filter batches based on search query
  const filteredBatches = batches.filter(
    (batch) =>
      batch.timings.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
      batch.name.toLowerCase().includes(batchSearchQuery.toLowerCase())
  );

  // Filter questions based on search query - Fixed to handle nested question structure
  const filteredQuestions = questions.filter((questionItem) => {
    const searchTerm = questionSearchQuery.toLowerCase();
    
    // Handle nested question structure from your schema
    if (questionItem.question) {
      // Check if question text matches
      const questionText = questionItem.question.question || '';
      const qNo = questionItem.question.qNo ? questionItem.question.qNo.toString() : '';
      
      return questionText.toLowerCase().includes(searchTerm) ||
             qNo.includes(searchTerm);
    }
    
    // Fallback for direct properties
    const questionText = questionItem.questionText || '';
    const topic = questionItem.topic || '';
    
    return questionText.toLowerCase().includes(searchTerm) ||
           topic.toLowerCase().includes(searchTerm);
  });

  console.log("Current courseCode:", newExam.courseCode);
  console.log("All questions:", questions);
  console.log("Filtered questions:", filteredQuestions);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-red-500">Add Exam</h1>
        
        {/* Toggle Switch */}
        <div className="flex items-center space-x-4">
          <span className={`font-semibold ${!isOnlineExam ? 'text-blue-600' : 'text-gray-500'}`}>
            Offline Exam
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isOnlineExam}
              onChange={(e) => setIsOnlineExam(e.target.checked)}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className={`font-semibold ${isOnlineExam ? 'text-blue-600' : 'text-gray-500'}`}>
            Online Exam
          </span>
        </div>
      </div>

      <div className="bg-white p-6 shadow-md rounded-md">
        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Course Code with Search */}
          <div>
            <label className="block text-gray-700 mb-2">Course Code</label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-2 border rounded mb-2"
                placeholder="Search courses..."
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
              />
              <select
                className="w-full p-2 border rounded"
                value={newExam.courseCode}
                onChange={(e) =>
                  setNewExam({ ...newExam, courseCode: e.target.value })
                }
              >
                <option value="">Select Course</option>
                {filteredCourses.map((course) => (
                  <option key={course.courseName} value={course.courseCode}>
                    {course.courseCode} ({course.courseName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Bank - Only for Online Exams */}
          {isOnlineExam && (
            <div>
              <label className="block text-gray-700 mb-2">
                Question Bank ({newExam.selectedQuestions.length} selected)
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Search questions by question text or number..."
                  value={questionSearchQuery}
                  onChange={(e) => setQuestionSearchQuery(e.target.value)}
                />
                <div className="border rounded p-2 max-h-60 overflow-y-auto bg-gray-50">
                  {newExam.courseCode ? (
                    filteredQuestions.length > 0 ? (
                      filteredQuestions.map((questionItem) => {
                        // Handle nested question structure
                        console.log("Question itemas " , questionItem )
                        const questionData = questionItem.question || 'Question text not available';
                        const questionId = questionItem._id;
                        const qNo = questionItem.qNo || 'N/A';
                       
                        
                        return (
                          <div key={questionId} className="flex items-start mb-3 p-3 bg-white rounded border hover:bg-gray-50">
                            <input
                              type="checkbox"
                              id={`question-${questionId}`}
                              className="w-4 h-4 mr-3 mt-1 flex-shrink-0"
                              checked={newExam.selectedQuestions.includes(questionId)}
                              onChange={() => handleQuestionSelection(questionId)}
                            />
                            <div className="flex-1">
                              <label htmlFor={`question-${questionId}`} className="cursor-pointer">
                                <div className="flex items-center mb-2">
                                  <span className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded mr-2 font-medium">
                                    Q.{qNo}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ID: {questionId}
                                  </span>
                                </div>
                                <div className="text-gray-700 text-sm leading-relaxed">
                                  {questionData}
                                </div>
                                {questionData.options && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    Options: A, B, C, D available
                                  </div>
                                )}
                              </label>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        {questions.length === 0 
                          ? "No questions found for the selected course" 
                          : "No questions match your search criteria"
                        }
                      </div>
                    )
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Please select a course to view questions
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Batch Multiple Selection with Search */}
          <div>
            <label className="block text-gray-700 mb-2">Batch Selection</label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-2 border rounded mb-2"
                placeholder="Search batches..."
                value={batchSearchQuery}
                onChange={(e) => setBatchSearchQuery(e.target.value)}
              />
              <div className="border rounded p-2 max-h-40 overflow-y-auto">
                {filteredBatches.map((batch) => (
                  <div key={batch.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`batch-${batch.id}`}
                      className="w-4 h-4 mr-2"
                      checked={newExam.batch.some(
                        (b) =>
                          b.timings === batch.timings && b.name === batch.name
                      )}
                      onChange={() =>
                        handleBatchChange(batch.timings, batch.name, batch.id)
                      }
                    />
                    <label htmlFor={`batch-${batch.id}`}>
                      {batch.timings} ({batch.name})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-gray-700">Exam Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={newExam.examDate}
              onChange={(e) =>
                setNewExam({ ...newExam, examDate: e.target.value })
              }
            />
          </div>

          {/* Exam Duration */}
          <div>
            <label className="block text-gray-700">
              Exam Duration (minutes)
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={newExam.examDurationMinutes}
              onChange={(e) =>
                setNewExam({ ...newExam, examDurationMinutes: e.target.value })
              }
            />
          </div>

          {/* Total Questions, Total Marks, Passing Marks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Total Questions</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={newExam.totalQuestions}
                onChange={(e) =>
                  setNewExam({ ...newExam, totalQuestions: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-gray-700">Total Marks</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={newExam.totalMarks}
                onChange={(e) =>
                  setNewExam({ ...newExam, totalMarks: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-gray-700">
                Passing Marks (In Numbers)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={newExam.passingMarks}
                onChange={(e) =>
                  setNewExam({ ...newExam, passingMarks: e.target.value })
                }
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  className="w-5 h-5"
                  name="status"
                  value="Active"
                  checked={newExam.status === "Active"}
                  onChange={(e) =>
                    setNewExam({ ...newExam, status: e.target.value })
                  }
                />
                <span>Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  className="w-5 h-5"
                  name="status"
                  value="Inactive"
                  checked={newExam.status === "Inactive"}
                  onChange={(e) =>
                    setNewExam({ ...newExam, status: e.target.value })
                  }
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleAddExam}
            className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
          <button
            onClick={() => navigate("/institute/Exam")}
            className="bg-red-500 shadow hover:bg-red-600 text-white px-6 py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExam;

//questions are not loading
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const AddExam = () => {
//   const navigate = useNavigate();
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [courses, setCourses] = useState([]);
//   const [batches, setBatches] = useState([]);
//   const [questions, setQuestions] = useState([]);
//   const [courseSearchQuery, setCourseSearchQuery] = useState("");
//   const [batchSearchQuery, setBatchSearchQuery] = useState("");
//   const [questionSearchQuery, setQuestionSearchQuery] = useState("");
//   const [isOnlineExam, setIsOnlineExam] = useState(false);

//   // Auto update time every second
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // Fetch courses and batches from API
//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const response = await fetch(
//           "http://localhost:8000/api/v1/institute_courses/getCourses"
//         );
//         if (!response.ok) {
//           throw new Error("Failed to fetch courses");
//         }
//         const data = await response.json();
//         setCourses(data || []);
//       } catch (error) {
//         console.error("Error fetching courses:", error);
//       }
//     };

//     const fetchBatches = async () => {
//       try {
//         const response = await fetch(
//           "http://localhost:8000/api/v1/institute_batche/allBatches"
//         );
//         if (!response.ok) {
//           throw new Error("Failed to fetch batches");
//         }
//         const data = await response.json();
//         setBatches(data.data || []);
//       } catch (error) {
//         console.error("Error fetching batches:", error);
//       }
//     };

//     fetchCourses();
//     fetchBatches();
//   }, []);



//   const [newExam, setNewExam] = useState({
//     courseCode: "",
//     batch: [],
//     examDate: "",
//     examDurationMinutes: "",
//     totalQuestions: "",
//     totalMarks: "",
//     passingMarks: "",
//     examMode: "Offline",
//     status: "Active",
//     createdAt: currentTime.toLocaleString(),
//     selectedQuestions: [], // For online exams
//   });

//   // Fetch questions when course is selected for online exams
//   useEffect(() => {
//     if (isOnlineExam && newExam.courseCode) {
//       const fetchQuestions = async () => {
//         try {
//           const selectedCourseCode = newExam.courseCode;
//           const response = await fetch(
//             `http://localhost:8000/api/v1/institute_question_bank/${selectedCourseCode}/questions`
//           );
//           if (!response.ok) {
//             throw new Error("Failed to fetch questions");
//           }
//           const data = await response.json(); 
//           console.log("Questions loaded :: " , data)
//           setQuestions(data.data || []);
//         } catch (error) {
//           console.error("Error fetching questions:", error);
//           setQuestions([]);
//         }
//       };
//       fetchQuestions();
//     } else {
//       setQuestions([]);
//     }
//   }, [isOnlineExam, newExam.courseCode]);

//   // Update exam mode when toggle changes
//   useEffect(() => {
//     setNewExam(prev => ({
//       ...prev,
//       examMode: isOnlineExam ? "Online" : "Offline",
//       selectedQuestions: isOnlineExam ? prev.selectedQuestions : []
//     }));
//   }, [isOnlineExam]);

//   const handleAddExam = async () => {
//     try {
//       const examData = {
//         ...newExam,
//         batch: newExam.batch,
//       };
//       console.log(newExam.courseCode);

//       const response = await fetch(
//         "http://localhost:8000/api/v1/institute_exam/exams",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(examData),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to add exam");
//       }

//       const result = await response.json();
//       alert(result.message);

//       navigate("/institute/Exam");
//     } catch (error) {
//       console.error("Error:", error);
//       alert("Error adding exam: " + error.message);
//     }
//   };

//   const handleBatchChange = (timings, name, id) => {
//     setNewExam((prev) => {
//       const exists = prev.batch.some(
//         (b) => b.timings === timings && b.name === name && b.id === id
//       );

//       const updatedBatches = exists
//         ? prev.batch.filter(
//             (b) => !(b.timings === timings && b.name === name && b.id === id)
//           )
//         : [...prev.batch, { timings, name, id }];

//       return { ...prev, batch: updatedBatches };
//     });
//   };

//   const handleQuestionSelection = (questionId) => {
//     setNewExam((prev) => {
//       const exists = prev.selectedQuestions.includes(questionId);
//       const updatedQuestions = exists
//         ? prev.selectedQuestions.filter(id => id !== questionId)
//         : [...prev.selectedQuestions, questionId];

//       return { ...prev, selectedQuestions: updatedQuestions };
//     });
//   };

//   // Filter courses based on search query
//   const filteredCourses = courses.filter(
//     (course) =>
//       course.courseCode
//         .toLowerCase()
//         .includes(courseSearchQuery.toLowerCase()) ||
//       course.courseName.toLowerCase().includes(courseSearchQuery.toLowerCase())
//   );

//   // Filter batches based on search query
//   const filteredBatches = batches.filter(
//     (batch) =>
//       batch.timings.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
//       batch.name.toLowerCase().includes(batchSearchQuery.toLowerCase())
//   );

//   // Filter questions based on search query
//   const filteredQuestions = questions.filter(
//     (question) =>
//       question.questionText?.toLowerCase().includes(questionSearchQuery.toLowerCase()) ||
//       question.topic?.toLowerCase().includes(questionSearchQuery.toLowerCase())
//   );
//   console.log("newexamcourseCode" , newExam.courseCode)
//   console.log("filteredQuestions" , filteredQuestions)
  

//   return (
//     <div className="min-h-screen p-8 bg-gray-100">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-4xl font-bold text-red-500">Add Exam</h1>
        
//         {/* Toggle Switch */}
//         <div className="flex items-center space-x-4">
//           <span className={`font-semibold ${!isOnlineExam ? 'text-blue-600' : 'text-gray-500'}`}>
//             Offline Exam
//           </span>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               className="sr-only peer"
//               checked={isOnlineExam}
//               onChange={(e) => setIsOnlineExam(e.target.checked)}
//             />
//             <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
//           </label>
//           <span className={`font-semibold ${isOnlineExam ? 'text-blue-600' : 'text-gray-500'}`}>
//             Online Exam
//           </span>
//         </div>
//       </div>

//       <div className="bg-white p-6 shadow-md rounded-md">
//         <div className="grid grid-cols-1 gap-4 mb-4">
//           {/* Course Code with Search */}
//           <div>
//             <label className="block text-gray-700 mb-2">Course Code</label>
//             <div className="relative">
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded mb-2"
//                 placeholder="Search courses..."
//                 value={courseSearchQuery}
//                 onChange={(e) => setCourseSearchQuery(e.target.value)}
//               />
//               <select
//                 className="w-full p-2 border rounded"
//                 value={newExam.courseCode}
//                 onChange={(e) =>
//                   setNewExam({ ...newExam, courseCode: e.target.value })
//                 }
//               >
//                 <option value="">Select Course</option>
//                 {filteredCourses.map((course) => (
//                   <option key={course.courseName} value={course.courseCode}>
//                     {course.courseCode} ({course.courseName})
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Question Bank - Only for Online Exams */}
//           {isOnlineExam && (
//             <div>
//               <label className="block text-gray-700 mb-2">
//                 Question Bank ({newExam.selectedQuestions.length} selected)
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   className="w-full p-2 border rounded mb-2"
//                   placeholder="Search questions..."
//                   value={questionSearchQuery}
//                   onChange={(e) => setQuestionSearchQuery(e.target.value)}
//                 />
//                 <div className="border rounded p-2 max-h-60 overflow-y-auto bg-gray-50">
//                   {newExam.courseCode ? (
//                     filteredQuestions.length > 0 ? (
//                       filteredQuestions.map((question) => (
//                         <div key={question.id} className="flex items-start mb-3 p-2 bg-white rounded border">
//                           <input
//                             type="checkbox"
//                             id={`question-${question._id}`}
//                             className="w-4 h-4 mr-3 mt-1 flex-shrink-0"
//                             checked={newExam.selectedQuestions.includes(question._id)}
//                             onChange={() => handleQuestionSelection(question._id)}
//                           />
//                           <div className="flex-1">
//                             <label htmlFor={`question-${question._id}`} className="cursor-pointer">
//                               <div className="font-medium text-sm mb-1">
//                                 {question.question && (
//                                   <span className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded mr-2">
//                                     {question.question}
//                                   </span>
//                                 )}
//                               </div>
//                               {/* <div className="text-gray-700 text-sm">
//                                 {question.questionText || 'Question text not available'}
//                               </div>
//                               {question.marks && (
//                                 <div className="text-xs text-gray-500 mt-1">
//                                   Marks: {question.marks}
//                                 </div>
//                               )} */}
//                             </label>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-center text-gray-500 py-4">
//                         No questions found for the selected course
//                       </div>
//                     )
//                   ) : (
//                     <div className="text-center text-gray-500 py-4">
//                       Please select a course to view questions
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Batch Multiple Selection with Search */}
//           <div>
//             <label className="block text-gray-700 mb-2">Batch Selection</label>
//             <div className="relative">
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded mb-2"
//                 placeholder="Search batches..."
//                 value={batchSearchQuery}
//                 onChange={(e) => setBatchSearchQuery(e.target.value)}
//               />
//               <div className="border rounded p-2 max-h-40 overflow-y-auto">
//                 {filteredBatches.map((batch) => (
//                   <div key={batch.id} className="flex items-center mb-2">
//                     <input
//                       type="checkbox"
//                       id={`batch-${batch.id}`}
//                       className="w-4 h-4 mr-2"
//                       checked={newExam.batch.some(
//                         (b) =>
//                           b.timings === batch.timings && b.name === batch.name
//                       )}
//                       onChange={() =>
//                         handleBatchChange(batch.timings, batch.name, batch.id)
//                       }
//                     />
//                     <label htmlFor={`batch-${batch.timings}`}>
//                       {batch.timings} ({batch.name})
//                     </label>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Exam Date */}
//           <div>
//             <label className="block text-gray-700">Exam Date</label>
//             <input
//               type="date"
//               className="w-full p-2 border rounded"
//               value={newExam.examDate}
//               onChange={(e) =>
//                 setNewExam({ ...newExam, examDate: e.target.value })
//               }
//             />
//           </div>

//           {/* Exam Duration */}
//           <div>
//             <label className="block text-gray-700">
//               Exam Duration (minutes)
//             </label>
//             <input
//               type="number"
//               className="w-full p-2 border rounded"
//               value={newExam.examDurationMinutes}
//               onChange={(e) =>
//                 setNewExam({ ...newExam, examDurationMinutes: e.target.value })
//               }
//             />
//           </div>

//           {/* Total Questions, Total Marks, Passing Marks */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-gray-700">Total Questions</label>
//               <input
//                 type="number"
//                 className="w-full p-2 border rounded"
//                 value={newExam.totalQuestions}
//                 onChange={(e) =>
//                   setNewExam({ ...newExam, totalQuestions: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <label className="block text-gray-700">Total Marks</label>
//               <input
//                 type="number"
//                 className="w-full p-2 border rounded"
//                 value={newExam.totalMarks}
//                 onChange={(e) =>
//                   setNewExam({ ...newExam, totalMarks: e.target.value })
//                 }
//               />
//             </div>

//             <div>
//               <label className="block text-gray-700">
//                 Passing Marks (In Numbers)
//               </label>
//               <input
//                 type="number"
//                 className="w-full p-2 border rounded"
//                 value={newExam.passingMarks}
//                 onChange={(e) =>
//                   setNewExam({ ...newExam, passingMarks: e.target.value })
//                 }
//               />
//             </div>
//           </div>

//           {/* Exam Mode as Radio Buttons */}
//           <div>
//             <label className="block text-gray-700 mb-2">Exam Mode</label>
//             <div className="flex space-x-4">
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="radio"
//                   className="w-5 h-5"
//                   name="examMode"
//                   value="Online"
//                   checked={newExam.examMode === "Online"}
//                   onChange={(e) =>
//                     setNewExam({ ...newExam, examMode: e.target.value })
//                   }
//                 />
//                 <span>ONLINE</span>
//               </label>
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="radio"
//                   className="w-5 h-5"
//                   name="examMode"
//                   value="Offline"
//                   checked={newExam.examMode === "Offline"}
//                   onChange={(e) =>
//                     setNewExam({ ...newExam, examMode: e.target.value })
//                   }
//                 />
//                 <span>OFFLINE</span>
//               </label>
//             </div>
//           </div>

//           {/* Status */}
//           <div>
//             <label className="block text-gray-700 mb-2">Status</label>
//             <div className="flex space-x-4">
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="radio"
//                   className="w-5 h-5"
//                   name="status"
//                   value="Active"
//                   checked={newExam.status === "Active"}

