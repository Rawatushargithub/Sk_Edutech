// import Feedback from "../../Student_backend/models/Feedback.js";
import Feedback from "../../Student_backend/models/Feedback.js";
import Franchise from "../../Admin_Backend/models/franchise/franchise.models.js";

export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    // Get unique franchiseIds from feedback
    const franchiseIds = [...new Set(feedbacks.map(fb => fb.franchiseId))];

    // Fetch franchise name mapping
    const franchises = await Franchise.find({ franchiseId: { $in: franchiseIds } });

    // Create a map of franchiseId -> name
    const franchiseMap = {};
    franchises.forEach(fr => {
      franchiseMap[fr.franchiseId] = fr.franchiseName;
    });

    // Append franchiseName to each feedback
    const enrichedFeedbacks = feedbacks.map(fb => ({
      ...fb._doc,
      franchiseName: franchiseMap[fb.franchiseId] || "Unknown Franchise"
    }));

    res.status(200).json(enrichedFeedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ message: "Failed to fetch feedbacks", error: error.message });
  }
};
