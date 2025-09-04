import Exam from "../../Center_Backend/models/Exam.models.js";

// Fetch student rating based on performance
export const getStudentRating = async (req, res) => {
  try {
    const { courseCode, franchiseId, rollNumber } = req.query;

    if (!courseCode || !franchiseId || !rollNumber) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Fetch exams of same franchise, course, and type (weekly/monthly)
    const exams = await Exam.find({
      courseCode,
      franchiseId,
      examType: { $in: ["Weekly Test", "Monthly Test"] },
      status: { $in: ["Active", "Inactive"] },
    });

    if (!exams.length) {
      return res.status(404).json({ message: "No exams found" });
    }

    let totalMarks = 0;
    let obtainedMarks = 0;

    exams.forEach((exam) => {
      totalMarks += exam.totalMarks;

      // Find student's result inside this exam
      const studentResult = exam.results.find(
        (r) => r.rollNumber === rollNumber
      );

      if (studentResult) {
        obtainedMarks += studentResult.marksObtained;
      }
    });

    if (totalMarks === 0) {
      return res.status(200).json({ rating: 0, totalMarks: 0, obtainedMarks: 0 });
    }

    // Calculate star rating (0–5)
    const percentage = obtainedMarks / totalMarks;
    const rating = Math.round(percentage * 5); // Round to nearest star

    return res.status(200).json({
      rating,
      totalMarks,
      obtainedMarks,
      examsCount: exams.length,
    });
  } catch (error) {
    console.error("Error fetching rating:", error);
    res.status(500).json({ message: "Server error" });
  }
};
