import { asyncHandler } from "../../utils/asynchanlder.js";
import Student from "../../models/Student/Student_Details.model.js"
import Fees_studentModel from "../../models/Student/Fees_student.model.js";
import installmentModel from "../../models/Student/installment.model.js";
import BatchModel from "../../models/batch.model.js"; // Import your Batch model
import mongoose from "mongoose"; // Make sure to import mongoose for the transaction
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
 
const registerStudent = asyncHandler(async (req, res) => {
  const {
    rollNumber,
    studentName,
    relationType,
    fatherHusbandName,
    surnameName,
    motherName,
    courseInterested,
    studentMobile,
    alternateMobile,
    email,
    dob,
    gender,
    city,
    postCode,
    permanentAddress, 
    referralCode,
    caste,
    qualifications,
    occupation,
    admissionDate,
    displayAdmissionOptions,

    // Fee details
    courseFees,
    discountType,
    discountAmount,
    totalFees,
    feesReceived,
    balance,
    remarks,
    // Batch selection
    selectedBatch,
    // Installment details
    installments = [],
  } = req.body;

//   for(const installment of installments){
//     console.log("installments array values :: " , installment)
// }
  // Validate required fields
  // if ([rollNumber, studentName, relationType, courseInterested, studentMobile, dob, gender, admissionDate].some(field => !field?.trim())) {
  //     throw new ApiError(400, "All required fields must be provided");
  // }

  // Validate batch selection
  if (!selectedBatch) {
    throw new ApiError(400, "Batch selection is required");
  }
  console.log(selectedBatch);
  // Find the batch by its timing or name
  const batch = await BatchModel.findOne({
    $or: [
      { batchTiming: selectedBatch },
      { batchName: selectedBatch },
      { id: selectedBatch }, // In case an ID is actually sent
    ],
  });

  if (!batch) {
    throw new ApiError(404, "Selected batch not found");
  }

  // Check remaining seats in the batch
  if (batch.remainingSeats <= 0) {
    throw new ApiError(400, "Selected batch has no available seats");
  }

  // Check for student photo & signature
  const studentPhotoLocalPath = req.files?.studentPhoto?.[0]?.path;
  const studentSignatureLocalPath = req.files?.studentSignature?.[0]?.path;

  if (!studentPhotoLocalPath || !studentSignatureLocalPath) {
    throw new ApiError(400, "Student Photo and Signature are required");
  }

  // Upload to Cloudinary
  const studentPhoto = await uploadOnCloudinary(studentPhotoLocalPath);
  const studentSignature = await uploadOnCloudinary(studentSignatureLocalPath);

  if (!studentPhoto || !studentSignature) {
    throw new ApiError(500, "Error uploading student images");
  }

  // Define session outside the try block so it's accessible in the catch block
  let session;

  try {
    // Use a database transaction to ensure all operations succeed or fail together
    session = await mongoose.startSession();
    session.startTransaction();

    // Create student record in DB
    const student = await Student.create(
      [
        {
          studentPhoto: studentPhoto.url,
          studentSignature: studentSignature.url,
          rollNumber,
          abbreviation: req.body.abbreviation || "",
          studentName,
          relationType,
          fatherHusbandName,
          surnameName,
          motherName,
          courseInterested,
          studentMobile,
          alternateMobile,
          email,
          dob,
          gender,
          city,
          postCode,
          permanentAddress,
          referralCode,
          caste,
          qualifications,
          occupation,
          admissionDate,
          selectedBatch: batch._id, // Store the reference to the batch object ID
          displayAdmissionOptions: displayAdmissionOptions || false,
        },
      ],
      { session }
    );
    console.log("student id", student[0]._id);
    const studentId = student[0]._id;
    console.log("variable studentId", studentId);
    // Create fee record
    const fee = await Fees_studentModel.create(
      [
        {
          studentId: studentId,
          courseFees: Number(courseFees) || 0,
          discountType: discountType || "amount-",
          discountAmount: Number(discountAmount) || 0,
          totalFees: Number(totalFees) || 0,
          feesReceived: Number(feesReceived) || 0,
          balance: Number(balance) || Number(totalFees) - Number(feesReceived),
          remarks: remarks || "",
        },
      ],
      { session }
    );

    // Create installment records if any
    const installmentRecords = [];
    for(const installment of installments){
        console.log("installments array values :: " , installment)
    }
    if (installments && installments.length > 0) {
      for (const installment of installments) {
        // Validate installment data before creating
        if (!installment.name) {
          throw new ApiError(400, "Installment name is required");
        }

        // Parse amount properly to avoid NaN
        const amount = parseFloat(installment.amount);
        if (isNaN(amount)) {
          throw new ApiError(
            400,
            `Invalid amount for installment: ${installment.name}`
          );
        }

        // Validate date
        if (!installment.date) {
          throw new ApiError(
            400,
            `Date is required for installment: ${installment.name}`
          );
        }

        const newInstallment = await installmentModel.create(
          [
            {
              studentId: studentId,
              installmentName: installment.name,
              amount: Number(installment.amount),
              date: installment.date,
              paid: false,
            },
          ],
          { session }
        );

        installmentRecords.push(newInstallment[0]._id);
      }
    }

    // Update student with fee and installment references
    await Student.findByIdAndUpdate(
      studentId,
      {
        feeDetails: fee[0]._id,
        installmentDetails: installmentRecords,
      },
      { session }
    );

    // Update the batch to decrease remaining seats
    await BatchModel.findByIdAndUpdate(
      batch._id,
      { $inc: { remainingSeats: -1 } }, // Decrease remaining seats by 1
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Fetch the complete student record with populated references
    const completeStudent = await Student.findById(studentId)
      .populate("feeDetails")
      .populate("installmentDetails")
      .populate("selectedBatch");

    if (!completeStudent) {
      throw new ApiError(
        500,
        "Something went wrong while registering the student"
      );
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, completeStudent, "Student registered successfully")
      );
  } catch (error) {
    // If anything fails, abort the transaction
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw new ApiError(
      500,
      error.message || "Something went wrong while registering the student"
    );
  }
});

