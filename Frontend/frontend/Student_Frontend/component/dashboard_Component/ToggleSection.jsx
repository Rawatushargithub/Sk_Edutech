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
    console.log("running 1:");
    if (!course) return;
    console.log("runnning :");

    // Fetch Notes and Videos
    fetch(`${API_BASE_URL}/api/v1/recentlyadded/course/resources/${course}`)
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
          if (examData?.latestExam?._id) setExam(examData.latestExam);
          else setExam(null);
        })
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
            <div className="p-4 bg-gradient-to-br from-sky-50 to-white rounded-lg">
              <div className="flex items-center mb-4">
                <FileText className="text-sky-600 mr-2" size={20} />
                <h3 className="text-lg font-bold text-sky-800">Recently Added Notes</h3>
              </div>
              {notes.length === 0 ? (
                <div className="text-center py-6 text-sky-700">
                  <FileText size={36} className="mx-auto mb-2 text-sky-300" />
                  <p>No notes available for your course.</p>
                </div>
              ) : (
                <ul className="divide-y divide-sky-100">
                  {notes.map((note, idx) => (
                    <li key={note._id || idx} className="py-3 flex justify-between items-center">
                      <span className="text-sky-800 font-medium">{note.title}</span>
                      {/* <button
                        onClick={() => navigate("/student/notes")}
                        className="flex items-center px-3 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition"
                      >
                        <Eye size={16} className="mr-2" />
                        View
                      </button> */}

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
            <div className="p-4 bg-gradient-to-br from-sky-50 to-white rounded-lg">
              <div className="flex items-center mb-4">
                <Video className="text-sky-600 mr-2" size={20} />
                <h3 className="text-lg font-bold text-sky-800">Recently Added Videos</h3>
              </div>
              {videos.length === 0 ? (
                <div className="text-center py-6 text-sky-700">
                  <Video size={36} className="mx-auto mb-2 text-sky-300" />
                  <p>No videos available for your course.</p>
                </div>
              ) : (
                <ul className="divide-y divide-sky-100">
                  {videos.map((video, idx) => (
                    <li key={video._id || idx} className="py-3 flex items-center space-x-4">
                      {/* Thumbnail */}
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-16 h-10 object-cover rounded-md border border-sky-100"
                        />
                      ) : (
                        <div className="w-16 h-10 bg-sky-100 flex items-center justify-center rounded-md text-sky-500">
                          <Video size={18} />
                        </div>
                      )}
                      {/* Title */}
                      <span className="text-sky-800 font-medium">{video.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}


        {/* Exam Tab */}
        {tab === "Exam" && (
          <div className="transition-all duration-300 opacity-100">
            <div className="p-4 bg-gradient-to-br from-sky-50 to-white rounded-lg">
              <div className="flex items-center mb-6">
                <BookOpen className="text-sky-600 mr-2" size={20} />
                <h3 className="text-lg font-bold text-sky-800">Upcoming Exam</h3>
              </div>
              {!exam ? (
                <div className="text-center py-12 text-sky-700">
                  <BookOpen size={48} className="mx-auto mb-3 text-sky-300" />
                  <p className="text-lg font-medium">No upcoming exams found</p>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-4 border border-sky-100 text-left">
                  <h4 className="font-semibold text-sky-800 mb-2">{exam.examType} - {exam.batch?.name || ""}</h4>
                  <p className="text-gray-600">Date: {exam.examDate}</p>
                  <p className="text-gray-600">Time: {exam.examStartTime} - {exam.examEndTime}</p>
                  <p className="text-gray-600">Total Marks: {exam.totalMarks}</p>
                  <p className="text-gray-600">Passing Marks: {exam.passingMarks}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToggleSection;
