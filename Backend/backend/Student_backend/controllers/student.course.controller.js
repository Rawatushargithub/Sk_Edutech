import Course from "../../Center_Backend/models/Courses/Courses.models.js"; // adjust path if needed

// Get course details by courseCode
export const getCourseByCode = async (req, res) => {
  try {
    const { courseCode } = req.params;
  
    // console.log(courseCode);
    if (!courseCode) {
      return res.status(400).json({ success: false, message: "Course code is required" });
    }

    // Find course and exclude notes & videos
    const course = await Course.findOne({ courseCode: courseCode })
      .select("-courseMaterials -courseVideoLinks");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
