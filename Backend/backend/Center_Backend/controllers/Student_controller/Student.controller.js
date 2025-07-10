import { asyncHandler } from "../../utils/asynchanlder.js";
import Student from "../../../Admin_Backend/models/Student/Student_Details.model.js"
import Fees_studentModel from "../../models/Student/Fees_student.model.js";
import installmentModel from "../../models/Student/installment.model.js";
import BatchModel from "../../models/batch.model.js"; // Import your Batch model
import mongoose from "mongoose"; // Make sure to import mongoose for the transaction
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import Wallet from "../../models/Payment/Wallet.js";
import Transaction from "../../models/Payment/Transaction.js";

// const registerStudent = asyncHandler(async (req, res) => {
//   const {
//     rollNumber,
//     studentName,
//     relationType,
//     fatherHusbandName,
//     surnameName,
//     franchiseId, // Added franchiseId to the request body
//     motherName,
//     studentMobile,
//     alternateMobile,
//     email,
//     dob,
//     gender,
//     city,
//     postCode,
//     permanentAddress,
//     referralCode,
//     caste,
//     qualifications,
//     occupation,
//     admissionDate,
//     displayAdmissionOptions,
//     courseInterested,

//     // Fee details
//     courseFees,
//     discountType,
//     discountAmount,
//     totalFees,
//     feesReceived,
//     balance,
//     remarks,
//     // Batch selection
//     selectedBatch,
//     // Installment details
//     installments,
//   } = req.body;

//   console.log("franchise", franchiseId);


//   let parsedCourseInterested;

//   try {
//     parsedCourseInterested = JSON.parse(courseInterested);
//   } catch (err) {
//     return res.status(400).json({ message: "Invalid courseInterested format" });
//   }

//   console.log("Parsed courseInterested:", parsedCourseInterested);

//   let parsedInstallments = [];

//   try {
//     if (typeof installments === "string") {
//       parsedInstallments = JSON.parse(installments);
//     } else if (Array.isArray(installments)) {
//       parsedInstallments = installments;
//     }
//   } catch (err) {
//     console.error("Failed to parse installments", err);
//   }



//   // Validate required fields
//   if ([rollNumber, studentName, relationType, studentMobile, dob, gender, admissionDate].some(field => !field?.trim())) {
//     throw new ApiError(400, "All required fields must be provided");
//   }


//   // Validate batch selection
//   if (!selectedBatch) {
//     throw new ApiError(400, "Batch selection is required");
//   }
//   console.log(selectedBatch);

//   // Find the batch by its timing or name
//   const batch = await BatchModel.findOne({
//     $or: [
//       { batchTiming: selectedBatch },
//       { batchName: selectedBatch },
//       // { _id: selectedBatch }, // Use _id instead of id for MongoDB ObjectId
//     ],
//   });
//   console.log("batch value :: ", batch);
//   if (!batch) {
//     throw new ApiError(404, "Selected batch not found");
//   }

//   // Check remaining seats in the batch
//   if (batch.remainingSeats <= 0) {
//     throw new ApiError(400, "Selected batch has no available seats");
//   }

//   // Check for student photo & signature
//   const studentPhotoLocalPath = req.files?.studentPhoto?.[0]?.path;
//   const studentSignatureLocalPath = req.files?.studentSignature?.[0]?.path;
//   console.log(req.files)
//   if (!studentPhotoLocalPath || !studentSignatureLocalPath) {
//     throw new ApiError(400, "Student Photo and Signature are required");
//   }

//   // Upload to Cloudinary
//   const studentPhoto = await uploadOnCloudinary(studentPhotoLocalPath);
//   const studentSignature = await uploadOnCloudinary(studentSignatureLocalPath);

//   if (!studentPhoto || !studentSignature) {
//     throw new ApiError(500, "Error uploading student images");
//   }

//   // Define session outside the try block so it's accessible in the catch block
//   let session;

//   try {
//     // Use a database transaction to ensure all operations succeed or fail together
//     session = await mongoose.startSession();
//     session.startTransaction();

//     // Create student record in DB
//     const student = await Student.create(
//       [
//         {
//           studentPhoto: studentPhoto.url,
//           studentSignature: studentSignature.url,
//           rollNumber,
//           abbreviation: req.body.abbreviation || "",
//           studentName,
//           franchiseId,
//           relationType,
//           fatherHusbandName,
//           surnameName,
//           motherName,
//           courseInterested: parsedCourseInterested, // Now properly structured as an object
//           studentMobile,
//           alternateMobile,
//           email,
//           dob,
//           gender,
//           city,
//           postCode,
//           permanentAddress,
//           referralCode,
//           caste,
//           qualifications,
//           occupation,
//           admissionDate,
//           selectedBatch: batch._id, // Store the reference to the batch object ID
//           displayAdmissionOptions: displayAdmissionOptions || false,
//         },
//       ],
//       { session }
//     );

