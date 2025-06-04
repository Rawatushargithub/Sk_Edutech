import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaEdit, FaTrash, FaPaperPlane } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import {
  MessageSquare,
  CheckCircle,
  Lightbulb,
  Users,
  Star
} from 'lucide-react';
import API_BASE_URL from "../../config";

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
        await axios.put(`${API_BASE_URL}/api/v1/feedback/${editId}`, { rating, comment });
        setEditId(null);
      } else {
        await axios.post("${API_BASE_URL}/api/v1/feedback", feedbackData);
      }

      const res = await axios.get(`${API_BASE_URL}/api/v1/feedback/${studentId}`);
      setFeedbackList(res.data);
      setRating(5);
      setComment("");
    } catch (error) {
      console.error("Error submitting feedback", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/feedback/${id}`);
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
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Panel - Feedback Form */}
        <div className="border border-blue-950 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-blue-950 flex items-center gap-2">
            <FiMessageCircle className="text-cyan-600" /> Feedback Form
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-semibold">Your Rating:</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={24}
                    className={`cursor-pointer transition ${(hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"
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
                className="w-full p-3 rounded bg-white border border-blue-950 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Share your thoughts..."
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-950 hover:bg-blue-900 text-white px-5 py-2 rounded-md transition"
            >
              <FaPaperPlane />
              {editId ? "Update Feedback" : "Submit Feedback"}
            </button>
          </form>
          <div className="bg-gray-50 border mt-5 border-gray-200 p-6 rounded-xl max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
              <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
              We Value Your Feedback!
            </h3>

            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2" />
                Helps us understand what we're doing well and where we can improve.
              </li>
              <li className="flex items-start">
                <Users className="w-5 h-5 text-blue-600 mt-1 mr-2" />
                Helps future students make informed decisions.
              </li>
              <li className="flex items-start">
                <Lightbulb className="w-5 h-5 text-yellow-500 mt-1 mr-2" />
                Shows us what experiences had the biggest impact on your learning.
              </li>
              <li className="flex items-start">
                <Star className="w-5 h-5 text-yellow-400 mt-1 mr-2" />
                Motivates our staff and faculty to keep doing their best!
              </li>
            </ul>
          </div>

        </div>

        {/* Right Panel - Feedback List */}
        <div className="border border-blue-950 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold mb-6 text-blue-950">Your Feedback</h3>
          {feedbackList.length === 0 ? (
            <p className="text-gray-500">No feedback submitted yet.</p>
          ) : (
            <ul className="space-y-4">
              {feedbackList.map((fb) => (
                <li
                  key={fb._id}
                  className="p-4 bg-white border border-blue-950 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(fb.rating)].map((_, i) => (
                          <FaStar key={i} />
                        ))}
                      </div>
                      <p className="mt-2">{fb.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(fb.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex-shrink-0 space-x-3 text-xl">
                      <button onClick={() => handleEdit(fb)} className="text-blue-700 hover:text-blue-600">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(fb._id)} className="text-red-500 hover:text-red-400">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
