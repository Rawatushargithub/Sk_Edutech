import asyncHandler from "express-async-handler";
import Student from "../models/Student.js";
import Course from "../../Center_Backend/models/Courses/Courses.models.js"


export const getAllStudents = async (req, res) => {
  try {
      // Fetch all students from MongoDB
      const students = await Student.find({}, '-__v -createdAt -updatedAt -displayAdmissionOptions');

      if (!students.length) {
          return res.status(404).json({ message: "No students found" });
      }

      // Send response with a flat list (no nested "data" array)
      res.status(200).json(students);
  } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};



// ✅ Request Certificate
export const requestCertificate = async (req, res) => {
    try {
      const { id } = req.params;
      const student = await Student.findById(id);
  
      if (!student) return res.status(404).json({ error: "Student not found" });
  
      // Check if already requested
      if (student.certificateRequested) {
        return res.status(400).json({ error: "Certificate already requested" });
      }
  
      // Update student request
      student.certificateRequested = true;
      student.requestStatus = "pending"; // Default status
  
      await student.save();
      res.status(200).json({ message: "Certificate request submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to request certificate." });
    }
  };
  
// ✅ Student Login Controller
export const loginStudent = async (req, res) => {
  try {
      const { email, studentMobile } = req.body;

      // Check if the student exists
      const student = await Student.findOne({ email, studentMobile });

      if (!student) {
          return res.status(401).json({ message: "Invalid email or mobile number" });
      }

      res.status(200).json({
          message: "Login successful",
          student,  // ✅ Send full student object
      });
  } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};


// Fetch full student details by ID
export const getStudentById = async (req, res) => {
  try {
      const student = await Student.findById(req.params.id);

      if (!student) {
          return res.status(404).json({ message: "Student not found" });
      }

      res.status(200).json({ student });
  } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCourseDuration = async (req, res) => {
  const { courseCode } = req.body;
  // console.log("Received courseCode:", courseCode);
  if (!courseCode) {
    return res.status(400).json({ message: 'courseCode is required' });
  }

  try {
    const course = await Course.findOne({ courseCode: courseCode });
    // console.error("Course not found for courseCode:", course);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({ duration: course.courseDuration });
  } catch (error) {
    console.error("Error fetching course duration:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


