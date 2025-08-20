import { asyncHandler } from "../utils/asynchanlder.js";
import Student from "../models/Student/Student_Details.model.js";
import { ApiResponse} from "../utils/ApiResponse.js";
const getStudentCount = asyncHandler( async (req, res) => {
  try {
    
    const count = await Student.countDocuments();   // { instituteId: req.user.instituteId } <= when add the instituteID to the students
    console.log("Student count:", count);
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching student count", error });
  }
})

const getRecentsStudents = asyncHandler( async (req , res) => {

  try {
    const limit = parseInt(req.query.limit) ;
    
    const students = await Student.find()
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .limit(limit)
      .select("studentName courseInterested rollNumber createdAt studentPhoto");
    
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }
    
    // Format the response data
    const formattedStudents = students.map(student => ({
      id: student._id,
      name: student.studentName,
      course: student.courseInterested,
      rollNumber: student.rollNumber,
      photoUrl: student.studentPhoto,
      addedOn: student.createdAt
    }));

    console.log(formattedStudents)
    res.status(200).json(formattedStudents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }

})
const getStudents = asyncHandler(async (req, res) => {
  console.log('getstudents is working')
  // Get pagination parameters from query string with defaults
  const page = parseInt(req.query.page, 10) ;
  const limit = parseInt(req.query.limit, 10) ;
  const skip = (page - 1) * limit;

  // Get filter parameters if any
  const { course, batch, searchTerm  } = req.query;

  // Build filter object
  let filter = {};

  if (course) {
    filter.courseInterested = course;
  }

  if (batch) {
    filter.batches = batch;
  }

  if (searchTerm) {
    // Search in student name, mobile, roll number, or email
    filter.$or = [
      { studentName: { $regex: searchTerm, $options: "i" } },
      { studentMobile: { $regex: searchTerm, $options: "i" } },
      { rollNumber: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Query database with projections for only the fields we need
  const students = await Student.find(filter)
    .select(
      "studentPhoto studentName status franchiseId courseInterested studentMobile referralCode email rollNumber admissionDate selectedBatch"
    )
    .populate({
      path: 'selectedBatch',
      select: 'batchName' // Only select the batchName field
    })
    .skip(skip)
    .limit(limit)
    .sort({ admissionDate: -1 }); // Sort by admission date, newest first

     // Format the results to include the batch name in a new field
  const formattedStudents = students.map(student => {
    // Convert to plain JavaScript object
    const studentObj = student.toObject();

    // Add a new batch field with the batch name
    if (studentObj.selectedBatch && studentObj.selectedBatch.batchName) {
      studentObj.batch = studentObj.selectedBatch.batchName;
    } else {
      studentObj.batch = "No Batch Assigned";
    }

    // Remove the original selectedBatch object to clean the response
    delete studentObj.selectedBatch;

    return studentObj;
  });
 

  // Check if students were found
    if (!formattedStudents || formattedStudents.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, [], "No students found for this franchise")
        );
    }

  console.log("formattedStudents :: ", formattedStudents)
  // Return the student data
  return res.status(200).json(
    new ApiResponse(
      200,
      formattedStudents,
      // pagination: {
      //     total: totalStudents,
      //     page,
      //     limit,
      //     pages: Math.ceil(totalStudents / limit)
      // }
      "Students fetched successfully"
    )
  );
});

export { getStudentCount, getRecentsStudents ,getStudents};