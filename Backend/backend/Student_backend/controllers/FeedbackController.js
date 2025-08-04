import Feedback from "../models/Feedback.js";

// CREATE feedback
export const submitFeedback = async (req, res) => {
  try {
    const { studentId, studentName, rollNumber, rating = 3, comment, franchiseId } = req.body;

    if (!studentId || !studentName || !rollNumber || !comment || !franchiseId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const feedback = await Feedback.create({
      studentId,
      studentName,
      rollNumber,
      rating,
      comment,
      franchiseId
    });

    res.status(201).json({ message: "Feedback submitted", feedback });
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error: error.message });
  }
};


// GET feedback for a specific student
export const getFeedbackByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const feedbacks = await Feedback.find({ studentId }).sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving feedback" });
  }
};

// UPDATE feedback
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const updated = await Feedback.findByIdAndUpdate(id, { rating, comment }, { new: true });

    if (!updated) return res.status(404).json({ message: "Feedback not found" });

    res.status(200).json({ message: "Feedback updated", feedback: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating feedback" });
  }
};

// DELETE feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Feedback.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Feedback not found" });

    res.status(200).json({ message: "Feedback deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting feedback" });
  }
};