//     console.log("student id", student[0]._id);
//     const studentId = student[0]._id;
//     console.log("variable studentId", studentId);

//     // Create fee record
//     const fee = await Fees_studentModel.create(
//       [
//         {
//           studentId: studentId,
//           courseFees: Number(courseFees) || 0,
//           discountType: discountType || "amount-",
//           discountAmount: Number(discountAmount) || 0,
//           totalFees: Number(totalFees) || 0,
//           feesReceived: Number(feesReceived) || 0,
//           balance: Number(balance) || Number(totalFees) - Number(feesReceived),
//           remarks: remarks || "",
//         },
//       ],
//       { session }
//     );

//     // Create installment records if any
//     const installmentRecords = [];
//     for (const installment of parsedInstallments) {
//       console.log("installments array values :: ", installment)
//     }

//     if (parsedInstallments && parsedInstallments.length > 0) {
//       for (const installment of installments) {
//         // Validate installment data before creating
//         if (!installment.name) {
//           throw new ApiError(400, "Installment name is required");
//         }

//         // Parse amount properly to avoid NaN
//         const amount = parseFloat(installment.amount);
//         if (isNaN(amount)) {
//           throw new ApiError(
//             400,
//             `Invalid amount for installment: ${installment.name}`
//           );
//         }

//         // Validate date
//         if (!installment.date) {
//           throw new ApiError(
//             400,
//             `Date is required for installment: ${installment.name}`
//           );
//         }

//         const newInstallment = await installmentModel.create(
//           [
//             {
//               studentId: studentId,
//               installmentName: installment.name,
//               amount: Number(installment.amount),
//               date: installment.date,
//               paid: false,
//             },
//           ],
//           { session }
//         );

//         installmentRecords.push(newInstallment[0]._id);
//       }
//     }

//     // Update student with fee and installment references
//     await Student.findByIdAndUpdate(
//       studentId,
//       {
//         feeDetails: fee[0]._id,
//         installmentDetails: installmentRecords,
//       },
//       { session }
//     );

//     // Update the batch to decrease remaining seats
//     await BatchModel.findByIdAndUpdate(
//       batch._id,
//       { $inc: { remainingSeats: -1 } }, // Decrease remaining seats by 1
//       { session }
//     );

//     // Commit the transaction
//     await session.commitTransaction();
//     session.endSession();

//     // Fetch the complete student record with populated references
//     const completeStudent = await Student.findById(studentId)
//       .populate("feeDetails")
//       .populate("installmentDetails")
//       .populate("selectedBatch");

//     if (!completeStudent) {
//       throw new ApiError(
//         500,
//         "Something went wrong while registering the student"
//       );
//     }

//     // Add wallet deduction logic before registration
//     // const instituteId = req.user._id; // assuming authentication middleware sets req.user
//     const registrationFee = 300; // or get from config

//     let wallet = await Wallet.findOne();
//     if (!wallet || wallet.balance < registrationFee) {
//       throw new ApiError(400, "Insufficient wallet balance. Please add money.");
//     }
//     wallet.balance -= registrationFee;
//     await wallet.save();

//     // Record the deduction as a transaction
//     await Transaction.create({
//       // wallet: wallet._id,
//       amount: registrationFee,
//       type: "debit",
//       status: "approved",
//       referenceId: "Student Registration",
//       timestamp: new Date(),
//     });

//     return res
//       .status(201)
//       .json(
//         new ApiResponse(201, completeStudent, "Student registered successfully")
//       );
//   } catch (error) {
//     // If anything fails, abort the transaction
//     if (session) {
//       await session.abortTransaction();
//       session.endSession();
//     }
//     throw new ApiError(
//       500,
//       error.message || "Something went wrong while registering the student"
//     );
//   }
//   // return res.status(200)

// });

