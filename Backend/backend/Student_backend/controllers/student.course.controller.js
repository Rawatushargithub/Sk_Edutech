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

export const getCoursesByFranchise = async (req, res) => {
  try {
    const { franchiseId } = req.params; // ✅ comes from URL param

    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: "Franchise ID is required",
      });
    }

    // ✅ Fetch courses either for that franchise OR for the admin
    const courses = await Course.find({
      $or: [
        { franchiseId: franchiseId },   // courses for that franchise
        { franchiseId: "Admin" }        // global admin courses
      ]
    }).sort({ createdAt: -1 });

    // console.log("course :", courses);
    if (!courses.length) {
      return res.status(404).json({
        success: false,
        message: "No courses found for this franchise",
      });
    }


    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
    });
  }
};

export const getCourseSyllabus = async (req, res) => {
  try {
    const { courseCode } = req.body;

    console.log("course code :",courseCode);
    if (!courseCode) {
      return res.status(400).json({ success: false, message: "Course code is required" });
    }

    const course = await Course.findOne({ courseCode }).select("courseCode courseName courseSyllabus");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        courseCode: course.courseCode,
        courseName: course.courseName,
        syllabus: course.courseSyllabus,
      }
    });
    // console.log("data :", data)
  } catch (error) {
    console.error("Error fetching course syllabus:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};