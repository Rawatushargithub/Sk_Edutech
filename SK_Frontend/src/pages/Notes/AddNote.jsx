import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddNote = ({ notes = [], setNotes = () => {} }) => { // Default values
  const navigate = useNavigate();
  const [note, setNote] = useState({
    course: "",
    title: "",
    content: "",
    date: new Date().toLocaleString(),
    link: "",
    file: null,
    uploadType: "link",
  });

  const courses = ["BCA", "MBA", "B.Tech", "M.Tech", "B.Sc"];

  const handleSave = async () => {
    try {
      if (!note.course || !note.title || (!note.link && !note.file)) {
        alert("All fields are mandatory!");
        return;
      }

      const formData = new FormData();
      formData.append("course", note.course);
      formData.append("title", note.title);
      formData.append("content", note.content);
      formData.append("date", note.date);
      if (note.uploadType === "link") {
        formData.append("link", note.link);
      } else {
        formData.append("file", note.file);
      }

      const res = await axios.post("http://localhost:8000/api/v1/note", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNotes(prevNotes => [...(prevNotes || []), res.data]); // Update notes
      navigate("/");
    } catch (err) {
      alert("Failed to add note. Try again.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold text-green-600 mb-4">📝 Add New Note</h1>
      <div className="bg-white p-6 shadow-md rounded">
        <label className="block text-gray-700">Select Course</label>
        <select className="w-full p-2 border rounded mb-3" value={note.course} onChange={(e) => setNote({ ...note, course: e.target.value })}>
          <option value="">-- Select Course --</option>
          {courses.map((course) => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>

        <label className="block text-gray-700">Title</label>
        <input type="text" className="w-full p-2 border rounded mb-3" value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} />

        <label className="block text-gray-700">Upload Type</label>
        <div className="flex space-x-4 mb-3">
          <button className={`px-4 py-2 rounded ${note.uploadType === "link" ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={() => setNote({ ...note, uploadType: "link", file: null })}>Google Drive Link</button>
          <button className={`px-4 py-2 rounded ${note.uploadType === "file" ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={() => setNote({ ...note, uploadType: "file", link: "" })}>Upload PDF</button>
        </div>

        {note.uploadType === "link" && (
          <>
            <label className="block text-gray-700">Google Drive Link</label>
            <input type="text" className="w-full p-2 border rounded mb-3" placeholder="Paste Google Drive link here" value={note.link} onChange={(e) => setNote({ ...note, link: e.target.value })} />
          </>
        )}

        {note.uploadType === "file" && (
          <>
            <label className="block text-gray-700">Upload PDF</label>
            <input type="file" accept="application/pdf" className="w-full p-2 border rounded mb-3" onChange={(e) => setNote({ ...note, file: e.target.files[0] })} />
          </>
        )}

        <div className="flex space-x-4">
          <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
          <button onClick={() => navigate("/Notes")} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddNote;
