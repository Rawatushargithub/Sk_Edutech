import Course from "../../Center_Backend/models/Courses/Courses.models.js";

// ✅ Fetch videos by course
export const getVideosByCourse = async (req, res) => {
  try {
    const { course } = req.params;

    if (!course || typeof course !== 'string') {
      return res.status(400).json({ message: "Missing or invalid courseCode in request params" });
    }

    const normalizedCode = course.trim().toUpperCase();

    const courses = await Course.findOne({ courseCode: normalizedCode });

    if (!courses) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      message: "Course materials fetched successfully",
      courses
    });
  } catch (error) {
    console.error("Error fetching course materials:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
