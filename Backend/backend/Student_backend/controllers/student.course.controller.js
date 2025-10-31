import Course from "../../Center_Backend/models/Courses/Courses.models.js"; // adjust path if needed
import Student from "../../Student_backend/models/Student.js";
import Fee from "../models/Fees.js";
import mongoose from "mongoose";
// Get course details by courseCode
export const getCourseByCode = async (req, res) => {
   try {
    const { studentId } = req.params; // Get studentId from URL params
console.log("studentId :",studentId)
    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Student ID is required" 
      });
    }
    const objectId = new mongoose.Types.ObjectId(studentId);
    // Find the student
    const student = await Student.findById(objectId)
      .populate('feeDetails') // Populate the fee details
      .select('studentName email studentMobile courseInterested feeDetails');

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    // Get all fee records for this student
    const feeRecords = await Fee.find({ studentId: student._id });

    const coursedetails = await Course.findOne({ courseCode: student.courseInterested.courseCode })
    .select("courseImage courseName courseSubject courseCode courseDuration courseEligibility courseSyllabus");
    console.log("coursedetails :", coursedetails)


    // Prepare response data
    const responseData = {
      student: {
        name: student.studentName,
        email: student.email,
        mobile: student.studentMobile,
        course: student.courseInterested
      },
      feeDetails: feeRecords.map(fee => ({
        courseFees: fee.courseFees,
        discountType: fee.discountType,
        discountAmount: fee.discountAmount,
        totalFees: fee.totalFees,
        feesReceived: fee.feesReceived,
        balance: fee.balance,
        remarks: fee.remarks,
        createdAt: fee.createdAt
      })),
      coursedetails: coursedetails
    };

    return res.status(200).json({ 
      success: true, 
      data: responseData 
    });

  } catch (error) {
    console.error("Error fetching student course details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
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