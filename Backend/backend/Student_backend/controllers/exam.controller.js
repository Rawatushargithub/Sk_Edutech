
import Exam from "../../Center_Backend/models/Exam.models.js";

export const getExamsByCourseCode = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const exams = await Exam.find({ courseCode: courseCode.trim().toUpperCase(),});

    if (!exams || exams.length === 0) {
      return res.status(404).json({ message: "No exams found for this course" });
    }
    
    res.status(200).json({
      message: "Exams fetched successfully",
      exams,
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
