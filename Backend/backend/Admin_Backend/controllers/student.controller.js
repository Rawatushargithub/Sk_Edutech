import { asyncHandler } from "../utils/asynchanlder.js";
import Student from "../models/Student/Student_Details.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Franchise from "../models/franchise/franchise.models.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

// For ES modules, get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
    .populate({
      path: 'selectedBatch',
      select: 'batchName' // Only select the batchName field
    })
    .select(
      "studentPhoto studentName status franchiseId courseInterested studentMobile referralCode email rollNumber admissionDate selectedBatch"
    )
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

const generateAdmissionForm = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new ApiError(400, "Invalid student ID");
  }

  const student = await Student.findById(studentId)
    .populate("feeDetails")
    .populate({
      path: "selectedBatch",
      select: "batchName batchTiming",
    });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  let franchise;
  try {
    franchise = await Franchise.findOne({ franchiseId: student.franchiseId });
  } catch (error) {
    console.error("Error fetching franchise:", error);
  }

  const pdfPath = path.join(__dirname, "../../templates/blank_form.pdf");

  const existingPdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page = pdfDoc.getPages()[0];

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const size = 10;
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

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

  // Fetch and embed student photo (top right photo box)
  if (student.studentPhoto) {
    try {
      const photoUrl = student.studentPhoto;
      const photoResponse = await axios.get(photoUrl, {
        responseType: "arraybuffer",
      });
      const photoBytes = Buffer.from(photoResponse.data, "binary");
      let photoImage;
      if (photoUrl.includes(".jpg") || photoUrl.includes(".jpeg")) {
        photoImage = await pdfDoc.embedJpg(photoBytes);
      } else {
        photoImage = await pdfDoc.embedPng(photoBytes);
      }
      // Photo position in top right corner
      page.drawImage(photoImage, { x: 460, y: 625, width: 95, height: 110 });
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
      const signatureBytes = Buffer.from(signatureResponse.data, "binary");
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
        responseType: "arraybuffer",
      });
      const signatureBytes = Buffer.from(signatureResponse.data, "binary");

      let franchiseSignatureImage;
      if (
        franchiseSignatureUrl.includes(".jpg") ||
        franchiseSignatureUrl.includes(".jpeg")
      ) {
        franchiseSignatureImage = await pdfDoc.embedJpg(signatureBytes);
      } else {
        franchiseSignatureImage = await pdfDoc.embedPng(signatureBytes);
      }
      // Signature position in bottom right

      page.drawImage(franchiseSignatureImage, {
        x: 452,
        y: 109,
        width: 120,
        height: 40,
      });
    } catch (error) {
      console.error("Error fetching or embedding student signature:", error);
    }
  }

  // TOP SECTION - Header Information
  // Franchise Name
  if (franchise) {
    drawText(franchise.franchiseName, 24, 620, rgb(0, 0, 0), boldFont, 14);
  }

  // Franchise Logo
  if (franchise && franchise.franchiseLogoUrl) {
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
      // page.drawImage(logoImage, { x: 24, y: 640, width: 50, height: 50 });
      page.drawImage(logoImage, { x: 256, y: 709, width: 45, height: 45 });
    } catch (error) {
      console.error("Error fetching or embedding franchise logo:", error);
    }
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
    drawText(`Rs ${student.feeDetails.courseFees}`, 77, 238);

    // Paid Fees (after "PAID FEES :")
    drawText(`Rs ${student.feeDetails.feesReceived}`, 269, 238);

    // Balance Fees (after "BALANCE FEES :")
    drawText(`Rs ${student.feeDetails.balance}`, 455, 238);
  }

  // Contact Number (after "CONTACT NO. :")
  if (franchise) {
    drawText(franchise.mobile, 244, 74);
    drawText(franchise.address, 215, 48);
  }

  // // for director signn
  // instituteSignature
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

  const franchise = await Franchise.findOne({
    franchiseId: student.franchiseId,
  });
  if (!franchise) {
    throw new ApiError(404, "Franchise not found");
  }

  const pdfPath = path.join(__dirname, "../../templates/ID_TEMPLATE.pdf");
  const existingPdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page = pdfDoc.getPages()[0];

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const size = 6;

  const drawText = (
    text,
    x,
    y,
    color = rgb(0, 0, 0),
    textFont = font,
    textSize = size
  ) => {
    if (text) {
      page.drawText(String(text), {
        x,
        y,
        font: textFont,
        size: textSize,
        color,
      });
    }
  };

  // Fetch and embed student photo with perfect circular crop
  if (student.studentPhoto) {
    try {
      const photoUrl = student.studentPhoto;
      const photoResponse = await axios.get(photoUrl, {
        responseType: "arraybuffer",
      });
      const photoBytes = Buffer.from(photoResponse.data, "binary");

      // Create circular cropped image using Canvas with higher resolution
      const { createCanvas, loadImage } = await import("canvas");
      const radius = 31.25; // Increased by 0.25x (25 * 1.25 = 31.25)
      const diameter = radius * 2; // 62.5 units

      // Create high-resolution canvas (4x scale for crisp quality)
      const scale = 4;
      const canvasSize = diameter * scale;
      const canvas = createCanvas(canvasSize, canvasSize);
      const ctx = canvas.getContext("2d");

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Load the image
      const img = await loadImage(photoBytes);

      // Calculate dimensions for center cropping
      const size = Math.min(img.width, img.height);
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;

      // Create circular clipping path at high resolution
      ctx.beginPath();
      ctx.arc(
        canvasSize / 2,
        canvasSize / 2,
        canvasSize / 2,
        0,
        Math.PI * 2,
        true
      );
      ctx.closePath();
      ctx.clip();

      // Draw the image at high resolution (center cropped and scaled to fit)
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        size,
        size,
        0,
        0,
        canvasSize,
        canvasSize
      );

      // Convert canvas to PNG buffer
      const circularImageBuffer = canvas.toBuffer("image/png");

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
        height: diameter,
      });
    } catch (error) {
      console.error("Error fetching or embedding student photo:", error);
    }
  }

  // Helper function to capitalize text
  const capitalizeText = (text) => {
    if (!text) return "";
    return String(text).toUpperCase();
  };

  // Get both pages
  const firstPage = pdfDoc.getPages()[0];
  const secondPage = pdfDoc.getPages()[1];

  // Populate ID card fields on first page with capitalization
  drawText(
    capitalizeText(student.studentName),
    31,
    147,
    rgb(0, 0, 0),
    boldFont,
    10
  );
  drawText(student.rollNumber, 66, 83);
  drawText(capitalizeText(student.courseInterested?.courseCode || ""), 66, 108);
  drawText(
    student.admissionDate
      ? new Date(student.admissionDate).toLocaleDateString("en-GB")
      : "",
    66,
    134
  );
  drawText(
    capitalizeText(student.fatherHusbandName || student.motherName),
    66,
    120
  );
  drawText(student.studentMobile, 66, 96);

  drawText(franchise.address, 22, 15, rgb(1, 1, 1));
  // Add "M:" prefix to franchise mobile number
  drawText(`M: ${franchise.mobile}`, 75, 39);

  // 1. Place franchise name on first page (centered at 64,243)
  const franchiseName = capitalizeText(
    franchise.franchiseName || franchise.name || ""
  );
  firstPage.drawText(franchiseName, {
    x: 27,
    y: 234,
    font: boldFont,
    size: 10,
    color: rgb(1, 1, 1),
  });

  // 2. Place franchise name on second page (centered between 64,134 and 113,134)
  // const secondPageCenterX = (64 + 113) / 2; // Calculate center x position
  // const franchiseNameWidth = boldFont.widthOfTextAtSize(franchiseName, 8);
  // const secondPageStartX = secondPageCenterX - (franchiseNameWidth / 2); // Center the text

  secondPage.drawText(franchiseName, {
    x: 72,
    y: 134,
    font: boldFont,
    size: 4,
    color: rgb(0, 0, 0),
  });

  // 3. Add QR Code from template
  try {
    const qrCodePath = path.join(__dirname, "../../templates/QR_Code.png");
    const qrCodeBytes = await fs.readFile(qrCodePath);

    // Embed PNG directly
    const qrCodeImage = await pdfDoc.embedPng(qrCodeBytes);

    // Draw the QR code image at specified position
    secondPage.drawImage(qrCodeImage, {
      x: 80,
      y: 188,
      width: 55,
      height: 55,
    });
  } catch (error) {
    console.error("Error embedding QR code:", error);
  }

  const pdfBytes = await pdfDoc.save();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=id_card_${student.studentName}.pdf`
  );
  res.send(Buffer.from(pdfBytes));
});

export {
  getStudentCount,
  getRecentsStudents,
  getStudents,
  generateAdmissionForm,
  generateIdCard,
};
