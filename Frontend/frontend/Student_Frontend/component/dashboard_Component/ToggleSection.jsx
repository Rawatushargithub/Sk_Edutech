import { useState, useEffect } from "react";
import { FileText, Video, BookOpen, Calendar, ExternalLink, Clock } from "lucide-react";
import API_BASE_URL from "../../../config"; // Adjust the import path as necessary

const ToggleSection = ({ student }) => {
  const [tab, setTab] = useState("Notes");
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);

  // Get student details from localStorage
  const storedStudent = localStorage.getItem("student");
  const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;
  const course = student?.course || parsedStudent?.course;

  useEffect(() => {
    if (!course) return;

    // Fetch Notes (sorted by timestamp)
    fetch(`${API_BASE_URL}/api/notes/${course}`)
      .then((res) => res.json())
      .then((data) => {
        const sortedNotes = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotes(sortedNotes);
      })
      .catch((err) => console.error("Error fetching notes:", err));

    // Fetch Videos (sorted by timestamp)
    fetch(`${API_BASE_URL}/api/videos/${course}`)
      .then((res) => res.json())
      .then((data) => {
        const sortedVideos = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setVideos(sortedVideos);
      })
      .catch((err) => console.error("Error fetching videos:", err));
  }, [student, course]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const tabs = [
    { id: "Notes", icon: <FileText size={18} /> },
    { id: "Videos", icon: <Video size={18} /> },
    { id: "Exam", icon: <BookOpen size={18} /> }
  ];

  return (
    <div className="mt-6 w-full max-w-4xl mx-auto">
      {/* Premium Toggle Buttons with Sliding Effect */}
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
            disabled={item.id === "Exam"}
          >
            <span className="mr-2">{item.icon}</span>
            <span>{item.id}</span>
          </button>
        ))}
      </div>

      {/* Content Section with Improved UI */}
      <div className="bg-white rounded-lg shadow-md border border-sky-100 p-1 transition-all duration-300">
        {/* Notes Tab */}
        <div className={`transition-all duration-300 ${tab === "Notes" ? "opacity-100" : "opacity-0 hidden"}`}>
          <div className="p-4 bg-gradient-to-br from-sky-50 to-white rounded-lg">
            <div className="flex items-center mb-4">
              <FileText className="text-sky-600 mr-2" size={20} />
              <h3 className="text-lg font-bold text-sky-800">Recently Added Notes</h3>
            </div>
            
            {notes.length === 0 ? (
              <div className="text-center py-8 text-sky-700">
                <FileText size={40} className="mx-auto mb-2 text-sky-300" />
                <p>No notes available for your course.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {notes.map((note) => (
                  <li key={note._id} className="bg-white rounded-lg shadow-sm border border-sky-100 overflow-hidden hover:shadow-md transition-all duration-200">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sky-800">{note.title}</h4>
                        <div className="flex items-center text-xs text-sky-600">
                          <Calendar size={14} className="mr-1" />
                          <span>{formatDate(note.timestamp)}</span>
                          <Clock size={14} className="ml-2 mr-1" />
                          <span>{formatTime(note.timestamp)}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-600 line-clamp-2">{note.content}</p>
                      
                      {note.link && (
                        <a 
                          href={note.link} 
                          className="mt-3 inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <span>View Note</span>
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Videos Tab */}
        <div className={`transition-all duration-300 ${tab === "Videos" ? "opacity-100" : "opacity-0 hidden"}`}>
          <div className="p-4 bg-gradient-to-br from-sky-50 to-white rounded-lg">
            <div className="flex items-center mb-4">
              <Video className="text-sky-600 mr-2" size={20} />
              <h3 className="text-lg font-bold text-sky-800">Recently Added Videos</h3>
            </div>
            
            {videos.length === 0 ? (
              <div className="text-center py-8 text-sky-700">
                <Video size={40} className="mx-auto mb-2 text-sky-300" />
                <p>No videos available for your course.</p>
              </div>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {videos.map((video) => (
                  <li key={video._id} className="bg-white rounded-lg shadow-sm border border-sky-100 overflow-hidden hover:shadow-md transition-all duration-200">
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sky-800">{video.title}</h4>
                          <div className="text-xs text-sky-600 mt-1 flex items-center">
                            <Calendar size={14} className="mr-1" />
                            <span>{formatDate(video.createdAt)}</span>
                          </div>
                        </div>
                        <button
                          className="ml-4 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors flex items-center shadow-sm"
                        >
                          <Video size={16} className="mr-1" />
                          <span>Watch</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Exam Tab */}
        <div className={`transition-all duration-300 ${tab === "Exam" ? "opacity-100" : "opacity-0 hidden"}`}>
          <div className="p-4 bg-gradient-to-br from-sky-50 to-white rounded-lg">
            <div className="flex items-center mb-6">
              <BookOpen className="text-sky-600 mr-2" size={20} />
              <h3 className="text-lg font-bold text-sky-800">Upcoming Exams</h3>
            </div>
            
            <div className="text-center py-12 text-sky-700">
              <BookOpen size={48} className="mx-auto mb-3 text-sky-300" />
              <p className="text-lg font-medium">Exam features coming soon!</p>
              <p className="text-sm text-sky-600 mt-2">Check back later for updates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToggleSection;