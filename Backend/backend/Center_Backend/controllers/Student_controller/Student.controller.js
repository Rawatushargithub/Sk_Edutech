import { asyncHandler } from "../../utils/asynchanlder.js";
import Student from "../../../Center_Backend/models/Student/Student_Detais.model.js"
import Franchise from "../../models/Franchise.model.js";
import Fees_studentModel from "../../models/Student/Fees_student.model.js";
import installmentModel from "../../models/Student/installment.model.js";
import BatchModel from "../../models/batch.model.js"; // Import your Batch model
import mongoose from "mongoose"; // Make sure to import mongoose for the transaction
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import Wallet from "../../models/Payment/Wallet.js";
import Transaction from "../../models/Payment/Transaction.js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import axios from "axios";
// Add these validation functions at the top of your controller file
const validateRequiredFields = (fields) => {
  const missingFields = [];
  
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      missingFields.push(key);
    }
  }
  
  return missingFields;
};

const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMobile = (mobile) => {
  if (!mobile) return false;
  const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile number format
  return mobileRegex.test(mobile);
};

// Updated registerStudent function with better error handling
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

  try {
    // Validate required fields
    const requiredFields = {
      rollNumber,
      studentName,
      relationType,
      studentMobile,
      dob,
      gender,
      admissionDate
    };

    const missingFields = validateRequiredFields(requiredFields);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_REQUIRED_FIELDS',
        missingFields
      });
    }

    // Validate mobile number
    if (!validateMobile(studentMobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number format. Please enter a valid 10-digit Indian mobile number.",
        code: 'INVALID_MOBILE_FORMAT'
      });
    }

    // Validate email if provided
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        code: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Check for duplicate roll number
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Student with this roll number already exists",
        code: 'DUPLICATE_ROLL_NUMBER'
      });
    }

    // Check for duplicate email if provided
    if (email) {
      const existingEmail = await Student.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Student with this email already exists",
          code: 'DUPLICATE_EMAIL'
        });
      }
    }

    // Parse and validate courseInterested
    let parsedCourseInterested;
    try {
      parsedCourseInterested = JSON.parse(courseInterested);
      if (!parsedCourseInterested.courseName || !parsedCourseInterested.courseCode) {
        return res.status(400).json({
          success: false,
          message: "Course selection is required",
          code: 'INVALID_COURSE_SELECTION'
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid course selection format",
        code: 'INVALID_COURSE_FORMAT'
      });
    }

    // Parse and validate installments
    let parsedInstallments = [];
    try {
      if (installments) {
        if (typeof installments === "string") {
          parsedInstallments = JSON.parse(installments);
        } else if (Array.isArray(installments)) {
          parsedInstallments = installments;
        }
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid installments format",
        code: 'INVALID_INSTALLMENTS_FORMAT'
      });
    }

    // Validate batch selection
    if (!selectedBatch) {
      return res.status(400).json({
        success: false,
        message: "Batch selection is required",
        code: 'BATCH_REQUIRED'
      });
    }

    // Find and validate batch
    const batch = await BatchModel.findOne({
      $or: [
        { batchTiming: selectedBatch },
        { batchName: selectedBatch },
      ],
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Selected batch not found",
        code: 'BATCH_NOT_FOUND'
      });
    }

    if (batch.remainingSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: "Selected batch has no available seats",
        code: 'BATCH_FULL'
      });
    }

    // Validate file uploads
    const studentPhotoLocalPath = req.files?.studentPhoto?.[0]?.path;
    const studentSignatureLocalPath = req.files?.studentSignature?.[0]?.path;

    if (!studentPhotoLocalPath) {
      return res.status(400).json({
        success: false,
        message: "Student photo is required",
        code: 'PHOTO_REQUIRED'
      });
    }

    if (!studentSignatureLocalPath) {
      return res.status(400).json({
        success: false,
        message: "Student signature is required",
        code: 'SIGNATURE_REQUIRED'
      });
    }

    // Validate fee amounts
    const numericFees = {
      courseFees: Number(courseFees),
      discountAmount: Number(discountAmount) || 0,
      totalFees: Number(totalFees),
      feesReceived: Number(feesReceived) || 0
    };

    if (isNaN(numericFees.courseFees) || numericFees.courseFees < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course fees amount",
        code: 'INVALID_COURSE_FEES'
      });
    }

    if (isNaN(numericFees.totalFees) || numericFees.totalFees < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid total fees amount",
        code: 'INVALID_TOTAL_FEES'
      });
    }

    if (numericFees.feesReceived > numericFees.totalFees) {
      return res.status(400).json({
        success: false,
        message: "Fees received cannot be greater than total fees",
        code: 'INVALID_FEES_RECEIVED'
      });
    }

    // Validate installments if provided
    if (parsedInstallments.length > 0) {
      for (let i = 0; i < parsedInstallments.length; i++) {
        const installment = parsedInstallments[i];
        
        if (!installment.name || !installment.name.trim()) {
          return res.status(400).json({
            success: false,
            message: `Installment name is required for installment ${i + 1}`,
            code: 'INSTALLMENT_NAME_REQUIRED'
          });
        }

        const amount = parseFloat(installment.amount);
        if (isNaN(amount) || amount <= 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid amount for installment: ${installment.name}`,
            code: 'INVALID_INSTALLMENT_AMOUNT'
          });
        }

        if (!installment.date) {
          return res.status(400).json({
            success: false,
            message: `Date is required for installment: ${installment.name}`,
            code: 'INSTALLMENT_DATE_REQUIRED'
          });
        }
      }
    }

    // Upload files to Cloudinary
    let studentPhoto, studentSignature;
    
    try {
      studentPhoto = await uploadOnCloudinary(studentPhotoLocalPath);
      if (!studentPhoto) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload student photo",
          code: 'PHOTO_UPLOAD_FAILED'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error uploading student photo",
        code: 'PHOTO_UPLOAD_ERROR'
      });
    }

    try {
      studentSignature = await uploadOnCloudinary(studentSignatureLocalPath);
      if (!studentSignature) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload student signature",
          code: 'SIGNATURE_UPLOAD_FAILED'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error uploading student signature",
        code: 'SIGNATURE_UPLOAD_ERROR'
      });
    }

    // Check wallet balance
    const registrationFee = 300;
    let wallet = await Wallet.findOne();
    if (!wallet || wallet.balance < registrationFee) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance. Please add money to continue.",
        code: 'INSUFFICIENT_BALANCE',
        requiredAmount: registrationFee,
        currentBalance: wallet ? wallet.balance : 0
      });
    }

    // Database transaction
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      console.log(franchiseId)
      // Create student record
      const student = await Student.create([{
        studentPhoto: studentPhoto.url,
        studentSignature: studentSignature.url,
        rollNumber,
        abbreviation: req.body.abbreviation || "Mr.",
        studentName,
        franchiseId,
        relationType,
        fatherHusbandName,
        includeFatherHusband: req.body.includeFatherHusband !== undefined ? req.body.includeFatherHusband : true,
        surnameName,
        includeSurname: req.body.includeSurname !== undefined ? req.body.includeSurname : true,
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
      }], { session });

      const studentId = student[0]._id;

      // Create fee record
      const fee = await Fees_studentModel.create([{
        studentId: studentId,
        courseFees: numericFees.courseFees,
        discountType: discountType || "amount-",
        discountAmount: numericFees.discountAmount,
        totalFees: numericFees.totalFees,
        feesReceived: numericFees.feesReceived,
        balance: numericFees.totalFees - numericFees.feesReceived,
        remarks: remarks || "",
      }], { session });

      // Create installment records
      const installmentRecords = [];
      if (parsedInstallments.length > 0) {
        for (const installment of parsedInstallments) {
          const newInstallment = await installmentModel.create([{
            studentId: studentId,
            installmentName: installment.name,
            amount: Number(installment.amount),
            date: installment.date,
            paid: false,
          }], { session });
          installmentRecords.push(newInstallment[0]._id);
        }
      }

      // Update student with references
      await Student.findByIdAndUpdate(studentId, {
        feeDetails: fee[0]._id,
        installmentDetails: installmentRecords,
      }, { session });

      // Update batch
      await BatchModel.findByIdAndUpdate(batch._id, {
        $inc: { currentStudents: 1 }
      }, { session });

      // Update wallet
      wallet.balance -= registrationFee;
      await wallet.save({ session });

      // Create transaction record
      await Transaction.create([{
        amount: registrationFee,
        type: "withdrawal",
        status: "approved",
        referenceId: "Student Registration",
        timestamp: new Date(),
      }], { session });

      await session.commitTransaction();
      session.endSession();

      // Fetch complete student record
      const completeStudent = await Student.findById(studentId)
        .populate("feeDetails")
        .populate("installmentDetails")
        .populate("selectedBatch");

      return res.status(201).json({
        success: true,
        message: "Student registered successfully",
        data: completeStudent
      });

    } catch (transactionError) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      
      console.error("Transaction error:", transactionError);
      
      if (transactionError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Duplicate entry detected",
          code: 'DUPLICATE_ENTRY'
        });
      }

      return res.status(500).json({
        success: false,
        message: "Database transaction failed",
        code: 'TRANSACTION_FAILED'
      });
    }

  } catch (error) {
    console.error("Registration error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Student registration failed",
      code: 'REGISTRATION_FAILED',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const getStudents = asyncHandler(async (req, res) => {
  // Get pagination parameters from query string with defaults
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Get filter parameters if any
  const { course, batch, searchTerm ,franchiseId } = req.query;

  // Build filter object
  let filter = {};
console.log("franchiseId value :: ", franchiseId)
// Add franchiseID filter - this is the key change
  if (franchiseId) {
    filter.franchiseId = franchiseId;
  } else {
    // If no franchiseID is provided, return an error or empty result
    return res.status(400).json(
      new ApiResponse(400, [], "FranchiseID is required")
    );
  }
console.log("filter value :: ", filter)
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
      "studentPhoto studentName franchiseId status courseInterested studentMobile referralCode email rollNumber admissionDate selectedBatch status"
    )
    .populate({
      path: 'selectedBatch',
      select: 'batchName' // Only select the batchName field
    })
    .skip(skip)
    .limit(limit)
    .sort({ admissionDate: -1 }); // Sort by admission date, newest first
console.log("students value :: ", students)
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
          new ApiResponse(200, [], "No students found for this franchise")
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
    const { franchiseId } = req.query;
    
    if (!franchiseId) {
      return res.status(400).json({ message: "Franchise ID is required" });
    }
    const count = await Student.countDocuments({franchiseId});   // { instituteId: req.user.instituteId } <= when add the instituteID to the students

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching student count", error });
  }
})

const getRecentsStudents = asyncHandler(async (req, res) => {

  try {
    const limit = parseInt(req.query.limit) || 5;
    const { franchiseId } = req.query;
    console.log("franchiseId value :: ", franchiseId)
    if (!franchiseId) {
      return res.status(400).json({ message: "Franchise ID is required" });
    }

    const students = await Student.find({franchiseId: franchiseId})
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .limit(limit)
      .select("studentName courseInterested rollNumber createdAt studentPhoto");
    console.log("students value :: ", students)
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

const toggleStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
console.log("toggleStudentStatus called with id:", id, "status:", status);  
    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format"
      });
    }
console.log("Type of status:", typeof status, "Value:", status);

    // Validate status
    if (typeof status !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Status must be a boolean value"
      });
    }

    // Find and update student
    const student = await Student.findByIdAndUpdate(
  {_id: id} ,
  { status },
  { new: true, runValidators: true }
);

    console.log("Found student:", student);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    console.log(student.toObject()); // Safely prints the raw document
    console.log("Updated student:", student.status , "roll number: ", student.rollNumber);
    const studentcheck = await Student.findById(id) 
console.log("Updated student status:", studentcheck);
    res.status(200).json({
      success: true,
      message: `Student status updated to ${status ? 'Active' : 'Inactive'} successfully`,
      data: {
        id: student._id,
        studentName: student.studentName,
        status: student.status,
        updatedAt: student.updatedAt
      }
    });

  } catch (error) {
    console.error("Error toggling student status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

const generateAdmissionForm = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new ApiError(400, "Invalid student ID");
  }

  const student = await Student.findById(studentId)
    .populate("feeDetails")
    .populate("selectedBatch");

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const franchise = await Franchise.findOne({ franchiseId: student.franchiseId });
  if (!franchise) {
    throw new ApiError(404, "Franchise not found");
  }

  const pdfPath = "F:\\SK_for_course\\Sk_Edutech\\Frontend\\public\\assets\\blank_form.pdf";
  const existingPdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page = pdfDoc.getPages()[0];

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const size = 10;
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text, x, y, color = rgb(0, 0, 0), textFont = font, textSize = size) => {
    if (text) {
      // Replace unsupported characters before drawing
      const sanitizedText = String(text).replace(/₹/g, 'Rs.').replace(/✓/g, 'Y');
      page.drawText(sanitizedText, { x, y, font: textFont, size: textSize, color });
    }
  };

  // Fetch and embed student photo (top right photo box)
  if (student.studentPhoto) {
    try {
      const photoUrl = student.studentPhoto;
      const photoResponse = await axios.get(photoUrl, { responseType: 'arraybuffer' });
      const photoBytes = Buffer.from(photoResponse.data, 'binary');
      let photoImage;
      if (photoUrl.includes('.jpg') || photoUrl.includes('.jpeg')) {
        photoImage = await pdfDoc.embedJpg(photoBytes);
      } else {
        photoImage = await pdfDoc.embedPng(photoBytes);
      }
      // Photo position in top right corner
      page.drawImage(photoImage, { x: 460, y: 643, width: 90, height: 110 });
    } catch (error) {
      console.error("Error fetching or embedding student photo:", error);
    }
  }

  // Fetch and embed student signature (bottom right signature box)
  if (student.studentSignature) {
    try {
      const signatureUrl = student.studentSignature;
      const signatureResponse = await axios.get(signatureUrl, { responseType: 'arraybuffer' });
      const signatureBytes = Buffer.from(signatureResponse.data, 'binary');
      let signatureImage;
      if (signatureUrl.includes('.jpg') || signatureUrl.includes('.jpeg')) {
        signatureImage = await pdfDoc.embedJpg(signatureBytes);
      } else {
        signatureImage = await pdfDoc.embedPng(signatureBytes);
      }
      // Signature position in bottom right
      page.drawImage(signatureImage, { x: 400, y: 230, width: 120, height: 40 });
    } catch (error) {
      console.error("Error fetching or embedding student signature:", error);
    }
  }

  // Fetch and embed franchise signature (bottom signature box)
  if (franchise.instituteSignature) {
    try {
      const franchiseSignatureUrl = franchise.instituteSignature;
      const signatureResponse = await axios.get(franchiseSignatureUrl, { responseType: 'arraybuffer' });
      const signatureBytes = Buffer.from(signatureResponse.data, 'binary');
      let franchiseSignatureImage;
      if (franchiseSignatureUrl.includes('.jpg') || franchiseSignatureUrl.includes('.jpeg')) {
        franchiseSignatureImage = await pdfDoc.embedJpg(signatureBytes);
      } else {
        franchiseSignatureImage = await pdfDoc.embedPng(signatureBytes);
      }
      // Signature position in bottom right
      page.drawImage(franchiseSignatureImage, { x: 413, y: 100, width: 120, height: 40 });
    } catch (error) {
      console.error("Error fetching or embedding student signature:", error);
    }
  }

  // TOP SECTION - Header Information
  // Admission Date (top left, after "ADMISSION DATE :")
  drawText(student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-GB') : '', 22, 680);

  // Roll Number (top right, after "ROLL NUMBER :")
  drawText(student.rollNumber, 45, 597);

  // Course of Interest (below admission date, after "COURSE OF INTEREST:")
  drawText(student.courseInterested?.courseName || '', 23, 554);

  // MAIN STUDENT DETAILS SECTION
  // First row - Student Name, Father/Husband Name, Surname
  drawText(student.studentName, 23, 512);  // After "STUDENT NAME"
  drawText(student.fatherHusbandName, 177, 52);  // After "FATHER/HUSBAND NAME"
  drawText(student.surnameName, 336, 512);  // After "SURNAME"

  // Second row - Mother Name
  drawText(student.motherName, 465, 511);  // After "MOTHER NAME"

  // Third row - Mobile numbers
  drawText(student.studentMobile, 200, 472);  // After "STUDENT MOBILE:"
  drawText(student.alternateMobile, 389, 472);  // After "ALTERNATE MOBILE:"

  // Fourth row - DOB, Gender, Email
  drawText(student.dob ? new Date(student.dob).toLocaleDateString('en-GB') : '', 120, 505);  // After "DATE OF BIRTH.:"
  drawText(student.gender, 379, 431);  // After "GENDER:"
  drawText(student.email, 135, 432);  // After "E-MAIL:"

  // Fifth row - Caste, Qualification, Occupation, State, Post Code
  drawText(student.caste, 19, 395);  // After "CASTE:"
  drawText(student.qualifications, 114, 392);  // After "QUALIFICATION.:"
  drawText(student.occupation, 273, 394);  // After "OCCUPATION.:"
  drawText(student.state || 'Haryana', 388, 394);  // After "STATE:"
  drawText(student.postCode, 485, 394);  // After "POST CODE:"

  // ADDRESS SECTION
  // Permanent Address (multiline field after "ADDRESS:-")
  const addressLines = student.permanentAddress ? student.permanentAddress.split('\n') : [];
  addressLines.forEach((line, index) => {
    if (index < 2) { // Limit to 2 lines for current address
      drawText(line, 22, 344 - (index * 15));
    }
  });

  // Permanent Address (after "PERMANENT ADDRESS.:")
  const permAddressLines = student.permanentAddress ? student.permanentAddress.split('\n') : [];
  permAddressLines.forEach((line, index) => {
    if (index < 2) { // Limit to 2 lines for permanent address
      drawText(line, 22, 344 - (index * 15));
    }
  });

  // LEFT SIDE - OFFICE USE ONLY SECTION
  // Aadhaar Card Number (after "ADHAR CARD NUMBER.:")
  drawText(student.aadhaarNumber || '', 70, 415);

  // Batch Name (after "BATCH NAME")
  if (student.selectedBatch) {
    drawText(student.selectedBatch.batchName || student.selectedBatch.batchTiming, 21, 202);
  }

  // RIGHT SIDE - OFFICE USE ONLY SECTION
  // Course Fees (after "COURSE FEES :")
  if (student.feeDetails) {
    drawText(`Rs${student.feeDetails.courseFees}`, 77, 241);
  
    // Paid Fees (after "PAID FEES :")
    drawText(`Rs${student.feeDetails.feesReceived}`, 269, 243);
  
    // Balance Fees (after "BALANCE FEES :")
    drawText(`Rs${student.feeDetails.balance}`, 455, 242);
  }

  // Contact Number (after "CONTACT NO. :")
  drawText(franchise.mobileNumber, 420, 325);

  // // for director signn
  // instituteSignature
  const pdfBytes = await pdfDoc.save();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=admission_form_${student.studentName.replace(/\s+/g, '_')}.pdf`);
  res.send(Buffer.from(pdfBytes));
});

export {
  registerStudent,
  getStudents,
  getStudentCount,
  getRecentsStudents,
  updateStudent,
  toggleStudentStatus,
  generateAdmissionForm
};
