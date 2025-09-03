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
  ChevronLeft,
  ChevronRight,
  SkipForward,
  CheckCircle,
  Circle,
  MinusCircle,
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());
  
  // Time validation states
  const [examTimeStatus, setExamTimeStatus] = useState("checking");
  const [timeUntilStart, setTimeUntilStart] = useState(0);
  const [timeUntilEnd, setTimeUntilEnd] = useState(0);

  // Fetch student from localStorage
  const storedStudent = localStorage.getItem("student");
  const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;
  const rollNumber = parsedStudent?.rollNumber;

  // Helper functions (keeping the same as original)
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getCurrentTimeInMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const minutesToTimeString = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const checkExamTimeValidity = (examData) => {
    const currentTime = getCurrentTimeInMinutes();
    const examStartMinutes = timeToMinutes(examData.examStartTime);
    const examEndMinutes = timeToMinutes(examData.examEndTime);

    const minutesUntilStart = examStartMinutes - currentTime;
    const minutesUntilEnd = examEndMinutes - currentTime;

    setTimeUntilStart(Math.max(0, minutesUntilStart));
    setTimeUntilEnd(Math.max(0, minutesUntilEnd));

    if (minutesUntilStart > 0) {
      setExamTimeStatus("not_started");
      return false;
    } else if (minutesUntilEnd <= 0) {
      setExamTimeStatus("ended");
      return false;
    } else {
      setExamTimeStatus("active");
      return true;
    }
  };

  // Get question status for sidebar
  const getQuestionStatus = (qNo) => {
    if (answers[qNo]) return "answered";
    if (skippedQuestions.has(qNo)) return "skipped";
    return "unanswered";
  };

  // Get stats for sidebar
  const getStats = () => {
    const answered = Object.keys(answers).length;
    const skipped = skippedQuestions.size;
    const unanswered = questions.length - answered - skipped;
    return { answered, skipped, unanswered, total: questions.length };
  };

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const skipCurrentQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setSkippedQuestions(prev => new Set([...prev, currentQuestion.qNo]));
    // Remove from answers if it was previously answered
    if (answers[currentQuestion.qNo]) {
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestion.qNo];
      setAnswers(newAnswers);
    }
    goToNextQuestion();
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // All the original useEffects and handlers remain the same
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}`);
        const data = await res.json();
        if (res.ok) {
          setExam(data.exam);
          checkExamTimeValidity(data.exam);
        }
      } catch (err) {
        console.error("Failed to fetch exam:", err);
      }
    };
    fetchExam();
  }, [id]);

  useEffect(() => {
    if (exam && examTimeStatus !== "active") {
      const interval = setInterval(() => {
        checkExamTimeValidity(exam);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [exam, examTimeStatus]);

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

  // All original handler functions remain the same
  const handleAutoSubmit = async (reason = "Time expired") => {
    if (submitted || !rollNumber) return;
    console.log(`Auto-submitting exam. Reason: ${reason}`);
    
    try {
      setSubmitted(true);
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
        toast.success(`Test Auto-Submitted! Reason: ${reason}\nScore: ${result.marksObtained || 'N/A'}\nStatus: ${result.status || 'Completed'}`);
      } else {
        toast.error(result.message || "Auto-submission failed");
      }
    } catch (err) {
      console.error("Auto-submission error:", err);
      toast.error("Failed to submit exam automatically");
    } finally {
      try {
        if (document.exitFullscreen && document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.log("Fullscreen exit error:", err);
      }
    }
  };

  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );

    setIsFullscreen(isCurrentlyFullscreen);

    if (!isCurrentlyFullscreen && started && !submitted) {
      toast.error("Fullscreen mode exited! Auto-submitting exam...");
      setTimeout(() => {
        handleAutoSubmit("Exited fullscreen mode");
      }, 100);
    }
  };

  useEffect(() => {
    if (started && !submitted) {
      enterFullscreen();
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("contextmenu", handleContextMenu);

      const handleBeforeUnload = (e) => {
        if (!submitted) {
          e.preventDefault();
          e.returnValue = "Are you sure you want to leave the exam? This will auto-submit your test.";
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
        e.key === "Escape"
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
      `Security Violation ${newViolations}/3: ${violationType}`,
      { 
        icon: <ShieldOff className="text-yellow-600" />,
        autoClose: 3000 
      }
    );

    if (newViolations >= 3) {
      toast.error("Maximum violations reached! Auto-submitting exam...");
      setTimeout(() => {
        handleAutoSubmit("Maximum security violations reached (3/3)");
      }, 1000);
    } else {
      if (!isFullscreen) {
        enterFullscreen();
      }
    }

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

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleStartTest = async () => {
    if (!checkExamTimeValidity(exam)) {
      toast.error("Cannot start exam: Time constraints not met");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/exams/online/${id}/questions`);
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions);
        setStarted(true);

        const currentTime = getCurrentTimeInMinutes();
        const examEndMinutes = timeToMinutes(exam.examEndTime);
        const timeUntilEndInMinutes = examEndMinutes - currentTime;
        const maxTimeAvailable = Math.min(exam.examDurationMinutes, timeUntilEndInMinutes);

        setTimeLeft(maxTimeAvailable * 60);
        toast.success("Exam started! Entering fullscreen mode...");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to start exam");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handlePrintScreen = (e) => {
      if (e.key === "PrintScreen" && started && !submitted) {
        e.preventDefault();
        toast.error("Screenshot detected!");
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
        toast.success(`Test Submitted Successfully!`);
      } else {
        toast.error(result.message || "Submission failed");
      }
    } catch (err) {
      console.error("Manual submission error:", err);
      toast.error("Failed to submit exam");
    } finally {
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
      // Remove from skipped questions if it was skipped before
      if (skippedQuestions.has(qNo)) {
        setSkippedQuestions(prev => {
          const newSet = new Set(prev);
          newSet.delete(qNo);
          return newSet;
        });
      }
    }
  };

  const renderTimeRestrictionMessage = () => {
    switch (examTimeStatus) {
      case "not_started":
        return (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">Exam Not Started Yet</h3>
            <p className="text-blue-700 mb-4">
              The exam will start at <strong>{exam.examStartTime}</strong>
            </p>
            <p className="text-blue-600">
              Time until start: <strong>{formatDuration(timeUntilStart)}</strong>
            </p>
          </div>
        );
      
      case "ended":
        return (
          <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">Exam Time Has Ended</h3>
            <p className="text-red-700">
              The exam ended at <strong>{exam.examEndTime}</strong>
            </p>
            <p className="text-red-600 mt-2">You can no longer take this exam.</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!exam) {
    return <p className="p-6 text-blue-900">Loading Exam...</p>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const stats = getStats();

  return (
    <div className="flex max-w-7xl mx-auto p-6 min-h-screen gap-6 bg-cover bg-center"  style={{ backgroundImage: "url('/testbackground.png')" }} ref={fullscreenRef}>
      {/* Warning Message */}
      {warningMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {warningMessage}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-blue-900">
            <p className="flex gap-2 items-center">
              <Calendar className="w-4 h-4" /> {exam.examDate}
            </p>
            <p className="flex gap-2 items-center">
              <Clock className="w-4 h-4" /> {exam.examStartTime} - {exam.examEndTime}
            </p>
            <p className="flex gap-2 items-center">
              <Timer className="w-4 h-4" /> Duration: {exam.examDurationMinutes} mins
            </p>
            <p className="flex gap-2 items-center">
              <Timer className="w-4 h-4" />
              <span className={timeLeft <= 300 ? "text-red-600 font-bold animate-pulse" : ""}>
                Time Left: {started ? formatTime(timeLeft) : "Not Started"}
              </span>
            </p>
          </div>
        </div>

        {/* Show time restriction messages */}
        {examTimeStatus !== "active" && renderTimeRestrictionMessage()}

        {/* Pre-exam Instructions */}
        {!started && examTimeStatus === "active" && exam.examMode === "Online" && exam.status === "Active" && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">Important Security Instructions:</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>The exam will start in fullscreen mode</li>
              <li>Do NOT switch tabs, windows, or exit fullscreen</li>
              <li>Right-click and keyboard shortcuts are disabled</li>
              <li>Exiting fullscreen will AUTO-SUBMIT your exam immediately</li>
              <li>3 violations will result in automatic submission</li>
              <li>The test will auto-submit when time expires</li>
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

        {/* Question Panel */}
        {started && !submitted && currentQuestion && (
          <div className="space-y-6 bg-cover bg-center" style={{ backgroundImage: "url('/testbackground.png')" }}>
            {/* Question Counter */}
            <div className="bg-blue-50 p-3 rounded-lg border">
              <p className="text-blue-800 font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>

            {/* Current Question */}
            <div className="border border-blue-200 rounded-lg p-6 bg-white shadow-sm">
              <p className="text-blue-900 font-medium mb-4 text-lg">
                Q{currentQuestionIndex + 1}. {currentQuestion.question}
              </p>
              <div className="space-y-3 ml-4">
                {["a", "b", "c", "d"].map((opt) => (
                  <label key={opt} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded transition">
                    <input
                      type="radio"
                      name={`q-${currentQuestion.qNo}`}
                      value={opt}
                      checked={answers[currentQuestion.qNo] === opt}
                      onChange={() => handleOptionSelect(currentQuestion.qNo, opt)}
                      className="w-4 h-4 text-blue-600"
                      disabled={timerExpired || submitted}
                    />
                    <span className="text-gray-700 text-base">{currentQuestion.options[opt]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex gap-3">
                <button
                  onClick={skipCurrentQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip
                </button>

                <button
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            {!timerExpired && !submitted && (
              <div className="text-center pt-4">
                <button
                  onClick={handleManualSubmit}
                  className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition font-semibold text-lg"
                >
                  Submit Test
                </button>
              </div>
            )}
          </div>
        )}

        {/* Timer Expired Message */}
        {timerExpired && !submitted && (
          <div className="mt-8 p-6 bg-red-50 border border-red-300 rounded-lg text-center">
            <p className="text-red-600 font-semibold text-xl">Time's Up!</p>
            <p className="text-blue-900 mt-2">Auto-submitting your answers...</p>
          </div>
        )}

        {/* Submitted Message */}
        {submitted && (
          <div className="mt-8 p-6 bg-green-50 border border-green-300 rounded-lg text-center">
            <p className="text-green-700 font-semibold text-xl">Test Submitted Successfully!</p>
            <p className="text-blue-900 mt-2">You can now close this window.</p>
          </div>
        )}
      </div>

      {/* Sidebar - Only show during test */}
      {started && !submitted && questions.length > 0 && (
        <div className="w-80 bg-white border border-gray-200 rounded-lg p-4 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Test Progress</h3>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="text-center p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-2xl font-bold text-green-700">{stats.answered}</div>
              <div className="text-sm text-green-600">Answered</div>
            </div>
            <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded">
              <div className="text-2xl font-bold text-orange-700">{stats.skipped}</div>
              <div className="text-sm text-orange-600">Skipped</div>
            </div>
            <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="text-2xl font-bold text-gray-700">{stats.unanswered}</div>
              <div className="text-sm text-gray-600">Unanswered</div>
            </div>
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-sm text-blue-600">Total</div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-blue-900 mb-3">Question Navigator</h4>
            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
              {questions.map((q, index) => {
                const status = getQuestionStatus(q.qNo);
                const isActive = index === currentQuestionIndex;
                
                return (
                  <button
                    key={q.qNo}
                    onClick={() => goToQuestion(index)}
                    className={`p-2 text-sm rounded flex items-center justify-center min-h-[40px] transition ${
                      isActive 
                        ? "ring-2 ring-blue-500 font-bold" 
                        : ""
                    } ${
                      status === "answered"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : status === "skipped"
                        ? "bg-orange-100 text-orange-800 border border-orange-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    <span className="mr-1">
                      {status === "answered" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : status === "skipped" ? (
                        <MinusCircle className="w-3 h-3" />
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                    </span>
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-blue-900 mb-3">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <MinusCircle className="w-4 h-4 text-orange-600" />
                <span>Skipped</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-gray-600" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiveTest;