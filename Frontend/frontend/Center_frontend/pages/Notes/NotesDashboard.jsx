import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 

const API_URL = "http://localhost:8000/api/v1/institute_note"; // Update with your backend URL

const NotesDashboard = () => { 
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const courses = ["All", "BCA", "MBA", "B.Tech", "M.Tech", "B.Sc"];

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setNotes(response.data); // Assuming response.data is an array
    } catch (error) {
      setError("Failed to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      alert("Failed to delete note");
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      (selectedCourse === "All" || selectedCourse === "" || note.course === selectedCourse) &&
      note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">📚 My Notes</h1>

      {/* Search & Add Note Button */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search notes..."
          className="p-2 border rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => navigate('/institute/AddNote')}
          className="ml-2 bg-green-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          + Add Note
        </button>
      </div>

      {/* Course Category Filter */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Filter by Course</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      {/* Loading & Error Handling */}
      {loading ? (
        <p className="text-center text-gray-500">Loading notes...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => (
              <div key={note.id || index} className="bg-white p-4 shadow-md rounded">
                <h2 className="font-bold text-lg">{note.title}</h2>
                <p className="text-gray-600">{note.course}</p>
                <p className="text-gray-500 text-sm">{note.date}</p>

                {/* Display Google Drive Link or Uploaded PDF */}
                {note.link ? (
                  <a href={note.link} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Note</a>
                ) : note.fileUrl ? (
                  <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">Download PDF</a>
                ) : (
                  <p className="text-red-500">No file or link available</p>
                )}

                <div className="mt-2 flex justify-between">
                  <button onClick={() => navigate(`/note/${note.id}`)} className="text-blue-500">View</button>
                  <button onClick={() => handleDelete(note.id)} className="text-red-500">Delete</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-3">No notes found for this category.</p>
          )}
        </div>

      )}
    </div>
  );
};

export default NotesDashboard;
