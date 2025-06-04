import { useState, useEffect } from "react";
import { Search, Eye, X, ZoomIn, ZoomOut, Maximize, FileText, Filter } from "lucide-react";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary
const Notes = ({ student }) => {
  const [notes, setNotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const notesPerPage = 12;

  const storedStudent = localStorage.getItem("student");
  const parsedStudent = storedStudent ? JSON.parse(storedStudent) : null;

  useEffect(() => {
    const course = student?.course || parsedStudent?.course;
    if (!course) return;

    setLoading(true);
    fetch(`${API_BASE_URL}/api/notes/${course}`)
      .then((res) => res.json())
      .then((data) => {
        // Sort by date if available
        const sortedData = data.sort((a, b) => {
          if (a.date && b.date) {
            return new Date(b.date) - new Date(a.date);
          }
          return 0;
        });
        setNotes(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching notes:", err);
        setLoading(false);
      });
  }, [student]);

  // Filter notes based on search input
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);
  
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-sky-100 mb-6 overflow-hidden">
          <div className="bg-sky-500 p-5 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <FileText size={24} className="mr-3" />
                <h2 className="text-2xl font-bold">Course Notes</h2>
                {(student?.course || parsedStudent?.course) && (
                  <span className="ml-3 bg-sky-400 bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium">
                    {student?.course || parsedStudent?.course}
                  </span>
                )}
              </div>
              
              {/* Search Bar */}
              <div className="mt-4 md:mt-0 relative">
                <div className="flex items-center bg-white bg-opacity-20 rounded-lg overflow-hidden">
                  <div className="absolute left-3 pointer-events-none">
                    <Search size={18} className="text-white" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 py-2 pl-10 pr-3 bg-transparent border border-sky-300 border-opacity-50 rounded-lg focus:ring-2 focus:ring-white focus:border-white placeholder-sky-100 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter Stats */}
          <div className="px-5 py-3 bg-sky-50 border-b border-sky-100 flex flex-wrap items-center justify-between">
            <div className="flex items-center text-sky-800">
              <Filter size={16} className="mr-2" />
              <span className="text-sm">
                Showing {filteredNotes.length > 0 ? `${indexOfFirstNote + 1}-${Math.min(indexOfLastNote, filteredNotes.length)} of ` : ""}{filteredNotes.length} notes
              </span>
            </div>
            {searchTerm && (
              <div className="flex items-center mt-2 sm:mt-0">
                <span className="text-sm text-sky-600 mr-2">
                  Filter: "{searchTerm}"
                </span>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-sky-600 hover:text-sky-800 p-1 rounded-full hover:bg-sky-100"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        )}

        {/* No Notes State */}
        {!loading && filteredNotes.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-sky-100 p-8 text-center">
            <div className="bg-sky-50 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
              <FileText size={24} className="text-sky-400" />
            </div>
            <h3 className="mt-4 text-xl font-medium text-sky-800">No notes found</h3>
            <p className="mt-2 text-sky-600">
              {searchTerm
                ? "Try adjusting your search query."
                : "No notes available for your course yet."}
            </p>
          </div>
        )}

        {/* Notes Grid */}
        {!loading && filteredNotes.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentNotes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white rounded-xl shadow-md border border-sky-100 overflow-hidden transition-all hover:shadow-lg hover:translate-y-[-2px] flex flex-col"
                >
                  <div className="p-5 flex-grow">
                    <h3 className="text-xl font-semibold text-sky-800 mb-1 line-clamp-1">{note.title}</h3>
                    <p className="text-sm text-sky-500 mb-3 flex items-center">
                      <span className="mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                      {formatDate(note.date || note.timestamp)}
                    </p>
                    <p className="text-gray-600 line-clamp-3">{note.content}</p>
                  </div>
                  {note.link && (
                    <div className="px-5 pb-4">
                      <button
                        onClick={() => setSelectedNote(note)}
                        className="w-full text-white bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                      >
                        <Eye size={18} className="mr-2" />
                        View Note
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex rounded-lg shadow-sm">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-l-lg border ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        : "bg-white text-sky-600 hover:bg-sky-50 border-sky-200"
                    }`}
                  >
                    Previous
                  </button>
                  <div className="px-4 py-2 bg-sky-500 text-white border-t border-b border-sky-500">
                    {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-r-lg border ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        : "bg-white text-sky-600 hover:bg-sky-50 border-sky-200"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for Viewing Notes */}
      {selectedNote && (
        <div className="fixed inset-0 flex items-center justify-center bg-sky-900 bg-opacity-75 z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full flex flex-col max-h-[90vh] border border-sky-200">
            <div className="flex justify-between items-center p-4 border-b border-sky-100">
              <h2 className="text-xl font-bold text-sky-800 line-clamp-1">{selectedNote.title}</h2>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-sky-500 hover:text-sky-700 hover:bg-sky-50 rounded-full p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Zoom & Full-Screen Controls */}
            <div className="flex justify-between items-center p-3 bg-sky-50 border-b border-sky-100">
              <div className="flex items-center">
                <button
                  onClick={() => setZoom((prev) => Math.min(prev + 0.2, 2))}
                  className="p-2 bg-white hover:bg-sky-100 text-sky-600 rounded-l-lg flex items-center border border-sky-200"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.5))}
                  className="p-2 bg-white hover:bg-sky-100 text-sky-600 rounded-r-lg flex items-center border-t border-r border-b border-sky-200"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="ml-3 text-sm text-sky-700">
                  Zoom: {Math.round(zoom * 100)}%
                </span>
              </div>
              <button
                onClick={() => {
                  const iframe = document.getElementById("notePreview");
                  if (iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                  } else if (iframe.mozRequestFullScreen) {
                    iframe.mozRequestFullScreen();
                  } else if (iframe.webkitRequestFullscreen) {
                    iframe.webkitRequestFullscreen();
                  } else if (iframe.msRequestFullscreen) {
                    iframe.msRequestFullscreen();
                  }
                }}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg flex items-center shadow-sm transition-colors"
              >
                <Maximize size={18} className="mr-2" />
                Full Screen
              </button>
            </div>

            {/* Note Preview */}
            <div className="flex-grow overflow-hidden bg-gray-100">
              <iframe
                id="notePreview"
                src={selectedNote.link}
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%`, height: `${100 / zoom}%` }}
                className="border-0"
                title={selectedNote.title}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;