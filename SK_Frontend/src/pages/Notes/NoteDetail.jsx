import React from "react";
import { useNavigate, useParams } from "react-router-dom";
 
const NoteDetail = ({ notes }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const note = notes.find((n) => n.id === parseInt(id));

  if (!note) return <h1 className="text-center text-red-500">Note Not Found!</h1>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">{note.title}</h1>
      <p className="text-gray-600">{note.course}</p>
      <p className="text-gray-500 text-sm">{note.date}</p>
      <p className="mt-4">{note.content}</p>
      <button onClick={() => navigate("/Notes")} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">
        Back
      </button>
    </div>
  );
};

export default NoteDetail;
