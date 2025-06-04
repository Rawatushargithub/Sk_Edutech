import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary
const Feedback = () => {
  const student = JSON.parse(localStorage.getItem("student"));
  const studentId = student?.studentId;
  const rollNumber = student?.rollNumber;
  const studentName = student?.name;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/feedback/${studentId}`);
        setFeedbackList(res.data);
      } catch (error) {
        console.error("Failed to load feedbacks", error);
      }
    };

    if (studentId) {
      fetchFeedback();
    }
  }, [studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const feedbackData = {
      studentId,
      studentName,
      rollNumber,
      rating,
      comment,
    };

    try {
      if (editId) {
        await axios.put(`http://localhost:8000/api/v1/feedback/${editId}`, {
          rating,
          comment,
        });
        setEditId(null);
      } else {
        await axios.post("http://localhost:8000/api/v1/feedback", feedbackData);
      }

      const res = await axios.get(`http://localhost:8000/api/v1/feedback/${studentId}`);
      setFeedbackList(res.data);
      setRating(5);
      setComment("");
    } catch (error) {
      console.error("Error submitting feedback", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/feedback/${id}`);
      setFeedbackList((prev) => prev.filter((f) => f._id !== id));
    } catch (error) {
      console.error("Error deleting feedback", error);
    }
  };

  const handleEdit = (feedback) => {
    setEditId(feedback._id);
    setRating(feedback.rating);
    setComment(feedback.comment);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded max-w-xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Feedback Form</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Your Rating:</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                size={28}
                className={`cursor-pointer transition ${
                  (hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Comment:</label>
          <textarea
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {editId ? "Update Feedback" : "Submit Feedback"}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Your Feedback</h3>
        {feedbackList.length === 0 ? (
          <p>No feedback submitted yet.</p>
        ) : (
          <ul className="space-y-4">
            {feedbackList.map((fb) => (
              <li key={fb._id} className="border p-4 rounded bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="flex text-yellow-400">
                    {[...Array(fb.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </span>
                  <div>
                    <button
                      onClick={() => handleEdit(fb)}
                      className="text-blue-500 hover:underline mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(fb._id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-2">{fb.comment}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(fb.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Feedback;
