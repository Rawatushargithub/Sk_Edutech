import asyncHandler from "express-async-handler";
import Student from "../../Center_Backend/models/Student/Student_Detais.model.js";
import Course from "../../Center_Backend/models/Courses/Courses.models.js"
import  Franchise  from "../../Admin_Backend/models/franchise/franchise.models.js";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import nodemailer from "nodemailer";

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
export const loginStudent = asyncHandler(async (req, res) => {
  const { rollNumber, password } = req.body;

  try {
    // ✅ Validate required fields
    if (!rollNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Roll number and password are required",
        code: 'MISSING_CREDENTIALS'
      });
    }

    // ✅ Find student and explicitly select password field
    const student = await Student.findOne({ rollNumber: rollNumber }).select('+password');

// console.log("Student:", student);           // Should print full object
// console.log("Password:", student.password);

    // ✅ Check if student exists
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid roll number or password",
        code: 'INVALID_CREDENTIALS'
      });
    }

    // ✅ Check if account is active
    if (!student.status) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // console.log("Student name:", student.studentName);
    // console.log("Father husband name:", student.fatherHusbandName);
    console.log("Attempting login for roll number:", rollNumber);
    console.log("Provided password:", student.password);
    console.log("given password:", password);
    // ✅ Compare password using the schema method (recommended) or bcrypt directly
    const isPasswordMatch = await bcrypt.compare(password, student.password);
    console.log("bcrypt.compare result:", isPasswordMatch);
    // Alternative: const isPasswordMatch = await bcrypt.compare(password, student.password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid roll number or password",
        code: 'INVALID_CREDENTIALS'
      });
    }

    // ✅ Remove password from response
    const studentData = student.toObject();
    delete studentData.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      student: studentData,
      // token: token // Uncomment if using JWT
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      code: 'LOGIN_FAILED',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

    student.otp = otp;
    console.log("Generated OTP:", otp);
    student.otpExpiry = new Date(otpExpiry);
    await student.save();

    // ✅ Send email using nodemailer
    // const transporter = nodemailer.createTransport({
    //   service: "gmail", // Or use SMTP provider like SendGrid, Mailgun
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    // await transporter.sendMail({
    //   from: `"Student Support" <${process.env.EMAIL_USER}>`,
    //   to: email,
    //   subject: "Your OTP for Password Reset",
    //   text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    // });

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ✅ VERIFY OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student || !student.otp || !student.otpExpiry) {
      return res.status(400).json({ message: "OTP not found or expired." });
    }

    if (student.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (student.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// 🔐 RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  console.log("hashed passsword : ", newPassword);

  try {
    const student = await Student.findOne({ email }).select("+password");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log("New hashed password:", newPassword);
    student.password = newPassword;
    student.otp = null;
    student.otpExpiry = null;
    await student.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
// export const loginStudent = async (req, res) => {
//   try {
//       const { email, studentMobile } = req.body;

//       // Check if the student exists
//       const student = await Student.findOne({ email, studentMobile });

//       if (!student) {
//           return res.status(401).json({ message: "Invalid email or mobile number" });
//       }

//       res.status(200).json({
//           message: "Login successful",
//           student,  // ✅ Send full student object
//       });
//   } catch (error) {
//       console.error("Login error:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//   }
// };


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

// import Franchise from "../models/Franchise.mjs";

// import Franchise from "../models/Franchise.model.js";

export const getFranchiseLogo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching logo for franchise ID:", id);

    const franchise = await Franchise.findOne({ franchiseId: id });

    if (!franchise) {
      return res.status(404).json({ success: false, message: "Franchise not found" });
    }

    const logoUrl = franchise.instituteLogoUrl || franchise.ownerPhotoUrl;
    const phoneNumber = franchise.mobile;
    const Name = franchise.franchiseName;
    const email = franchise.email;
    const address = franchise.address;
    const state = franchise.state;
    const city = franchise.city;

    if (!logoUrl) {
      return res.status(404).json({ success: false, message: "Institute logo not available" });
    }

    return res.status(200).json({
      success: true,
      logoUrl, phoneNumber, Name, email, address, state, city,
      message: "Institute logo fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching institute logo:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching institute logo"
    });
  }
};

export const getStudentImage = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const decodedRollNumber = decodeURIComponent(rollNumber);
    console.log("Fetching image for student roll number:", rollNumber);

    const student = await Student.findOne({ rollNumber: rollNumber });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.studentPhoto) {
      return res.status(404).json({ message: "Student image not found" });
    }

    res.status(200).json({ imageUrl: student.studentPhoto });
  } catch (error) {
    console.error("Error fetching student image:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
};



