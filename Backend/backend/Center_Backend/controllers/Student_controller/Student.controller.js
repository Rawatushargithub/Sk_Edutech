import { asyncHandler } from "../../utils/asynchanlder.js";
import Franchise from "../../models/Franchise.model.js";
import Student from "../../models/Student/Student_Detais.model.js";
import Fees_studentModel from "../../models/Student/Fees_student.model.js";
import FeeTransactionModel from "../../models/Student/FeeTransaction.model.js";
import installmentModel from "../../models/Student/installment.model.js";
import BatchModel from "../../models/batch.model.js"; // Import your Batch model
import mongoose from "mongoose"; // Make sure to import mongoose for the transaction
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import Wallet from "../../models/Payment/Wallet.js";
import Transaction from "../../models/Payment/Transaction.js";

import bcrypt from "bcryptjs";

// Add these validation functions at the top of your controller file

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";


// For ES modules, get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const validateRequiredFields = (fields) => {
  const missingFields = [];

  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === "string" && !value.trim())) {
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

// Function to generate roll number
const generateRollNumber = async (franchiseName) => {
  try {
    // Use franchiseName from local storage (passed from frontend)
    let franchisePrefix = "SK";

    // Extract first two letters from franchiseName, convert to uppercase (ignoring spaces)
    let franchiseCode = "";

    if (franchiseName) {
      // Remove all spaces from franchiseName
      const nameWithoutSpaces = franchiseName.replace(/\s+/g, "");

      // Take first two letters and convert to uppercase
      franchiseCode = nameWithoutSpaces.substring(0, 2).toUpperCase();
    } else {
      // Default if no franchiseName
      franchiseCode = "XX";
    }

    // Find the latest roll number with this prefix
    const latestStudent = await Student.findOne({
      rollNumber: new RegExp(`^${franchisePrefix}/${franchiseCode}/\\d+$`),
    }).sort({ rollNumber: -1 });

    let nextNumber = 1001; // Default starting number

    if (latestStudent) {
      // Extract the number part from the latest roll number
      const parts = latestStudent.rollNumber.split("/");
      if (parts.length === 3) {
        const lastNumber = parseInt(parts[2], 10);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
    }

    return `${franchisePrefix}/${franchiseCode}/${nextNumber}`;
  } catch (error) {
    console.error("Error generating roll number:", error);
    throw new Error("Failed to generate roll number");
  }
};

const registerStudent = asyncHandler(async (req, res) => {
  const {
    // rollNumber removed as it will be auto-generated
    studentName,
    relationType,
    fatherHusbandName,
    surnameName,
    franchiseId,
    franchiseName, // Added franchiseName from frontend
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
    paymentMode,
    balance,
    remarks,
    selectedBatch,
    installments,
  } = req.body;

  try {
    // Validate required fields
    const requiredFields = {
      franchiseId,
      franchiseName,
      studentName,
      relationType,
      studentMobile,
      dob,
      gender,
      admissionDate,
    };
   console.log("installments value :: ", installments);
    const missingFields = validateRequiredFields(requiredFields);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        code: "MISSING_REQUIRED_FIELDS",
        missingFields,
      });
    }

    // Validate mobile number
    if (!validateMobile(studentMobile)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid mobile number format. Please enter a valid 10-digit Indian mobile number.",
        code: "INVALID_MOBILE_FORMAT",
      });
    }

    // Validate email if provided
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT",
      });
    }

    // Roll number will be auto-generated, so no need to check for duplicates here

    // Check for duplicate email if provided
    if (email) {
      const existingEmail = await Student.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Student with this email already exists",
          code: "DUPLICATE_EMAIL",
        });
      }
    }

    // Parse and validate courseInterested
    let parsedCourseInterested;
    try {
      parsedCourseInterested = JSON.parse(courseInterested);
      if (
        !parsedCourseInterested.courseName ||
        !parsedCourseInterested.courseCode
      ) {
        return res.status(400).json({
          success: false,
          message: "Course selection is required",
          code: "INVALID_COURSE_SELECTION",
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid course selection format",
        code: "INVALID_COURSE_FORMAT",
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
        code: "INVALID_INSTALLMENTS_FORMAT",
      });
    }

    // Validate batch selection
    if (!selectedBatch) {
      return res.status(400).json({
        success: false,
        message: "Batch selection is required",
        code: "BATCH_REQUIRED",
      });
    }

    // Find and validate batch
    const batch = await BatchModel.findOne({
      $or: [{ batchTiming: selectedBatch }, { batchName: selectedBatch }],
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Selected batch not found",
        code: "BATCH_NOT_FOUND",
      });
    }

    if (batch.remainingSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: "Selected batch has no available seats",
        code: "BATCH_FULL",
      });
    }

    // Validate file uploads
    const studentPhotoLocalPath = req.files?.studentPhoto?.[0]?.path;
    const studentSignatureLocalPath = req.files?.studentSignature?.[0]?.path;

    if (!studentPhotoLocalPath) {
      return res.status(400).json({
        success: false,
        message: "Student photo is required",
        code: "PHOTO_REQUIRED",
      });
    }

    if (!studentSignatureLocalPath) {
      return res.status(400).json({
        success: false,
        message: "Student signature is required",
        code: "SIGNATURE_REQUIRED",
      });
    }

    // Validate fee amounts
    const numericFees = {
      courseFees: Number(courseFees),
      discountAmount: Number(discountAmount) || 0,
      totalFees: Number(totalFees),
      feesReceived: Number(feesReceived) || 0,
    };

    if (isNaN(numericFees.courseFees) || numericFees.courseFees < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course fees amount",
        code: "INVALID_COURSE_FEES",
      });
    }

    if (isNaN(numericFees.totalFees) || numericFees.totalFees < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid total fees amount",
        code: "INVALID_TOTAL_FEES",
      });
    }

    if (numericFees.feesReceived > numericFees.totalFees) {
      return res.status(400).json({
        success: false,
        message: "Fees received cannot be greater than total fees",
        code: "INVALID_FEES_RECEIVED",
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
            code: "INSTALLMENT_NAME_REQUIRED",
          });
        }

        const amount = parseFloat(installment.amount);
        if (isNaN(amount) || amount <= 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid amount for installment: ${installment.name}`,
            code: "INVALID_INSTALLMENT_AMOUNT",
          });
        }

        if (!installment.date) {
          return res.status(400).json({
            success: false,
            message: `Date is required for installment: ${installment.name}`,
            code: "INSTALLMENT_DATE_REQUIRED",
          });
        }
      }
    }

    // Find the franchise to get its ObjectId
    const franchise = await Franchise.findOne({ franchiseId });
    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise not found",
        code: "FRANCHISE_NOT_FOUND",
      });
    }

    // Upload files to Cloudinary
    let studentPhoto, studentSignature;

    try {
      studentPhoto = await uploadOnCloudinary(studentPhotoLocalPath);
      if (!studentPhoto) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload student photo",
          code: "PHOTO_UPLOAD_FAILED",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error uploading student photo",
        code: "PHOTO_UPLOAD_ERROR",
      });
    }

    try {
      studentSignature = await uploadOnCloudinary(studentSignatureLocalPath);
      if (!studentSignature) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload student signature",
          code: "SIGNATURE_UPLOAD_FAILED",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error uploading student signature",
        code: "SIGNATURE_UPLOAD_ERROR",
      });
    }

    // Check wallet balance
    const registrationFee = 300;
    let wallet;
    try {
      wallet = await Wallet.findOne({franchiseId: franchiseId});
      if (!wallet || wallet.balance < registrationFee) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance. Please add money to continue.",
          code: "INSUFFICIENT_BALANCE",
          requiredAmount: registrationFee,
          currentBalance: wallet ? wallet.balance : 0,
        });
      }
    } catch (walletError) {
      console.error("Error checking wallet balance:", walletError);
      return res.status(500).json({
        success: false,
        message: "Error checking wallet balance",
        code: "WALLET_ERROR",
      });
    }

    // Database transaction
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      // Generate roll number without concurrency handling
      // Use franchiseName for roll number generation
      let rollNumber;
      try {
        rollNumber = await generateRollNumber(franchiseName);
        console.log("Generated roll number:", rollNumber);
        console.log("Franchise Name:", franchiseName);
        console.log("Franchise ID:", franchiseId);
      } catch (rollNumberError) {
        console.error("Error generating roll number:", rollNumberError);
        throw new Error(
          "Failed to generate roll number: " + rollNumberError.message
        );
      }
      // Create student record with the auto-generated roll number
      let student;
      try {
        const studentData = {
          studentPhoto: studentPhoto.url,
          studentSignature: studentSignature.url,
          rollNumber, // Auto-generated roll number
          abbreviation: req.body.abbreviation || "Mr.",
          studentName,
          franchiseId,
          relationType,
          includeFatherHusband:
            req.body.includeFatherHusband !== undefined
              ? req.body.includeFatherHusband
              : true,
          surnameName,
          includeSurname:
            req.body.includeSurname !== undefined
              ? req.body.includeSurname
              : true,
          motherName,
          courseInterested: parsedCourseInterested,
          studentMobile,
          alternateMobile,
          email,
          password: studentMobile.toString(),
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
        };

        if (studentData.includeFatherHusband) {
          studentData.fatherHusbandName = fatherHusbandName || "";
        }

        student = await Student.create(
          [
            studentData
          ],
          { session }
        );
      } catch (studentCreateError) {
        console.error("Error creating student record:", studentCreateError);
        throw new Error(
          "Failed to create student record: " + studentCreateError.message
        );
      }

      const studentId = student[0]._id;

      // Create fee record
      const fee = await Fees_studentModel.create(
        [
          {
            studentId: studentId,
            courseFees: numericFees.courseFees,
            discountType: discountType || "amount-",
            discountAmount: numericFees.discountAmount,
            totalFees: numericFees.totalFees,
            feesReceived: numericFees.feesReceived,
            balance: numericFees.totalFees - numericFees.feesReceived,
            remarks: remarks || "",
          },
        ],
        { session }
      );

      // Create initial fee transaction if fees were received during registration
      if (numericFees.feesReceived) {
        await FeeTransactionModel.create(
          [
            {
              studentId: studentId,
              feeId: fee[0]._id,
              amount: numericFees.feesReceived,
              date: admissionDate, // or new Date().toISOString().slice(0, 10)
              paymentMode: paymentMode, // or add paymentMode field in registration form
            },
          ],
          { session }
        );
      }

      // Create installment records
      const installmentRecords = [];
      if (parsedInstallments.length > 0) {
        for (const installment of parsedInstallments) {
          const newInstallment = await installmentModel.create(
            [
              {
                studentId: studentId,
                installmentName: installment.name,
                amount: Number(installment.amount),
                date: installment.date,
                paid: false,
                paymentMode: installment.paymentMode || null,
                paymentDate: null,
                paidAmount: 0,
                status: "Pending"
              },
            ],
            { session }
          );
          installmentRecords.push(newInstallment[0]._id);
        }
      }

      // Update student with references
      await Student.findByIdAndUpdate(
        studentId,
        {
          feeDetails: fee[0]._id,
          installmentDetails: installmentRecords,
        },
        { session }
      );

      // Update batch
      await BatchModel.findByIdAndUpdate(
        batch._id,
        {
          $inc: { currentStudents: 1 },
        },
        { session }
      );

      // Update wallet
      wallet.balance -= registrationFee;
      await wallet.save({ session });

      // Create transaction record
      await Transaction.create(
        [
          {
            franchise: franchise._id, // Add the franchise ObjectId
            amount: registrationFee,
            type: "withdrawal",
            status: "approved",
            referenceId: "Student Registration",
            timestamp: new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Fetch complete student record (password will be excluded due to select: false)
      const completeStudent = await Student.findById(studentId)
        .populate("feeDetails")
        .populate("installmentDetails")
        .populate("selectedBatch");

      return res.status(201).json({
        success: true,
        message: "Student registered successfully",
        data: completeStudent,
      });
    } catch (transactionError) {
      if (session) {
        try {
          await session.abortTransaction();
          session.endSession();
        } catch (abortError) {
          console.error("Error aborting transaction:", abortError);
        }
      }

      console.error("Transaction error:", transactionError);

      if (transactionError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Duplicate entry detected",
          code: "DUPLICATE_ENTRY",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Database transaction failed: " +
          (transactionError.message || "Unknown error"),
        code: "TRANSACTION_FAILED",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Student registration failed",
      code: "REGISTRATION_FAILED",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// const registerStudent = asyncHandler(async (req, res) => {
//   const {
//     rollNumber,
//     studentName,
//     relationType,
//     fatherHusbandName,
//     surnameName,
//     franchiseId,
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
//     courseFees,
//     discountType,
//     discountAmount,
//     totalFees,
//     feesReceived,
//     balance,
//     remarks,
//     selectedBatch,
//     installments,
//   } = req.body;

//   try {
//     // Validate required fields
//     const requiredFields = {
//       rollNumber,
//       studentName,
//       relationType,
//       studentMobile,
//       dob,
//       gender,
//       admissionDate
//     };

//     const missingFields = validateRequiredFields(requiredFields);
//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Missing required fields: ${missingFields.join(', ')}`,
//         code: 'MISSING_REQUIRED_FIELDS',
//         missingFields
//       });
//     }

//     // Validate mobile number
//     if (!validateMobile(studentMobile)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid mobile number format. Please enter a valid 10-digit Indian mobile number.",
//         code: 'INVALID_MOBILE_FORMAT'
//       });
//     }

//     // Validate email if provided
//     if (email && !validateEmail(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format",
//         code: 'INVALID_EMAIL_FORMAT'
//       });
//     }

//     // Check for duplicate roll number
//     const existingStudent = await Student.findOne({ rollNumber });
//     if (existingStudent) {
//       return res.status(409).json({
//         success: false,
//         message: "Student with this roll number already exists",
//         code: 'DUPLICATE_ROLL_NUMBER'
//       });
//     }

//     // Check for duplicate email if provided
//     if (email) {
//       const existingEmail = await Student.findOne({ email });
//       if (existingEmail) {
//         return res.status(409).json({
//           success: false,
//           message: "Student with this email already exists",
//           code: 'DUPLICATE_EMAIL'
//         });
//       }
//     }

//     // Parse and validate courseInterested
//     let parsedCourseInterested;
//     try {
//       parsedCourseInterested = JSON.parse(courseInterested);
//       if (!parsedCourseInterested.courseName || !parsedCourseInterested.courseCode) {
//         return res.status(400).json({
//           success: false,
//           message: "Course selection is required",
//           code: 'INVALID_COURSE_SELECTION'
//         });
//       }
//     } catch (err) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid course selection format",
//         code: 'INVALID_COURSE_FORMAT'
//       });
//     }

//     // Parse and validate installments
//     let parsedInstallments = [];
//     try {
//       if (installments) {
//         if (typeof installments === "string") {
//           parsedInstallments = JSON.parse(installments);
//         } else if (Array.isArray(installments)) {
//           parsedInstallments = installments;
//         }
//       }
//     } catch (err) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid installments format",
//         code: 'INVALID_INSTALLMENTS_FORMAT'
//       });
//     }

//     // Validate batch selection
//     if (!selectedBatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Batch selection is required",
//         code: 'BATCH_REQUIRED'
//       });
//     }

//     // Find and validate batch
//     const batch = await BatchModel.findOne({
//       $or: [
//         { batchTiming: selectedBatch },
//         { batchName: selectedBatch },
//       ],
//     });

//     if (!batch) {
//       return res.status(404).json({
//         success: false,
//         message: "Selected batch not found",
//         code: 'BATCH_NOT_FOUND'
//       });
//     }

//     if (batch.remainingSeats <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Selected batch has no available seats",
//         code: 'BATCH_FULL'
//       });
//     }

//     // Validate file uploads
//     const studentPhotoLocalPath = req.files?.studentPhoto?.[0]?.path;
//     const studentSignatureLocalPath = req.files?.studentSignature?.[0]?.path;

//     if (!studentPhotoLocalPath) {
//       return res.status(400).json({
//         success: false,
//         message: "Student photo is required",
//         code: 'PHOTO_REQUIRED'
//       });
//     }

//     if (!studentSignatureLocalPath) {
//       return res.status(400).json({
//         success: false,
//         message: "Student signature is required",
//         code: 'SIGNATURE_REQUIRED'
//       });
//     }

//     // Validate fee amounts
//     const numericFees = {
//       courseFees: Number(courseFees),
//       discountAmount: Number(discountAmount) || 0,
//       totalFees: Number(totalFees),
//       feesReceived: Number(feesReceived) || 0
//     };

//     if (isNaN(numericFees.courseFees) || numericFees.courseFees < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid course fees amount",
//         code: 'INVALID_COURSE_FEES'
//       });
//     }

//     if (isNaN(numericFees.totalFees) || numericFees.totalFees < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid total fees amount",
//         code: 'INVALID_TOTAL_FEES'
//       });
//     }

//     if (numericFees.feesReceived > numericFees.totalFees) {
//       return res.status(400).json({
//         success: false,
//         message: "Fees received cannot be greater than total fees",
//         code: 'INVALID_FEES_RECEIVED'
//       });
//     }

//     // Validate installments if provided
//     if (parsedInstallments.length > 0) {
//       for (let i = 0; i < parsedInstallments.length; i++) {
//         const installment = parsedInstallments[i];

//         if (!installment.name || !installment.name.trim()) {
//           return res.status(400).json({
//             success: false,
//             message: `Installment name is required for installment ${i + 1}`,
//             code: 'INSTALLMENT_NAME_REQUIRED'
//           });
//         }

//         const amount = parseFloat(installment.amount);
//         if (isNaN(amount) || amount <= 0) {
//           return res.status(400).json({
//             success: false,
//             message: `Invalid amount for installment: ${installment.name}`,
//             code: 'INVALID_INSTALLMENT_AMOUNT'
//           });
//         }

//         if (!installment.date) {
//           return res.status(400).json({
//             success: false,
//             message: `Date is required for installment: ${installment.name}`,
//             code: 'INSTALLMENT_DATE_REQUIRED'
//           });
//         }
//       }
//     }

//     // Upload files to Cloudinary
//     let studentPhoto, studentSignature;

//     try {
//       studentPhoto = await uploadOnCloudinary(studentPhotoLocalPath);
//       if (!studentPhoto) {
//         return res.status(500).json({
//           success: false,
//           message: "Failed to upload student photo",
//           code: 'PHOTO_UPLOAD_FAILED'
//         });
//       }
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Error uploading student photo",
//         code: 'PHOTO_UPLOAD_ERROR'
//       });
//     }

//     try {
//       studentSignature = await uploadOnCloudinary(studentSignatureLocalPath);
//       if (!studentSignature) {
//         return res.status(500).json({
//           success: false,
//           message: "Failed to upload student signature",
//           code: 'SIGNATURE_UPLOAD_FAILED'
//         });
//       }
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Error uploading student signature",
//         code: 'SIGNATURE_UPLOAD_ERROR'
//       });
//     }

//     // Check wallet balance
//     const registrationFee = 300;
//     let wallet = await Wallet.findOne();
//     if (!wallet || wallet.balance < registrationFee) {
//       return res.status(400).json({
//         success: false,
//         message: "Insufficient wallet balance. Please add money to continue.",
//         code: 'INSUFFICIENT_BALANCE',
//         requiredAmount: registrationFee,
//         currentBalance: wallet ? wallet.balance : 0
//       });
//     }

//     // Database transaction
//     let session;
//     try {
//       session = await mongoose.startSession();
//       session.startTransaction();
//       console.log(franchiseId)
//       // Create student record
//       const student = await Student.create([{
//         studentPhoto: studentPhoto.url,
//         studentSignature: studentSignature.url,
//         rollNumber,
//         abbreviation: req.body.abbreviation || "Mr.",
//         studentName,
//         franchiseId,
//         relationType,
//         fatherHusbandName,
//         includeFatherHusband: req.body.includeFatherHusband !== undefined ? req.body.includeFatherHusband : true,
//         surnameName,
//         includeSurname: req.body.includeSurname !== undefined ? req.body.includeSurname : true,
//         motherName,
//         courseInterested: parsedCourseInterested,
//         studentMobile,
//         alternateMobile,
//         email,
//         dob,
//         gender,
//         city,
//         postCode,
//         permanentAddress,
//         referralCode,
//         caste,
//         qualifications,
//         occupation,
//         admissionDate,
//         selectedBatch: batch._id,
//         displayAdmissionOptions: displayAdmissionOptions || false,
//       }], { session });

//       const studentId = student[0]._id;

//       // Create fee record
//       const fee = await Fees_studentModel.create([{
//         studentId: studentId,
//         courseFees: numericFees.courseFees,
//         discountType: discountType || "amount-",
//         discountAmount: numericFees.discountAmount,
//         totalFees: numericFees.totalFees,
//         feesReceived: numericFees.feesReceived,
//         balance: numericFees.totalFees - numericFees.feesReceived,
//         remarks: remarks || "",
//       }], { session });

//       // Create installment records
//       const installmentRecords = [];
//       if (parsedInstallments.length > 0) {
//         for (const installment of parsedInstallments) {
//           const newInstallment = await installmentModel.create([{
//             studentId: studentId,
//             installmentName: installment.name,
//             amount: Number(installment.amount),
//             date: installment.date,
//             paid: false,
//           }], { session });
//           installmentRecords.push(newInstallment[0]._id);
//         }
//       }

//       // Update student with references
//       await Student.findByIdAndUpdate(studentId, {
//         feeDetails: fee[0]._id,
//         installmentDetails: installmentRecords,
//       }, { session });

//       // Update batch
//       await BatchModel.findByIdAndUpdate(batch._id, {
//         $inc: { currentStudents: 1 }
//       }, { session });

//       // Update wallet
//       wallet.balance -= registrationFee;
//       await wallet.save({ session });

//       // Create transaction record
//       await Transaction.create([{
//         amount: registrationFee,
//         type: "withdrawal",
//         status: "approved",
//         referenceId: "Student Registration",
//         timestamp: new Date(),
//       }], { session });

//       await session.commitTransaction();
//       session.endSession();

//       // Fetch complete student record
//       const completeStudent = await Student.findById(studentId)
//         .populate("feeDetails")
//         .populate("installmentDetails")
//         .populate("selectedBatch");

//       return res.status(201).json({
//         success: true,
//         message: "Student registered successfully",
//         data: completeStudent
//       });

//     } catch (transactionError) {
//       if (session) {
//         await session.abortTransaction();
//         session.endSession();
//       }

//       console.error("Transaction error:", transactionError);

//       if (transactionError.code === 11000) {
//         return res.status(409).json({
//           success: false,
//           message: "Duplicate entry detected",
//           code: 'DUPLICATE_ENTRY'
//         });
//       }

//       return res.status(500).json({
//         success: false,
//         message: "Database transaction failed",
//         code: 'TRANSACTION_FAILED'
//       });
//     }

//   } catch (error) {
//     console.error("Registration error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Student registration failed",
//       code: 'REGISTRATION_FAILED',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

const getStudents = asyncHandler(async (req, res) => {
  // Get pagination parameters from query string with defaults
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Get filter parameters if any
  const { course, batch, searchTerm, franchiseId } = req.query;

  // Build filter object
  let filter = {};
  console.log("franchiseId value :: ", franchiseId);
  // Add franchiseID filter - this is the key change
  if (franchiseId) {
    filter.franchiseId = franchiseId;
  } else {
    // If no franchiseID is provided, return an error or empty result
    return res
      .status(400)
      .json(new ApiResponse(400, [], "FranchiseID is required"));
  }
  console.log("filter value :: ", filter);
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
      "studentPhoto studentSignature studentName rollNumber abbreviation franchiseId status courseInterested studentMobile referralCode email dob city postCode permanentAddress admissionDate caste qualifications occupation relationType gender selectedBatch motherName "
    )
    .populate({
      path: "selectedBatch",
      select: "batchName", // Only select the batchName field
    })
    .skip(skip)
    .limit(limit)
    .sort({ admissionDate: -1 }); // Sort by admission date, newest first
  
  // Format the results to include the batch name in a new field
  const formattedStudents = students.map((student) => {
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
      .json(new ApiResponse(200, [], "No students found for this franchise"));
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
    const count = await Student.countDocuments({ franchiseId }); // { instituteId: req.user.instituteId } <= when add the instituteID to the students

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching student count", error });
  }
});

const getRecentsStudents = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const { franchiseId } = req.query;
    console.log("franchiseId value :: ", franchiseId);
    if (!franchiseId) {
      return res.status(400).json({ message: "Franchise ID is required" });
    }

    const students = await Student.find({ franchiseId: franchiseId })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .limit(limit)
      .select("studentName courseInterested rollNumber createdAt studentPhoto");
    console.log("students value :: ", students);
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    // Format the response data
    const formattedStudents = students.map((student) => ({
      id: student._id,
      name: student.studentName,
      course: student.courseInterested,
      rollNumber: student.rollNumber,
      photoUrl: student.studentPhoto,
      addedOn: student.createdAt,
    }));

    console.log(formattedStudents);
    res.status(200).json(formattedStudents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const updateStudent = asyncHandler(async (req, res) => {
  console.log("update is working");
  try {
    console.log("id value:: ", req.params.id);
    console.log(req.body);
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
        message: "Student not found",
      });
    }
    console.log("updated student in backend :: ", updatedStudent);

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: error.message,
    });
  }
});

const toggleStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log("toggleStudentStatus called with id:", id, "status:", status);
    
    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    // Validate status - now accepts enum values
    const validStatuses = ["active", "inactive", "Certified"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: active, inactive, Certified",
      });
    }

    // Find and update student
    const student = await Student.findByIdAndUpdate(
      { _id: id },
      { status },
      { new: true, runValidators: true }
    );

    console.log("Found student:", student);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    
    console.log("Updated student:", student.status, "roll number:", student.rollNumber);
    
    res.status(200).json({
      success: true,
      message: `Student status updated to ${status} successfully`,
      data: {
        id: student._id,
        studentName: student.studentName,
        status: student.status,
        updatedAt: student.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error toggling student status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
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
    .populate("selectedBatch")
    .populate("installmentDetails");

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  let franchise;
  try {
    franchise = await Franchise.findOne({ franchiseId: student.franchiseId });
  } catch (error) {
    console.error("Error fetching franchise:", error);
  }

  const pdfPath = path.join(__dirname, "../../../templates/blank_form.pdf");

 
  const existingPdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page = pdfDoc.getPages()[0];

  // Get page dimensions for centering calculations
  const pageWidth = page.getWidth();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const size = 10;
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const drawText = (
    text,
    x,
    y,
    color = rgb(0, 0, 0),
    textFont = font,
    textSize = size
  ) => {
    if (text) {
      // Replace unsupported characters before drawing
      const sanitizedText = String(text)
        .replace(/₹/g, "Rs.")
        .replace(/✓/g, "Y");
      page.drawText(sanitizedText, {
        x,
        y,
        font: textFont,
        size: textSize,
        color,
      });
    }
  };

  const drawCenteredText = (
    text,
    y,
    color = rgb(0, 0, 0),
    textFont = font,
    textSize = size
  ) => {
    if (text) {
      const sanitizedText = String(text)
        .replace(/₹/g, "Rs.")
        .replace(/✓/g, "Y");
      const textWidth = textFont.widthOfTextAtSize(sanitizedText, textSize);
      const x = (pageWidth - textWidth) / 2;
      page.drawText(sanitizedText, {
        x,
        y,
        font: textFont,
        size: textSize,
        color,
      });
    }
  };

  // Fetch and embed student photo (top right photo box)
  if (student.studentPhoto) {
    try {
      const photoUrl = student.studentPhoto;
      const photoResponse = await axios.get(photoUrl, {
        responseType: "arraybuffer",
      });
      const photoBytes = await sharp(photoResponse.data).rotate().toBuffer();
      let photoImage;
      if (photoUrl.includes(".jpg") || photoUrl.includes(".jpeg")) {
        photoImage = await pdfDoc.embedJpg(photoBytes);
      } else {
        photoImage = await pdfDoc.embedPng(photoBytes);
      }
      // Photo position in top right corner
      page.drawImage(photoImage, { x: 470, y: 625, width: 70, height: 75 });
    } catch (error) {
      console.error("Error fetching or embedding student photo:", error);
    }
  }

  // Fetch and embed student signature (bottom right signature box)
  if (student.studentSignature) {
    try {
      const signatureUrl = student.studentSignature;
      const signatureResponse = await axios.get(signatureUrl, {
        responseType: "arraybuffer",
      });
      const signatureBytes = await sharp(signatureResponse.data).rotate().toBuffer();
      let signatureImage;
      if (signatureUrl.includes(".jpg") || signatureUrl.includes(".jpeg")) {
        signatureImage = await pdfDoc.embedJpg(signatureBytes);
      } else {
        signatureImage = await pdfDoc.embedPng(signatureBytes);
      }
      // Signature position in bottom right
      page.drawImage(signatureImage, {
        x: 396,
        y: 316,
        width: 120,
        height: 40,
      });
    } catch (error) {
      console.error("Error fetching or embedding student signature:", error);
    }
  }

  // Fetch and embed franchise signature (bottom signature box)
  if (franchise && franchise.franchiseSignatureUrl) {
    try {
      const franchiseSignatureUrl = franchise.franchiseSignatureUrl;
      const signatureResponse = await axios.get(franchiseSignatureUrl, { 
        responseType: 'arraybuffer' 
      });
      const signatureBytes = Buffer.from(signatureResponse.data, 'binary');

      let franchiseSignatureImage;
      if (
        franchiseSignatureUrl.includes(".jpg") ||
        franchiseSignatureUrl.includes(".jpeg")
      ) {
        franchiseSignatureImage = await pdfDoc.embedJpg(signatureBytes);
      } else {
        franchiseSignatureImage = await pdfDoc.embedPng(signatureBytes);
      }
      
      page.drawImage(franchiseSignatureImage, { x: 16, y: 95, width: 120, height: 40 });
    } catch (error) {
      console.error("Error fetching or embedding franchise signature:", error);
    }
  }

  // TOP SECTION - CENTERED FRANCHISE INFORMATION SECTION
  if (franchise) {
    // Center the franchise logo first
    if (franchise.franchiseLogoUrl) {
      try {
        const logoUrl = franchise.franchiseLogoUrl;
        const logoResponse = await axios.get(logoUrl, {
          responseType: "arraybuffer",
        });
        const logoBytes = Buffer.from(logoResponse.data, "binary");
        let logoImage;
        if (logoUrl.includes(".jpg") || logoUrl.includes(".jpeg")) {
          logoImage = await pdfDoc.embedJpg(logoBytes);
        } else {
          logoImage = await pdfDoc.embedPng(logoBytes);
        }
        
        // Center the logo horizontally
        const logoWidth = 65;
        const logoX = (pageWidth - logoWidth) / 2;
        page.drawImage(logoImage, { 
          x: logoX, 
          y: 650,
          width: logoWidth, 
          height: 65
        });
      } catch (error) {
        console.error("Error fetching or embedding franchise logo:", error);
      }
    }

    // Center the franchise name with bigger text
    drawCenteredText(
      franchise.franchiseName, 
      716, 
      rgb(0, 0, 0), 
      boldFont, 
      25
    );
  }

  // Admission Date (top left, after "ADMISSION DATE :")
  drawText(
    student.admissionDate
      ? new Date(student.admissionDate).toLocaleDateString("en-GB")
      : "",
    24,
    593
  );

  // Roll Number (top right, after "ROLL NUMBER :")
  drawText(student.rollNumber, 419, 593);

  // Course of Interest (below admission date, after "COURSE OF INTEREST:")
  drawText(student.courseInterested?.courseName || "", 27, 546);

  // MAIN STUDENT DETAILS SECTION
  // First row - Student Name, Father/Husband Name, Surname
  drawText(student.studentName, 27, 505); // After "STUDENT NAME"
  drawText(student.fatherHusbandName, 180, 505); // After "FATHER/HUSBAND NAME"
  drawText(student.surnameName, 340, 505); // After "SURNAME"

  // Second row - Mother Name
  drawText(student.motherName, 469, 505); // After "MOTHER NAME"

  // Third row - Mobile numbers
  drawText(student.studentMobile, 206, 464); // After "STUDENT MOBILE:"
  drawText(student.alternateMobile, 392, 464); // After "ALTERNATE MOBILE:"

  // Fourth row - DOB, Gender, Email
  drawText(
    student.dob ? new Date(student.dob).toLocaleDateString("en-GB") : "",
    384,
    426
  ); // After "DATE OF BIRTH.:"
  drawText(student.gender, 27, 426); // After "GENDER:"
  drawText(student.email, 138, 426); // After "E-MAIL:"

  // Fifth row - Caste, Qualification, Occupation, State, Post Code
  drawText(student.caste, 27, 388); // After "CASTE:"
  drawText(student.qualifications, 116, 388); // After "QUALIFICATION.:"
  drawText(student.occupation, 277, 388); // After "OCCUPATION.:"
  drawText(student.state || "Haryana", 390, 388); // After "STATE:"
  drawText(student.postCode, 486, 388); // After "POST CODE:"

  // ADDRESS SECTION
  // Permanent Address (multiline field after "ADDRESS:-")
  // const addressLines = student.permanentAddress ? student.permanentAddress.split('\n') : [];
  // addressLines.forEach((line, index) => {
  //   if (index < 2) { // Limit to 2 lines for current address
  //     drawText(line, 22, 323 - (index * 15));
  //   }
  // });

  // Permanent Address (after "PERMANENT ADDRESS.:")
  const permAddressLines = student.permanentAddress
    ? student.permanentAddress.split("\n")
    : [];
  permAddressLines.forEach((line, index) => {
    if (index < 2) {
      // Limit to 2 lines for permanent address
      drawText(line, 27, 344 - index * 15);
    }
  });

  // LEFT SIDE - OFFICE USE ONLY SECTION
  // Aadhaar Card Number (after "ADHAR CARD NUMBER.:")
  drawText(student.aadhaarNumber || "", 27, 466);

  // Batch Name (after "BATCH NAME")
  if (student.selectedBatch) {
    drawText(
      student.selectedBatch.batchName || student.selectedBatch.batchTiming,
      71,
      197
    );
  }

  // RIGHT SIDE - OFFICE USE ONLY SECTION
  // Course Fees (after "COURSE FEES :")
  if (student.feeDetails) {
    drawText(`Rs ${student.feeDetails.totalFees}`, 77, 238);

    // Paid Fees (after "PAID FEES :")
    drawText(`Rs ${student.feeDetails.feesReceived}`, 269, 238);

    // Balance Fees (after "BALANCE FEES :")
    let finalBalanceFee;
    if (student.feeDetails) {
        const totalFeeNum = Number(student.feeDetails.totalFees || 0);
        const paidFeeNum = Number(student.feeDetails.feesReceived || 0);
        const dueFromFees = totalFeeNum - paidFeeNum;

        const hasInstallments = Array.isArray(student.installmentDetails) && student.installmentDetails.length > 0;
        
        let dueFromInstallments = 0;
        if (hasInstallments) {
            const totalInstallmentAmount = student.installmentDetails.reduce((sum, inst) => sum + (inst.amount || 0), 0);
            const paidInstallmentAmount = student.installmentDetails.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
            dueFromInstallments = totalInstallmentAmount - paidInstallmentAmount;
        }

        const display = hasInstallments ? dueFromInstallments : dueFromFees;
        finalBalanceFee = isNaN(display) ? 0 : display;
    } else {
        finalBalanceFee = 0;
    }
    drawText(`Rs ${finalBalanceFee.toLocaleString()}`, 455, 238);
  }

  // Contact Number (after "CONTACT NO. :")
  if (franchise) {
    drawText(franchise.mobile, 244, 74);
    drawText(franchise.address, 152, 35);
  }

  const pdfBytes = await pdfDoc.save();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=admission_form_${student.studentName.replace(
      /\s+/g,
      "_"
    )}.pdf`
  );
  res.send(Buffer.from(pdfBytes));
});

const generateIdCard = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new ApiError(400, "Invalid student ID");
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const franchise = await Franchise.findOne({ franchiseId: student.franchiseId });
  if (!franchise) {
    throw new ApiError(404, "Franchise not found");
  }

  const pdfPath = path.join(__dirname, "../../../templates/ID_TEMPLATE.pdf");
  const existingPdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page = pdfDoc.getPages()[0];

  // Get page dimensions for centering calculations
  const pageWidth = page.getWidth();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const size = 6;

  const drawText = (text, x, y, color = rgb(0, 0, 0), textFont = font, textSize = size) => {
    if (text) {
      page.drawText(String(text), { x, y, font: textFont, size: textSize, color });
    }
  };

  // Helper function to draw centered text
  // const drawCenteredText = (
  //   text,
  //   y,
  //   color = rgb(0, 0, 0),
  //   textFont = font,
  //   textSize = size,
  //   targetPage = page
  // ) => {
  //   if (text) {
  //     const textWidth = textFont.widthOfTextAtSize(String(text), textSize);
  //     const x = -10 + (pageWidth - textWidth) / 2;
  //     targetPage.drawText(String(text), {
  //       x,
  //       y,
  //       font: textFont,
  //       size: textSize,
  //       color,
  //     });
  //   }
  // };

  // Helper function to draw centered text within specific bounds (for address)
  const drawCenteredTextInBounds = (
    text,
    y,
    leftBound,
    rightBound,
    color = rgb(0, 0, 0),
    textFont = font,
    textSize = size,
    targetPage = page
  ) => {
    if (text) {
      const availableWidth = rightBound - leftBound;
      const textWidth = textFont.widthOfTextAtSize(String(text), textSize);
      const x = leftBound + (availableWidth - textWidth) / 2;
      targetPage.drawText(String(text), {
        x,
        y,
        font: textFont,
        size: textSize,
        color,
      });
    }
  };

  // Helper function to break text into multiple lines based on width
  const breakTextIntoLines = (text, maxWidth, textFont, textSize) => {
    if (!text) return [];
    
    const words = String(text).split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      try {
        const testWidth = textFont.widthOfTextAtSize(testLine, textSize);
        
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Single word is too long, force it on its own line
            lines.push(word);
          }
        }
      } catch (error) {
        console.error('Error calculating text width:', error);
        // If there's an error calculating width, just add the word to current line
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  // Helper function to process text with paragraphs and line breaks
  const processTextWithParagraphs = (text, maxWidth, textFont, textSize) => {
    if (!text) return [];
    
    // Split text into paragraphs by double newlines first, then single newlines as fallback
    let paragraphs = String(text).split(/\r?\n\r?\n/).filter(p => p.trim());
    
    // If no double newlines found, split by single newlines
    if (paragraphs.length === 1) {
      paragraphs = String(text).split(/\r?\n/).filter(p => p.trim());
    }
    
    const allLines = [];
    
    paragraphs.forEach((paragraph, index) => {
      // Process each paragraph separately
      const paragraphLines = breakTextIntoLines(paragraph.trim(), maxWidth, textFont, textSize);
      allLines.push(...paragraphLines);
      
      // Add empty line between paragraphs (except for the last paragraph)
      if (index < paragraphs.length - 1) {
        allLines.push(''); // Empty line for spacing
      }
    });
    
    return allLines;
  };

  // Helper function to get first name only
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.trim().split(/\s+/)[0]; // Split by any whitespace and take first part
  };

  // Fetch and embed student photo with perfect circular crop
  if (student.studentPhoto) {
    try {
      const photoUrl = student.studentPhoto;
      const photoResponse = await axios.get(photoUrl, { responseType: 'arraybuffer' });
      const photoBytes = Buffer.from(photoResponse.data, 'binary');
      
      // Create circular cropped image using Canvas with higher resolution
      const { createCanvas, loadImage } = await import('canvas');
      const radius = 31.25; // Increased by 0.25x (25 * 1.25 = 31.25)
      const diameter = radius * 2; // 62.5 units
      
      // Create high-resolution canvas (4x scale for crisp quality)
      const scale = 4;
      const canvasSize = diameter * scale;
      const canvas = createCanvas(canvasSize, canvasSize);
      const ctx = canvas.getContext('2d');
      
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Load the image
      const img = await loadImage(photoBytes);
      
      // Calculate dimensions for center cropping
      const size = Math.min(img.width, img.height);
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;
      
      // Create circular clipping path at high resolution
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      
      // Draw the image at high resolution (center cropped and scaled to fit)
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, canvasSize, canvasSize);
      
      // Convert canvas to PNG buffer
      const circularImageBuffer = canvas.toBuffer('image/png');
      
      // Embed the circular image into PDF
      const circularImage = await pdfDoc.embedPng(circularImageBuffer);
      
      // Draw the perfectly circular image at specified center position
      const centerX = 62;
      const centerY = 197;
      const imageX = centerX - radius;
      const imageY = centerY - radius;
      
      page.drawImage(circularImage, { 
        x: imageX, 
        y: imageY, 
        width: diameter, 
        height: diameter 
      });
      
    } catch (error) {
      console.error("Error fetching or embedding student photo:", error);
    }
  }

  // Helper function to capitalize text
  const capitalizeText = (text) => {
    if (!text) return '';
    return String(text).toUpperCase();
  };

  // Get both pages
  const firstPage = pdfDoc.getPages()[0];
  const secondPage = pdfDoc.getPages()[1];

  // Populate ID card fields on first page with capitalization
  // Use only first name for student name
  const firstName = getFirstName(student.studentName);
  drawText(capitalizeText(firstName), 40, 147, rgb(0, 0, 0), boldFont, 10);
  
  drawText(student.rollNumber, 66, 83);
  drawText(capitalizeText(student.courseInterested?.courseCode || ''), 66, 108);
  drawText(student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-GB') : '', 66, 133);
  drawText(capitalizeText(student.fatherHusbandName || student.motherName), 66, 120);
  drawText(student.studentMobile, 66, 95);
  
  // TASK 2: Format address in center of blue box with multi-line support
  if (franchise.address) {
    // Define bounds for the blue box (assuming 17 units from left is non-existential)
    const leftBound = 17;
    const rightBound = pageWidth - 7; // 7 units from right
    const availableWidth = rightBound - leftBound;
    
    // Break address into multiple lines if needed
    const addressLines = breakTextIntoLines(franchise.address, availableWidth, font, 4);
    
    // Draw each line of address, starting from y=15 and moving down
    let currentY = 15;
    addressLines.forEach((line, index) => {
      drawCenteredTextInBounds(
        line,
        currentY - (index * 5), // 5 units spacing between lines
        leftBound,
        rightBound,
        rgb(1, 1, 1),
        font,
        4,
        firstPage
      );
    });
  }
  
  // Add "M:" prefix to franchise mobile number
  drawText(`M: ${franchise.mobile}`, 75, 39);

  // CENTERED FRANCHISE NAME AND LOGO - First Page
  const franchiseName = capitalizeText(franchise.franchiseName || franchise.name || '');
  
  // Fetch and embed franchise logo
  let franchiseLogo = null;
  let logoWidth = 0;
  let logoHeight = 0;

  if (franchise.franchiseLogoUrl) {
    try {
      const logoUrl = franchise.franchiseLogoUrl;
      const logoResponse = await axios.get(logoUrl, { responseType: 'arraybuffer' });
      const logoBytes = Buffer.from(logoResponse.data, 'binary');
      
      // Determine image type and embed accordingly
      const logoContentType = logoResponse.headers['content-type'];
      if (logoContentType && logoContentType.includes('png')) {
        franchiseLogo = await pdfDoc.embedPng(logoBytes);
      } else if (logoContentType && (logoContentType.includes('jpeg') || logoContentType.includes('jpg'))) {
        franchiseLogo = await pdfDoc.embedJpg(logoBytes);
      }
      
      if (franchiseLogo) {
        // Set logo dimensions (adjust as needed)
        logoHeight = 15; // Fixed height
        logoWidth = (franchiseLogo.width / franchiseLogo.height) * logoHeight; // Maintain aspect ratio
      }
    } catch (error) {
      console.error("Error fetching or embedding franchise logo:", error);
    }
  }
  
  // Calculate total width of logo + spacing + text for centering
  const textFont = boldFont;
  const textSize = 8;
  const textWidth = franchiseName ? textFont.widthOfTextAtSize(franchiseName, textSize) : 0;
  const spacing = franchiseLogo && franchiseName ? 5 : 0; // 5 units spacing between logo and text
  const totalWidth = logoWidth + spacing + textWidth;
  
  // Calculate starting X position for centering the entire logo+text combination
  const startX = (pageWidth - totalWidth) / 2 - 10; // -10 for the same offset used in drawCenteredText
  
  // Draw logo at calculated position
  if (franchiseLogo) {
    firstPage.drawImage(franchiseLogo, {
      x: startX,
      y: 232, // Y position as requested (adjustable)
      width: logoWidth,
      height: logoHeight
    });
    // print("logo printed")
  }
  
  // Draw franchise name next to logo
  if (franchiseName) {
    const textX = startX + logoWidth + spacing;
    firstPage.drawText(franchiseName, {
      x: textX,
      y: 237, // Slightly higher than logo to align with text baseline
      font: boldFont,
      size: textSize,
      color: rgb(1, 1, 1)
    });
  }

  // TASK 1: Second page content with proper terms and conditions
  const termsAndConditionsText = `This Card is the Property of "${franchiseName}" authorized by SK EDUTECH and cannot be transferrable. In case it is lost, the finder may post the card at the study centre address. 
  
  This card must be carried to the institute daily and also in all official events when representing the institute. 
  
  Loss of the identity card must be immediately reported to the Management department of the institute & a duplicate identity card must be procured on payment of processing fee of Rs. 100/- only.`;

  // Break the terms and conditions text into multiple lines with paragraph support
  const leftMargin = 7;
  const rightMargin = 7;
  const secondPageWidth = secondPage.getWidth();
  const availableTextWidth = secondPageWidth - leftMargin - rightMargin;
  
  const termsLines = processTextWithParagraphs(termsAndConditionsText, availableTextWidth, font, 4);
  
  // Draw terms and conditions starting from top of second page
  let startY = 136; // Starting Y position
  const lineSpacing = 6; // Space between lines
  
  termsLines.forEach((line, index) => {
    if (line === '') {
      // Skip drawing empty lines but still account for spacing
      return;
    }
    
    secondPage.drawText(line, {
      x: leftMargin,
      y: startY - (index * lineSpacing),
      font: font,
      size: 4,
      color: rgb(0, 0, 0)
    });
  });

  // Add QR code to second page
  try {
    const qrCodePath = path.join(__dirname, "../../../templates/QR_Code.png");
    const qrCodeBytes = await fs.readFile(qrCodePath);
    
    // Embed PNG directly
    const qrCodeImage = await pdfDoc.embedPng(qrCodeBytes);
    
    // Draw the QR code image at specified position
    secondPage.drawImage(qrCodeImage, {
      x: 80,
      y: 188,
      width: 55,
      height: 55
    });
    
  } catch (error) {
    console.error("Error embedding QR code:", error);
  }
  
  const pdfBytes = await pdfDoc.save();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=id_card_${student.studentName}.pdf`);
  res.send(Buffer.from(pdfBytes));
});

export {
  registerStudent,
  getStudents,
  getStudentCount,
  getRecentsStudents,
  updateStudent,
  toggleStudentStatus,
  generateAdmissionForm,
  generateIdCard
};
