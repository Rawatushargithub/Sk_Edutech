import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FileText, Video, BookOpen, ViewIcon } from "lucide-react";
import API_BASE_URL from "../../../config"; // Adjust the import path as necessary
// import { parse } from "path";

const ToggleSection = ({ student }) => {
  const [tab, setTab] = useState("Notes");
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [exam, setExam] = useState(null);
  const navigate = useNavigate();
  // Extract student, course, and batch info from localStorage or props
  const storedStudent = localStorage.getItem("student");
  const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;

  const course = student?.courseCode || parsedStudent?.courseCode;
  const rollNumber = student?.rollNumber || parsedStudent?.rollNumber;
  const franchiseId = student?.franchiseId || parsedStudent?.franchiseId;
  console.log(rollNumber, franchiseId);
  // console.log("runnning course  :", course);
 
  const batchId = parsedStudent?.batch?.id || student?.batch?.id;

  // Fetch notes, videos, and exam details
  useEffect(() => {

    if (!course) return;

 let courseCode = course
    // Fetch Notes and Videos
    fetch(`${API_BASE_URL}/api/v1/recentlyadded/course/resources/${courseCode}`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
  
        setNotes(data.notes || []);
        setVideos(data.videos || []);
        // console.log("running");
        // console.log("running :", notes);
      })
      .catch((err) => console.error("Error fetching resources:", err));

    // Fetch Latest Exam
    if (rollNumber && franchiseId) {
      const encodedRoll = encodeURIComponent(rollNumber);
      const encodedFranchise = encodeURIComponent(franchiseId);

      fetch(`${API_BASE_URL}/api/v1/recentlyadded/course/exam/${encodedRoll}/${encodedFranchise}`)
        .then((res) => res.json())
        .then((examData) => {
          if (examData?.length > 0) setExam(examData); // store full array
          else setExam([]);
        })
        // .catch((err) => setExam([]));
        .catch((err) => setExam(null));
    }

  }, [student, course, rollNumber, franchiseId]);

  // Format date and time utility
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Utility: check if exam is upcoming
  const isUpcomingExam = (exam) => {
    if (!exam.examDate || !exam.examStartTime) return false;

    // Current time
    const now = new Date();

    // Build exam start datetime
    const [startHour, startMinute] = exam.examStartTime.split(":").map(Number);
    const examDateTime = new Date(exam.examDate);
    examDateTime.setHours(startHour, startMinute, 0, 0);

    return examDateTime >= now; // upcoming if in future
  };


  // Tabs configuration
  const tabs = [
    { id: "Notes", icon: <FileText size={18} /> },
    { id: "Videos", icon: <Video size={18} /> },
    { id: "Exam", icon: <BookOpen size={18} /> }
  ];

  return (
    <div className="mt-6 w-full max-w-4xl mx-auto">
      {/* Toggle Buttons */}
      <div className="relative bg-sky-100 p-1 rounded-lg mb-6 flex justify-between">
        <div
          className="absolute h-10 bg-sky-500 rounded-md transition-all duration-300 shadow-md z-0"
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${tabs.findIndex(t => t.id === tab) * 100}%)`
          }}
        />
        {tabs.map((item) => (
          <button
            key={item.id}
            className={`relative z-10 flex items-center justify-center py-2 px-4 rounded-md font-medium w-full transition-all duration-300 
              ${tab === item.id ? "text-white" : "text-sky-600 hover:text-sky-800"}`}
            onClick={() => setTab(item.id)}
          >
            <span className="mr-2">{item.icon}</span>
            <span>{item.id}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md border border-sky-100 p-1 transition-all duration-300">

        {/* Notes Tab */}
        {tab === "Notes" && (
          <div className="transition-all duration-300 opacity-100">
            <div className="p-4 bg-gradient-to-br from-sky-50 to-white rounded-xl shadow">

              {/* Header */}
              <div className="flex items-center mb-6">
                <FileText className="text-sky-600 mr-2" size={22} />
                <h3 className="text-xl font-bold text-sky-800 tracking-wide">
                  Recently Added Notes
                </h3>
              </div>

              {/* Empty State */}
              {notes.length === 0 ? (
                <div className="text-center py-12 text-sky-700">
                  <FileText size={48} className="mx-auto mb-3 text-sky-300" />
                  <p className="text-lg font-medium">No notes available for your course.</p>
                </div>
              ) : (
                <ul className="list-disc list-inside space-y-2 text-sky-800">
                  {notes.map((note, idx) => (
                    <li
                      key={note._id || idx}
                      className="font-medium text-base leading-relaxed"
                    >
                      {note.title}
                      {note.addedOn && (
                        <span className="ml-2 text-xs text-gray-500">
                          (📅 {new Date(note.addedOn).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}



        {/* Videos Tab */}
        {tab === "Videos" && (
          <div className="transition-all duration-300 opacity-100">
            <div className="p-4 bg-gradient-to-br from-sky-50 to-white rounded-xl shadow">
              {/* Header */}
              <div className="flex items-center mb-6">
                <Video className="text-sky-600 mr-2" size={22} />
                <h3 className="text-xl font-bold text-sky-800 tracking-wide">
                  Recently Added Videos
                </h3>
              </div>

              {/* Empty State */}
              {videos.length === 0 ? (
                <div className="text-center py-12 text-sky-700">
                  <Video size={48} className="mx-auto mb-3 text-sky-300" />
                  <p className="text-lg font-medium">No videos available for your course.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {videos.map((video, idx) => (
                    <li
                      key={video._id || idx}
                      className="flex flex-col sm:flex-row bg-white rounded-lg shadow-sm border border-sky-100 hover:shadow-md transition-all duration-200"
                    >
                      {/* Thumbnail */}
                      <div className="w-full sm:w-40 h-28 sm:h-auto flex-shrink-0 relative">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                          />
                        ) : (
                          <div className="w-full h-full bg-sky-100 flex items-center justify-center text-sky-600">
                            <Video size={28} />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-col justify-center p-4 flex-1">
                        <h4 className="text-sky-800 font-semibold text-base line-clamp-2">
                          {video.title}
                        </h4>
                        {video.duration && (
                          <p className="text-sm text-gray-500 mt-1">⏱ {video.duration}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}



        {/* Exam Tab */}
        {/* Exam Tab */}
{tab === "Exam" && (
  <div className="transition-all duration-300 opacity-100">
    <div className="p-4 bg-gradient-to-br from-sky-50 to-white rounded-xl shadow">
      {/* Section Header */}
      <div className="flex items-center mb-6">
        <BookOpen className="text-sky-600 mr-2" size={22} />
        <h3 className="text-xl font-bold text-sky-800 tracking-wide">
          Upcoming Exams
        </h3>
      </div>

      {/* Filter exams */}
      {(!exam || exam.filter(isUpcomingExam).length === 0) ? (
        <div className="text-center py-12 text-sky-700">
          <BookOpen size={48} className="mx-auto mb-3 text-sky-300" />
          <p className="text-lg font-medium">No upcoming exams found</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {exam
            .filter(isUpcomingExam)
            .map((ex) => (
              <li
                key={ex._id}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-white shadow-sm border border-sky-100 hover:shadow-md hover:scale-[1.01] transition-all duration-200"
              >
                {/* Column 1: Title + Batch */}
                <div>
                  <p className="text-sky-800 font-semibold">
                    {ex.examType} - {ex.batch?.name || ""}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    {ex.courseCode} • {ex.batch?.timings || "N/A"}
                  </p>
                </div>

                {/* Column 2: Date & Time */}
                <div className="text-gray-700 space-y-1">
                  <p>
                    📅 <strong>Date:</strong>{" "}
                    {new Date(ex.examDate).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p>
                    ⏰ <strong>Time:</strong> {ex.examStartTime} -{" "}
                    {ex.examEndTime}
                  </p>
                </div>

                {/* Column 3: Duration & Marks */}
                <div className="text-gray-700 space-y-1">
                  <p>
                    ⏳ <strong>Duration:</strong> {ex.examDurationMinutes}m
                  </p>
                  <p>
                    📝 <strong>Marks:</strong> {ex.totalMarks} | ✅ Pass:{" "}
                    {ex.passingMarks}
                  </p>
                </div>

                {/* Column 4: Mode */}
                <div className="text-gray-700 flex items-center">
                  🎓 <span className="ml-1">{ex.examMode}</span>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  </div>
)}



      </div>
    </div>
  );
};

export default ToggleSection;