const getStudents = asyncHandler(async (req, res) => {
  console.log("getStudents is working but the folder one is working")
  // Get pagination parameters from query string with defaults
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;



  // Query database with projections for only the fields we need
  const students = await Student.find()
    .select(
      "studentPhoto studentName courseInterested studentMobile referralCode email rollNumber admissionDate selectedBatch status franchiseId"
    )
    .populate({
      path: 'selectedBatch',
      select: 'batchName'
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
        new ApiResponse(200, [], "No students found with the given criteria")
      );
  }


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
      "Students fetched successfully from admin controller"
    )
  );
});

const getStudentCount = asyncHandler( async (req, res) => {
  try {
    const count = await Student.countDocuments();   // { instituteId: req.user.instituteId } <= when add the instituteID to the students
    
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching student count", error });
  }
})

const getRecentsStudents = asyncHandler( async (req , res) => {

  try {
    const limit = parseInt(req.query.limit) || 5;
    
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

const toggleStudentStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!["active", "inactive", "Certified"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active', 'inactive', or 'Certified'"
      });
    }
    
    const student = await Student.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Student status updated successfully",
      data: student
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating student status",
      error: error.message
    });
  }
});

const updateStudent = asyncHandler( async( req , res) => {
  console.log("update is working")
  try {
console.log("id value:: " , req.params.id);
    console.log(req.body)
    // Find and update the student
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
      }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    console.log("updated student in backend :: ", updatedStudent)
    
    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: error.message
    });
  }
})

export { 
  registerStudent, 
  getStudents,
  getStudentCount,
  getRecentsStudents,
  updateStudent,
  toggleStudentStatus
 };
