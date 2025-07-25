import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Clock,
  Calendar,
  BookOpen,
  Timer,
  PlayCircle,
  AlertTriangle,
  ShieldOff,
} from "lucide-react";
import API_BASE_URL from "../../config";

const GiveTest = () => {
  const { id } = useParams();
  const fullscreenRef = useRef(null);

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // Fetch student from localStorage
  const storedStudent = localStorage.getItem("student");
  const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;
  const rollNumber = parsedStudent?.rollNumber;

  // Fetch Exam Details
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}`);
        const data = await res.json();
        if (res.ok) {
          setExam(data.exam);
        }
      } catch (err) {
        console.error("Failed to fetch exam:", err);
      }
    };
    fetchExam();
  }, [id]);

  // Timer Handler with Auto-Submit
  useEffect(() => {
    let timer;
    if (started && timeLeft > 0 && !submitted) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerExpired(true);
            handleAutoSubmit("Time expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [started, timeLeft, submitted]);

  // Auto-submit function
  const handleAutoSubmit = async (reason = "Time expired") => {
    // Prevent multiple submissions
    if (submitted || !rollNumber) return;

    console.log(`Auto-submitting exam. Reason: ${reason}`);
    
    try {
      setSubmitted(true); // Set this immediately to prevent multiple calls
      
      const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          rollNumber,
          autoSubmitted: true,
          reason,
          violations,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(`✅ Test Auto-Submitted! Reason: ${reason}\nScore: ${result.marksObtained || 'N/A'}\nStatus: ${result.status || 'Completed'}`);
      } else {
        toast.error(result.message || "Auto-submission failed");
        console.error("Auto-submission failed:", result);
      }
    } catch (err) {
      console.error("Auto-submission error:", err);
      toast.error("Failed to submit exam automatically");
    } finally {
      // Exit fullscreen after submission
      try {
        if (document.exitFullscreen && document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.log("Fullscreen exit error:", err);
      }
    }
  };

  // Fullscreen change handler
  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );

    console.log("Fullscreen changed:", isCurrentlyFullscreen);
    setIsFullscreen(isCurrentlyFullscreen);

    // If exam is started, not submitted, and user exited fullscreen
    if (!isCurrentlyFullscreen && started && !submitted) {
      console.log("Fullscreen exited during exam - auto-submitting");
      toast.error("⚠️ Fullscreen mode exited! Auto-submitting exam...");
      
      // Use setTimeout to ensure the state updates are processed
      setTimeout(() => {
        handleAutoSubmit("Exited fullscreen mode");
      }, 100);
    }
  };

  // Fullscreen and Security Monitoring
  useEffect(() => {
    if (started && !submitted) {
      // Request fullscreen
      enterFullscreen();

      // Add event listeners for security
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("contextmenu", handleContextMenu);

      // Prevent browser back/forward/refresh
      const handleBeforeUnload = (e) => {
        if (!submitted) {
          e.preventDefault();
          e.returnValue = "Are you sure you want to leave the exam? This will auto-submit your test.";
          // Auto-submit when user tries to leave
          handleAutoSubmit("Browser closed/refreshed");
          return "Are you sure you want to leave the exam? This will auto-submit your test.";
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("contextmenu", handleContextMenu);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [started, submitted]);

  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error("Failed to enter fullscreen:", err);
      toast.warning("Could not enter fullscreen mode");
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && started && !submitted) {
      handleViolation("Switched to another tab/window");
    }
  };

  const handleKeyDown = (e) => {
    if (started && !submitted) {
      // Prevent common shortcuts
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "r") ||
        (e.key === "F5") ||
        (e.altKey && e.key === "Tab") ||
        (e.ctrlKey && e.key === "w") ||
        (e.ctrlKey && e.key === "t") ||
        (e.ctrlKey && e.key === "n") ||
        e.key === "Escape" // Prevent ESC from exiting fullscreen
      ) {
        e.preventDefault();
        handleViolation("Attempted to use restricted keyboard shortcut");
      }
    }
  };

  const handleContextMenu = (e) => {
    if (started && !submitted) {
      e.preventDefault();
      handleViolation("Attempted to open context menu");
    }
  };

  const handleViolation = (violationType) => {
    const newViolations = violations + 1;
    setViolations(newViolations);
    
    toast.warning(
      `⚠️ Security Violation ${newViolations}/3: ${violationType}`,
      { 
        icon: <ShieldOff className="text-yellow-600" />,
        autoClose: 3000 
      }
    );

    if (newViolations >= 3) {
      toast.error("❌ Maximum violations reached! Auto-submitting exam...");
      setTimeout(() => {
        handleAutoSubmit("Maximum security violations reached (3/3)");
      }, 1000);
    } else {
      // Try to re-enter fullscreen if possible
      if (!isFullscreen) {
        enterFullscreen();
      }
    }

    // Show warning message
    setWarningMessage(`Violation ${newViolations}/3: ${violationType}`);
    setTimeout(() => {
      setWarningMessage("");
    }, 5000);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStartTest = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}/questions`);
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions);
        setStarted(true);
        setTimeLeft(exam.examDurationMinutes * 60);
        toast.success("🚀 Exam started! Entering fullscreen mode...");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to start exam");
    } finally {
      setLoading(false);
    }
  };

  // Print screen detection
  useEffect(() => {
    const handlePrintScreen = (e) => {
      if (e.key === "PrintScreen" && started && !submitted) {
        e.preventDefault();
        toast.error("📸 Screenshot detected!");
        handleViolation("Screenshot attempt detected");
      }
    };

    window.addEventListener("keyup", handlePrintScreen);
    return () => window.removeEventListener("keyup", handlePrintScreen);
  }, [started, submitted, violations]);

  const handleManualSubmit = async () => {
    if (submitted || !rollNumber) return;

    const confirmSubmit = window.confirm(
      "Are you sure you want to submit your test? This action cannot be undone."
    );
    if (!confirmSubmit) return;

    try {
      setSubmitted(true);
      
      const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          rollNumber,
          autoSubmitted: false,
          violations,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(`✅ Test Submitted Successfully! Score: ${result.marksObtained || 'N/A'}`);
      } else {
        toast.error(result.message || "Submission failed");
      }
    } catch (err) {
      console.error("Manual submission error:", err);
      toast.error("Failed to submit exam");
    } finally {
      // Exit fullscreen after submission
      try {
        if (document.exitFullscreen && document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.log("Fullscreen exit error:", err);
      }
    }
  };

  const handleOptionSelect = (qNo, selected) => {
    if (!timerExpired && !submitted) {
      setAnswers({ ...answers, [qNo]: selected });
    }
  };

  if (!exam) {
    return <p className="p-6 text-blue-900">Loading Exam...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen" ref={fullscreenRef}>
      {/* Warning Message */}
      {warningMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {warningMessage}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-900">
          <BookOpen className="w-6 h-6" />
          Online Test - {exam.courseCode}
          {started && !submitted && (
            <span className="text-sm font-normal text-red-600">
              (Violations: {violations}/3)
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-blue-900">
          <p className="flex gap-2 items-center">
            <Calendar className="w-4 h-4" /> {exam.examDate}
          </p>
          <p className="flex gap-2 items-center">
            <Clock className="w-4 h-4" /> Duration: {exam.examDurationMinutes} mins
          </p>
          <p className="flex gap-2 items-center">
            <Timer className="w-4 h-4" />
            <span className={timeLeft <= 300 ? "text-red-600 font-bold animate-pulse" : ""}>
              Time Left: {started ? formatTime(timeLeft) : "Not Started"}
            </span>
          </p>
        </div>
      </div>

      {/* Pre-exam Instructions */}
      {!started && exam.examMode === "Online" && exam.status === "Active" && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ Important Security Instructions:</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>🔒 The exam will start in fullscreen mode</li>
            <li>❌ Do NOT switch tabs, windows, or exit fullscreen</li>
            <li>🚫 Right-click and keyboard shortcuts are disabled</li>
            <li>⚡ Exiting fullscreen will AUTO-SUBMIT your exam immediately</li>
            <li>📊 3 violations will result in automatic submission</li>
            <li>⏰ The test will auto-submit when time expires</li>
          </ul>
          <button
            onClick={handleStartTest}
            disabled={loading}
            className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-blue-800 transition disabled:opacity-50"
          >
            <PlayCircle className="w-5 h-5" />
            {loading ? "Starting..." : "Start Test"}
          </button>
        </div>
      )}

      {started && !submitted && (
        <>
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.qNo} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm">
                <p className="text-blue-900 font-medium mb-3">
                  Q{idx + 1}. {q.question}
                </p>
                <div className="space-y-2 ml-4">
                  {["a", "b", "c", "d"].map((opt) => (
                    <label key={opt} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="radio"
                        name={`q-${q.qNo}`}
                        value={opt}
                        checked={answers[q.qNo] === opt}
                        onChange={() => handleOptionSelect(q.qNo, opt)}
                        className="w-4 h-4 text-blue-600"
                        disabled={timerExpired || submitted}
                      />
                      <span className="text-gray-700">{q.options[opt]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!timerExpired && !submitted && (
            <div className="mt-6 text-right">
              <button
                onClick={handleManualSubmit}
                className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
              >
                🎯 Submit Test
              </button>
            </div>
          )}
        </>
      )}

      {timerExpired && !submitted && (
        <div className="mt-8 p-6 bg-red-50 border border-red-300 rounded-lg text-center">
          <p className="text-red-600 font-semibold text-xl">⏰ Time's Up!</p>
          <p className="text-blue-900 mt-2">Auto-submitting your answers...</p>
        </div>
      )}

      {submitted && (
        <div className="mt-8 p-6 bg-green-50 border border-green-300 rounded-lg text-center">
          <p className="text-green-700 font-semibold text-xl">✅ Test Submitted Successfully!</p>
          <p className="text-blue-900 mt-2">You can now close this window.</p>
        </div>
      )}
    </div>
  );
};

export default GiveTest;

// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import {
//   Clock,
//   Calendar,
//   BookOpen,
//   Timer,
//   PlayCircle,
//   AlertTriangle,
//   ShieldOff,
//   TerminalSquare,
// } from "lucide-react";
// import API_BASE_URL from "../../config";

// const GiveTest = () => {
//   const { id } = useParams();
//   const fullscreenRef = useRef(null);

//   const [exam, setExam] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [started, setStarted] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [timerExpired, setTimerExpired] = useState(false);
//   const [answers, setAnswers] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [violations, setViolations] = useState(0);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [warningMessage, setWarningMessage] = useState("");

//   // Fetch student from localStorage
//   const storedStudent = localStorage.getItem("student");
//   const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;
//   const rollNumber = parsedStudent?.rollNumber;

//   // Fetch Exam Details
//   useEffect(() => {
//     const fetchExam = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}`);
//         const data = await res.json();
//         if (res.ok) {
//           setExam(data.exam);
//         }
//       } catch (err) {
//         console.error("Failed to fetch exam:", err);
//       }
//     };
//     fetchExam();
//   }, [id]);

//   // Timer Handler with Auto-Submit
//   useEffect(() => {
//     let timer;
//     if (started && timeLeft > 0 && !submitted) {
//       timer = setInterval(() => {
//         setTimeLeft((prev) => {
//           if (prev <= 1) {
//             setTimerExpired(true);
//             handleAutoSubmit();
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [started, timeLeft, submitted]);

//   // Fullscreen and Security Monitoring
//   useEffect(() => {
//     if (started && !submitted) {
//       // Request fullscreen
//       enterFullscreen();

//       // Add event listeners for security
//       document.addEventListener("visibilitychange", handleVisibilityChange);
//       document.addEventListener("fullscreenchange", handleFullscreenChange);
//       document.addEventListener("keydown", handleKeyDown);
//       document.addEventListener("contextmenu", handleContextMenu);

//       // Prevent browser back/forward/refresh
//       const handleBeforeUnload = (e) => {
//         e.preventDefault();
//         e.returnValue = "Are you sure you want to leave the exam? This will cancel your test.";
//         return "Are you sure you want to leave the exam? This will cancel your test.";
//       };

//       window.addEventListener("beforeunload", handleBeforeUnload);

//       return () => {
//         document.removeEventListener("visibilitychange", handleVisibilityChange);
//         document.removeEventListener("fullscreenchange", handleFullscreenChange);
//         document.removeEventListener("keydown", handleKeyDown);
//         document.removeEventListener("contextmenu", handleContextMenu);
//         window.removeEventListener("beforeunload", handleBeforeUnload);
//       };
//     }
//   }, [started, submitted]);

//   const enterFullscreen = () => {
//     const element = document.documentElement;
//     if (element.requestFullscreen) {
//       element.requestFullscreen();
//     } else if (element.mozRequestFullScreen) {
//       element.mozRequestFullScreen();
//     } else if (element.webkitRequestFullscreen) {
//       element.webkitRequestFullscreen();
//     } else if (element.msRequestFullscreen) {
//       element.msRequestFullscreen();
//     }
//   };

//   const handleFullscreenChange = () => {
//     const isCurrentlyFullscreen = !!(
//       document.fullscreenElement ||
//       document.mozFullScreenElement ||
//       document.webkitFullscreenElement ||
//       document.msFullscreenElement
//     );

//     setIsFullscreen(isCurrentlyFullscreen);

//     if (!isCurrentlyFullscreen && started && !submitted) {
//       toast.error("Fullscreen exited. Auto-submitting the test.");
//       handleAutoSubmit("Exited fullscreen");
//     }
//   };

//   const handleVisibilityChange = () => {
//     if (document.hidden && started && !submitted) {
//       handleViolation("Switched to another tab/window");
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (started && !submitted) {
//       // Prevent common shortcuts
//       if (
//         e.key === "F12" ||
//         (e.ctrlKey && e.shiftKey && e.key === "I") ||
//         (e.ctrlKey && e.shiftKey && e.key === "J") ||
//         (e.ctrlKey && e.key === "u") ||
//         (e.ctrlKey && e.key === "r") ||
//         (e.key === "F5") ||
//         (e.altKey && e.key === "Tab") ||
//         (e.ctrlKey && e.key === "w") ||
//         (e.ctrlKey && e.key === "t") ||
//         (e.ctrlKey && e.key === "n")
//       ) {
//         e.preventDefault();
//         handleViolation("Attempted to use restricted keyboard shortcut");
//       }
//     }
//   };

//   const handleContextMenu = (e) => {
//     if (started && !submitted) {
//       e.preventDefault();
//       handleViolation("Attempted to open context menu");
//     }
//   };

//   const handleViolation = (violationType) => {
//     const newViolations = violations + 1;
//     setViolations(newViolations);
//     toast.warning(
//       `Violation ${newViolations}/3: ${violationType}`,
//       { icon: <ShieldOff className="text-yellow-600" /> }
//     );

//     if (newViolations >= 3) {
//       handleAutoSubmit("Exam terminated due to multiple violations");
//     }

//     // Re-enter fullscreen if possible
//     if (!isFullscreen) {
//       enterFullscreen();
//     }

//     // Clear warning after 5 seconds
//     setTimeout(() => {
//       setWarningMessage("");
//     }, 5000);
//   };

//   const formatTime = (sec) => {
//     const m = Math.floor(sec / 60);
//     const s = sec % 60;
//     return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   };

//   const handleStartTest = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}/questions`);
//       const data = await res.json();
//       if (res.ok) {
//         setQuestions(data.questions);
//         setStarted(true);
//         setTimeLeft(exam.examDurationMinutes * 60);
//       }
//     } catch (err) {
//       console.error("Error fetching questions:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAutoSubmit = async (reason = "Time expired") => {
//     if (submitted || !rollNumber) return;

//     try {
//       setSubmitted(true);
//       const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}/submit`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           answers,
//           rollNumber,
//           autoSubmitted: true,
//           reason,
//           violations,
//         }),
//       });

//       const result = await res.json();
//       if (res.ok) {
//         toast.success(`✅ Test Auto-Submitted! Reason: ${reason}\nScore: ${result.marksObtained}\nStatus: ${result.status}`);
//       } else {
//         toast.error(result.message || "Auto-submission failed");
//       }
//     } catch (err) {
//       console.error("Auto-submission error:", err);
//     } finally {
//       // Exit fullscreen after submission
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       }
//     }
//   };

//   useEffect(() => {
//     const handlePrintScreen = (e) => {
//       if (e.key === "PrintScreen") {
//         e.preventDefault();
//         toast.error("Screenshot is not allowed.");
//         handleViolation("Screenshot attempt detected");
//       }
//     };

//     window.addEventListener("keyup", handlePrintScreen);

//     return () => {
//       window.removeEventListener("keyup", handlePrintScreen);
//     };
//   }, [started, submitted]);


//   const handleManualSubmit = async () => {
//     if (submitted || !rollNumber) return;

//     const confirmSubmit = window.confirm("Are you sure you want to submit your test? This action cannot be undone.");
//     if (!confirmSubmit) return;

//     try {
//       setSubmitted(true);
//       const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}/submit`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           answers,
//           rollNumber,
//           autoSubmitted: false,
//           violations,
//         }),
//       });

//       const result = await res.json();
//       if (res.ok) {
//         alert(`✅ Test Submitted Successfully!`);
//       } else {
//         alert(result.message || "Submission failed");
//       }
//     } catch (err) {
//       console.error("Submission error:", err);
//     } finally {
//       // Exit fullscreen after submission
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       }
//     }
//   };

//   const handleOptionSelect = (qNo, selected) => {
//     if (!timerExpired && !submitted) {
//       setAnswers({ ...answers, [qNo]: selected });
//     }
//   };

//   if (!exam) {
//     return <p className="p-6 text-blue-900">Loading Exam...</p>;
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 min-h-screen" ref={fullscreenRef}>
//       {/* Warning Message */}
//       {warningMessage && (
//         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
//           <AlertTriangle className="w-5 h-5" />
//           {warningMessage}
//         </div>
//       )}

//       <div className="mb-6">
//         <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-900">
//           <BookOpen className="w-6 h-6" />
//           Online Test - {exam.courseCode}
//           {started && !submitted && (
//             <span className="text-sm font-normal text-red-600">
//               (Violations: {violations}/3)
//             </span>
//           )}
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-blue-900">
//           <p className="flex gap-2 items-center">
//             <Calendar className="w-4 h-4" /> {exam.examDate}
//           </p>
//           <p className="flex gap-2 items-center">
//             <Clock className="w-4 h-4" /> Duration: {exam.examDurationMinutes} mins
//           </p>
//           <p className="flex gap-2 items-center">
//             <Timer className="w-4 h-4" />
//             <span className={timeLeft <= 300 ? "text-red-600 font-bold" : ""}>
//               Time Left: {started ? formatTime(timeLeft) : "Not Started"}
//             </span>
//           </p>
//         </div>
//       </div>

//       {/* Pre-exam Instructions */}
//       {!started && exam.examMode === "Online" && exam.status === "Active" && (
//         <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//           <h3 className="font-bold text-yellow-800 mb-2">Important Instructions:</h3>
//           <ul className="text-yellow-700 space-y-1 text-sm">
//             <li>• The exam will start in fullscreen mode</li>
//             <li>• Do not switch tabs, windows, or exit fullscreen</li>
//             <li>• Right-click and keyboard shortcuts are disabled</li>
//             <li>• 3 violations will result in automatic submission</li>
//             <li>• The test will auto-submit when time expires</li>
//           </ul>
//           <button
//             onClick={handleStartTest}
//             disabled={loading}
//             className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-blue-800 transition"
//           >
//             <PlayCircle className="w-5 h-5" />
//             {loading ? "Starting..." : "Start Test"}
//           </button>
//         </div>
//       )}

//       {started && !submitted && (
//         <>
//           <div className="space-y-6">
//             {questions.map((q, idx) => (
//               <div key={q.qNo} className="border border-blue-200 rounded-lg p-4 bg-white">
//                 <p className="text-blue-900 font-medium mb-2">
//                   Q{idx + 1}. {q.question}
//                 </p>
//                 <div className="space-y-2 ml-4">
//                   {["a", "b", "c", "d"].map((opt) => (
//                     <label key={opt} className="block">
//                       <input
//                         type="radio"
//                         name={`q-${q.qNo}`}
//                         value={opt}
//                         checked={answers[q.qNo] === opt}
//                         onChange={() => handleOptionSelect(q.qNo, opt)}
//                         className="mr-2"
//                         disabled={timerExpired || submitted}
//                       />
//                       {q.options[opt]}
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {!timerExpired && !submitted && (
//             <div className="mt-6 text-right">
//               <button
//                 onClick={handleManualSubmit}
//                 className="bg-green-700 text-white px-5 py-2 rounded hover:bg-green-600"
//               >
//                 Submit Test
//               </button>
//             </div>
//           )}
//         </>
//       )}

//       {timerExpired && !submitted && (
//         <div className="mt-8 p-4 bg-red-50 border border-red-300 rounded-lg text-center">
//           <p className="text-red-600 font-semibold text-lg">⏰ Time's up!</p>
//           <p className="text-blue-900">Auto-submitting your answers...</p>
//         </div>
//       )}

//       {submitted && (
//         <div className="mt-8 p-4 bg-green-50 border border-green-300 rounded-lg text-center">
//           <p className="text-green-700 font-semibold text-lg">✅ Test Submitted Successfully!</p>
//           <p className="text-blue-900 mt-2">You can now close this window.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default GiveTest;

// // import { useEffect, useState } from "react";
// // import { useParams } from "react-router-dom";
// // import {
// //   Clock,
// //   Calendar,
// //   BookOpen,
// //   Timer,
// //   PlayCircle,
// // } from "lucide-react";
// // import API_BASE_URL from "../../config";

// // const GiveTest = () => {
// //   const { id } = useParams();

// //   const [exam, setExam] = useState(null);
// //   const [questions, setQuestions] = useState([]);
// //   const [started, setStarted] = useState(false);
// //   const [timeLeft, setTimeLeft] = useState(0);
// //   const [timerExpired, setTimerExpired] = useState(false);
// //   const [answers, setAnswers] = useState({});
// //   const [loading, setLoading] = useState(false);
// //   const [submitted, setSubmitted] = useState(false);

// //   // Fetch student from localStorage
// //   const storedStudent = localStorage.getItem("student");
// //   const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;
// //   const rollNumber = parsedStudent?.rollNumber;

// //   // Fetch Exam Details
// //   useEffect(() => {
// //     const fetchExam = async () => {
// //       try {
// //         const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}`);
// //         const data = await res.json();
// //         if (res.ok) {
// //           setExam(data.exam);
// //         }
// //       } catch (err) {
// //         console.error("Failed to fetch exam:", err);
// //       }
// //     };
// //     fetchExam();
// //   }, [id]);

// //   // Timer Handler
// //   useEffect(() => {
// //     let timer;
// //     if (started && timeLeft > 0) {
// //       timer = setInterval(() => {
// //         setTimeLeft((prev) => prev - 1);
// //       }, 1000);
// //     } else if (timeLeft === 0 && started) {
// //       setTimerExpired(true);
// //       handleSubmitTest(); // Auto-submit when time expires
// //     }
// //     return () => clearInterval(timer);
// //   }, [started, timeLeft]);

// //   const formatTime = (sec) => {
// //     const m = Math.floor(sec / 60);
// //     const s = sec % 60;
// //     return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
// //   };

// //   const handleStartTest = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}/questions`);
// //       const data = await res.json();
// //       if (res.ok) {
// //         setQuestions(data.questions);
// //         setStarted(true);
// //         setTimeLeft(exam.examDurationMinutes * 60);
// //       }
// //     } catch (err) {
// //       console.error("Error fetching questions:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleSubmitTest = async () => {
// //     if (submitted || !rollNumber) return;
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}/submit`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           answers,
// //           rollNumber,
// //         }),
// //       });

// //       const result = await res.json();
// //       if (res.ok) {
// //         alert(`✅ Test Submitted! You scored ${result.marksObtained}. Status: ${result.status}`);
// //         setSubmitted(true);
// //       } else {
// //         alert(result.message || "Submission failed");
// //       }
// //     } catch (err) {
// //       console.error("Submission error:", err);
// //     }
// //   };

// //   const handleOptionSelect = (qNo, selected) => {
// //     if (!timerExpired) {
// //       setAnswers({ ...answers, [qNo]: selected });
// //     }
// //   };

// //   if (!exam) {
// //     return <p className="p-6 text-blue-900">Loading Exam...</p>;
// //   }

// //   return (
// //     <div className="max-w-4xl mx-auto p-6 min-h-screen">
// //       <div className="mb-6">
// //         <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-900">
// //           <BookOpen className="w-6 h-6" />
// //           Online Test - {exam.courseCode}
// //         </h2>
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-blue-900">
// //           <p className="flex gap-2 items-center">
// //             <Calendar className="w-4 h-4" /> {exam.examDate}
// //           </p>
// //           <p className="flex gap-2 items-center">
// //             <Clock className="w-4 h-4" /> Duration: {exam.examDurationMinutes} mins
// //           </p>
// //           <p className="flex gap-2 items-center">
// //             <Timer className="w-4 h-4" />
// //             Time Left: {started ? formatTime(timeLeft) : "Not Started"}
// //           </p>
// //         </div>
// //       </div>

// //       {!started && exam.examMode === "Online" && exam.status === "Active" && (
// //         <div className="mb-6">
// //           <button
// //             onClick={handleStartTest}
// //             disabled={loading}
// //             className="bg-blue-900 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-blue-800 transition"
// //           >
// //             <PlayCircle className="w-5 h-5" />
// //             {loading ? "Starting..." : "Start Test"}
// //           </button>
// //         </div>
// //       )}

// //       {started && !submitted && (
// //         <>
// //           <div className="space-y-6">
// //             {questions.map((q, idx) => (
// //               <div key={q.qNo} className="border border-blue-200 rounded-lg p-4 bg-white">
// //                 <p className="text-blue-900 font-medium mb-2">
// //                   Q{idx + 1}. {q.question}
// //                 </p>
// //                 <div className="space-y-2 ml-4">
// //                   {["a", "b", "c", "d"].map((opt) => (
// //                     <label key={opt} className="block">
// //                       <input
// //                         type="radio"
// //                         name={`q-${q.qNo}`}
// //                         value={opt}
// //                         checked={answers[q.qNo] === opt}
// //                         onChange={() => handleOptionSelect(q.qNo, opt)}
// //                         className="mr-2"
// //                         disabled={timerExpired}
// //                       />
// //                       {q.options[opt]}
// //                     </label>
// //                   ))}
// //                 </div>
// //               </div>
// //             ))}
// //           </div>

// //           {!timerExpired && (
// //             <div className="mt-6 text-right">
// //               <button
// //                 onClick={handleSubmitTest}
// //                 className="bg-green-700 text-white px-5 py-2 rounded hover:bg-green-600"
// //               >
// //                 Submit Test
// //               </button>
// //             </div>
// //           )}
// //         </>
// //       )}

// //       {timerExpired && !submitted && (
// //         <div className="mt-8 p-4 bg-red-50 border border-red-300 rounded-lg text-center">
// //           <p className="text-red-600 font-semibold text-lg">⏰ Time's up!</p>
// //           <p className="text-blue-900">Auto-submitting your answers...</p>
// //         </div>
// //       )}

// //       {submitted && (
// //         <div className="mt-8 p-4 bg-green-50 border border-green-300 rounded-lg text-center">
// //           <p className="text-green-700 font-semibold text-lg">✅ Test Submitted Successfully!</p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default GiveTest;
