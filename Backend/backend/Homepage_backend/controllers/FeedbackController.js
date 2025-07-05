import Feedback from "../../Student_backend/models/Feedback.js";

export const getAllFeedbacks = (req, res) => {
  Feedback.find()
    .sort({ createdAt: -1 })
    .then((feedbacks) => {
      res.status(200).json(feedbacks);
    })
    .catch((error) => {
      res.status(500).json({ message: "Failed to fetch feedbacks", error });
    });
};