const registerStudent = asyncHandler(async (req, res) => {
  const {
    rollNumber,
    studentName,
    relationType,
    fatherHusbandName,
    surnameName,
    franchiseId,
    motherName,
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
    courseInterested,
    courseFees,
    discountType,
    discountAmount,
    totalFees,
    feesReceived,
    balance,
    remarks,
    selectedBatch,
    installments,
  } = req.body;

  let parsedCourseInterested, parsedInstallments = [];

  try {
    parsedCourseInterested = JSON.parse(courseInterested);
  } catch {
    return res.status(400).json({ message: "Invalid courseInterested format" });
  }

  if (typeof installments === "string") {
    try {
      parsedInstallments = JSON.parse(installments);
    } catch {
      return res.status(400).json({ message: "Invalid installments format" });
    }
  } else if (Array.isArray(installments)) {
    parsedInstallments = installments;
  }

  // Validate required fields
  if ([rollNumber, studentName, relationType, studentMobile, dob, gender, admissionDate].some(field => !field?.trim())) {
    throw new ApiError(400, "All required fields must be provided");
  }

  if (!selectedBatch) {
    throw new ApiError(400, "Batch selection is required");
  }

  const batch = await BatchModel.findOne({
    $or: [{ batchTiming: selectedBatch }, { batchName: selectedBatch }],
  });

  if (!batch) throw new ApiError(404, "Selected batch not found");
  if (batch.remainingSeats <= 0) throw new ApiError(400, "Batch is full");

  const studentPhotoLocalPath = req.files?.studentPhoto?.[0]?.path;
  const studentSignatureLocalPath = req.files?.studentSignature?.[0]?.path;

  if (!studentPhotoLocalPath || !studentSignatureLocalPath) {
    throw new ApiError(400, "Student Photo and Signature are required");
  }

  const studentPhoto = await uploadOnCloudinary(studentPhotoLocalPath);
  const studentSignature = await uploadOnCloudinary(studentSignatureLocalPath);

  if (!studentPhoto || !studentSignature) {
    throw new ApiError(500, "Error uploading student images");
  }

  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const student = await Student.create(
      [{
        studentPhoto: studentPhoto.url,
        studentSignature: studentSignature.url,
        rollNumber,
        abbreviation: req.body.abbreviation || "",
        studentName,
        franchiseId,
        relationType,
        fatherHusbandName,
        surnameName,
        motherName,
        courseInterested: parsedCourseInterested,
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
        selectedBatch: batch._id,
        displayAdmissionOptions: displayAdmissionOptions || false,
      }],
      { session }
    );

    const studentId = student[0]._id;

    const fee = await Fees_studentModel.create(
      [{
        studentId,
        courseFees: Number(courseFees) || 0,
        discountType: discountType || "amount-",
        discountAmount: Number(discountAmount) || 0,
        totalFees: Number(totalFees) || 0,
        feesReceived: Number(feesReceived) || 0,
        balance: Number(balance) || Number(totalFees) - Number(feesReceived),
        remarks: remarks || "",
      }],
      { session }
    );

    const installmentRecords = [];

    if (parsedInstallments.length > 0) {
      for (const installment of parsedInstallments) {
        if (!installment.name) throw new ApiError(400, "Installment name is required");
        const amount = parseFloat(installment.amount);
        if (isNaN(amount)) throw new ApiError(400, `Invalid amount for installment: ${installment.name}`);
        if (!installment.date) throw new ApiError(400, `Date is required for installment: ${installment.name}`);

        const newInstallment = await installmentModel.create(
          [{
            studentId,
            installmentName: installment.name,
            amount,
            date: installment.date,
            paid: false,
          }],
          { session }
        );

        installmentRecords.push(newInstallment[0]._id);
      }
    }

    await Student.findByIdAndUpdate(
      studentId,
      {
        feeDetails: fee[0]._id,
        installmentDetails: installmentRecords,
      },
      { session }
    );

    await BatchModel.findByIdAndUpdate(
      batch._id,
      { $inc: { remainingSeats: -1 } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // --- 🔻 Non-transactional logic starts here 🔻 ---

    const registrationFee = 300;
    let wallet = await Wallet.findOne();

    if (!wallet || wallet.balance < registrationFee) {
      throw new ApiError(400, "Insufficient wallet balance. Please add money.");
    }

    wallet.balance -= registrationFee;
    await wallet.save();

    await Transaction.create({
      amount: registrationFee,
      type: "debit",
      status: "approved",
      referenceId: "Student Registration",
      timestamp: new Date(),
    });

    const completeStudent = await Student.findById(studentId)
      .populate("feeDetails")
      .populate("installmentDetails")
      .populate("selectedBatch");

    if (!completeStudent) {
      throw new ApiError(500, "Something went wrong while fetching student details");
    }

    return res.status(201).json(
      new ApiResponse(201, completeStudent, "Student registered successfully")
    );
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    if (session) session.endSession();

    console.error("Registration error:", error);
    throw new ApiError(500, error.message || "Registration failed");
  }
});

const getStudents = asyncHandler(async (req, res) => {
  // Get pagination parameters from query string with defaults
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Get filter parameters if any
  const { course, batch, searchTerm } = req.query;

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
      "studentPhoto studentName courseInterested studentMobile referralCode email rollNumber admissionDate selectedBatch"
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

  // Get total count for pagination
  const totalStudents = await Student.countDocuments(filter);

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
      "Students fetched successfully"
    )
  );
});

const getStudentCount = asyncHandler(async (req, res) => {
  try {
    const count = await Student.countDocuments();   // { instituteId: req.user.instituteId } <= when add the instituteID to the students

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching student count", error });
  }
})

const getRecentsStudents = asyncHandler(async (req, res) => {

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

const updateStudent = asyncHandler(async (req, res) => {
  console.log("update is working")
  try {
    console.log("id value:: ", req.params.id);
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
  updateStudent
};
