import Course from "../../Center_Backend/models/Courses/Courses.models.js";
import Exam from "../../Center_Backend/models/Exam.models.js";
import Student from "../../Center_Backend/models/Student/Student_Detais.model.js"
import Batch from "../../Center_Backend/models/batch.model.js"

// Get notes and videos for a course
export const getCourseResources = async (req, res) => {
  try {
    const { courseCode } = req.params;

    // Find the latest course (if multiple exist with same code)
    const course = await Course.findOne({ courseCode })
      .sort({ createdAt: -1 }) // ✅ latest first
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Sort & get latest 5 notes
    const notes = (course.courseMaterials || [])
      .slice(-5) // ✅ last 5 directly, since you don’t have createdAt inside subdocs
      .reverse(); // so newest ones come first

    // Sort & get latest 5 videos
    const videos = (course.courseVideoLinks || [])
      .slice(-5)
      .reverse();

    res.json({
      notes,
      videos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get latest exam for course and batch


export const getLatestExam = async (req, res) => {
  try {
    const { rollNumber, franchiseId } = req.params;

    console.log("roll number :", rollNumber);
    console.log("franchise number :", franchiseId);

    // 1. Find the student
    const student = await Student.findOne({ rollNumber }).populate("selectedBatch");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("batch :", student);
    // 2. Get the student's batch
    const batch = await Batch.findById(student.selectedBatch);
    console.log("batch timing :", batch);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found for this student" });
    }

    const batchTiming = batch.batchTiming;

    // 3. Find exams with same franchise & batch timing
    const exams = await Exam.find({ 
        franchiseId: franchiseId, 
        batchTiming: batchTiming 
      })
      .sort({ createdAt: -1 }); // LIFO: latest exams first

    if (!exams || exams.length === 0) {
      return res.status(404).json({ message: "No exams found for this batch" });
    }

    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

