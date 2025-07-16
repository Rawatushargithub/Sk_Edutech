// controllers/certificate.controller.js
import Student from "../models/Student/Student_Detais.model.js";
import Exam from "../models/Exam.models.js";
import Course from "../models/Courses/Courses.models.js";
import Certificate from "../models/certificate.model.js";
import {Franchise} from "../../Admin_Backend/models/franchise/franchise.models.js";

export const fetchCertificateData = async (req, res) => {
  const { franchiseId, examId } = req.query;

  try {
    console.log("Fetching certificate data for franchise:", franchiseId, "exam:", examId);

    const exam = await Exam.findOne({ franchiseId: franchiseId, ExamID: examId });
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const course = await Course.findOne({ courseCode: exam.courseCode });
    if (!course) return res.status(404).json({ message: "Course not found" });

    console.log("Course found:", course.courseName);
    const institute = await Franchise.findOne({ franchiseId: franchiseId });

    console.log("institute name: ", institute.instituteName); 
    const instituteName = institute.franchiseName || "Institute Name Not Found";

    const resultsData = [];

    for (const result of exam.results) {
      const student = await Student.findOne({ rollNumber: result.rollNumber });
      if (!student) continue;

      const admissionYear = new Date(student.admissionDate).getFullYear();
      const session = `${admissionYear} - ${admissionYear + Number(course.courseDuration)}`;
      const percentage = (result.marksObtained / exam.totalMarks) * 100;

      let grade = "F";
      if (percentage >= 90) grade = "A";
      else if (percentage >= 80) grade = "B";
      else if (percentage >= 70) grade = "C";
      else if (percentage >= 60) grade = "D";

      resultsData.push({
        rollNumber: result.rollNumber,
        studentName: student.studentName,
        courseCode: course.courseCode,
        fatherName: `${student.relationType} ${student.surnameName}`,
        courseName: course.courseName,
        session,
        instituteName: instituteName || "",
        percentage: Math.round(percentage),
        grade,
        requestedStatus: "not_requested",
        isApproved: false
      });
    }

    // Check for existing certificate requests and merge status
    const certificate = await Certificate.findOne({ franchiseId: franchiseId });
    
    if (certificate) {
      const existingCourse = certificate.courses.find(c => 
        c.courseCode === course.courseCode && c.examId === exam.ExamID
      );
      
      if (existingCourse) {
        // Merge the request status from existing data
        resultsData.forEach(result => {
          const existingResult = existingCourse.results.find(r => 
            r.rollNumber.trim() === result.rollNumber.trim()
          );
          if (existingResult) {
            result.requestedStatus = existingResult.requestedStatus;
            result.isApproved = existingResult.isApproved;
          }
        });
      }
    }

    res.status(200).json({
      message: "Certificate data fetched successfully",
      data: resultsData
    });
  } catch (err) {
    console.error("Error in fetchCertificateData:", err);
    res.status(500).json({ message: "Error fetching certificate data", error: err.message });
  }
};

export const requestCertificate = async (req, res) => {
  const { franchiseId, courseCode, examId, results } = req.body;

  console.log("Requesting certificate for franchise:", franchiseId, "course:", courseCode, "exam:", examId);
  console.log("Received results array:", results);

  try {
    if (!franchiseId || !courseCode || !examId || !results || results.length === 0) {
      return res.status(400).json({ message: "Missing or incomplete request data." });
    }

    // Format each result with request status
    const formattedResults = results.map((r) => ({
      ...r,
      requestedStatus: "requested",
      isApproved: false,
    }));

    let certDoc = await Certificate.findOne({ franchiseId });

    if (!certDoc) {
      // First time certificate request for this franchise
      certDoc = new Certificate({
        franchiseId,
        courses: [
          {
            courseCode,
            courseName: results[0]?.courseName || "",
            examId,
            results: formattedResults,
          },
        ],
      });
    } else {
      // Check if the course+exam entry already exists
      const courseIndex = certDoc.courses.findIndex(
        (c) => c.courseCode === courseCode && c.examId === examId
      );

      if (courseIndex !== -1) {
        // Update existing course - merge new requests with existing ones
        const existingCourse = certDoc.courses[courseIndex];
        const updatedResults = [...existingCourse.results];

        for (const newResult of formattedResults) {
          const existingIndex = updatedResults.findIndex(
            (r) => r.rollNumber.trim() === newResult.rollNumber.trim()
          );

          if (existingIndex !== -1) {
            // Update existing result if not already approved
            if (!updatedResults[existingIndex].isApproved) {
              updatedResults[existingIndex] = {
                ...updatedResults[existingIndex],
                ...newResult,
                requestedStatus: "requested",
                isApproved: false
              };
            }
          } else {
            // Add new result
            updatedResults.push(newResult);
          }
        }

        certDoc.courses[courseIndex].results = updatedResults;
      } else {
        // Course entry doesn't exist — add new course
        certDoc.courses.push({
          courseCode,
          courseName: results[0]?.courseName || "",
          examId,
          results: formattedResults,
        });
      }
    }

    await certDoc.save();
    console.log("Certificate request saved for:", franchiseId);

    return res.status(201).json({ 
      message: "Certificate request submitted successfully.",
      success: true 
    });
  } catch (err) {
    console.error("Certificate request error:", err);
    return res.status(500).json({ 
      message: "Error requesting certificate", 
      error: err.message,
      success: false 
    });
  }
};

export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({});
    res.status(200).json(certificates);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all certificates", error: err.message });
  }
};

const extractStudentNumber = (rollNumber) => {
  const match = rollNumber.match(/(\d+)$/);
  return match ? match[1] : null;
};

export const approveStudentCertificate = async (req, res) => {
  const { franchiseId, courseCode, examId, rollNumber } = req.body;

  try {
    const certificate = await Certificate.findOne({ franchiseId });
    if (!certificate) return res.status(404).json({ message: "Certificate not found" });

    const course = certificate.courses.find(
      (c) => c.courseCode === courseCode && c.examId === examId
    );
    if (!course) return res.status(404).json({ message: "Course not found" });

    const studentResult = course.results.find((r) => r.rollNumber === rollNumber);
    if (!studentResult) return res.status(404).json({ message: "Student result not found" });

    const studentNumber = extractStudentNumber(rollNumber);
    if (!studentNumber) {
      return res.status(400).json({ message: "Invalid roll number format" });
    }

    const certificateId = `${franchiseId}${studentNumber}`;

    studentResult.certificateId = certificateId;
    studentResult.isApproved = true;
    studentResult.requestedStatus = "approved";

    await certificate.save();

    res.status(200).json({
      message: "Student certificate approved successfully",
      certificateId,
      success: true
    });
  } catch (err) {
    console.error("Error approving student certificate:", err);
    return res.status(500).json({
      message: "Error approving student certificate",
      error: err.message,
      success: false
    });
  }
};

// export const approveStudentCertificate = async (req, res) => {
//   const { franchiseId, courseCode, examId, rollNumber } = req.body;

//   try {
//     const certificate = await Certificate.findOne({ franchiseId });
//     if (!certificate) return res.status(404).json({ message: "Certificate not found" });

//     const course = certificate.courses.find(
//       (c) => c.courseCode === courseCode && c.examId === examId
//     );
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     const studentResult = course.results.find((r) => r.rollNumber === rollNumber);
//     if (!studentResult) return res.status(404).json({ message: "Student result not found" });

//     // Update both fields for consistency
//     studentResult.isApproved = true;
//     studentResult.requestedStatus = "approved";
    
//     await certificate.save();

//     res.status(200).json({ 
//       message: "Student certificate approved successfully",
//       success: true 
//     });
//   } catch (err) {
//     console.error("Error approving student certificate:", err);
//     res.status(500).json({ 
//       message: "Error approving student certificate", 
//       error: err.message,
//       success: false 
//     });
//   }
// };

export const checkCertificateStatus = async (req, res) => {
  const { franchiseId, examId, courseCode } = req.query;

  try {
    const cert = await Certificate.findOne({ franchiseId });

    if (!cert) return res.json({ status: "not_requested" });

    const course = cert.courses.find(
      (c) => c.examId === examId && c.courseCode === courseCode
    );

    if (!course) return res.json({ status: "not_requested" });

    const allApproved = course.results.length > 0 && course.results.every(r => r.isApproved);
    const allRequested = course.results.length > 0 && course.results.every(r => 
      r.requestedStatus === "requested" || r.isApproved
    );

    if (allApproved) {
      return res.json({ status: "approved" });
    } else if (allRequested) {
      return res.json({ status: "requested" });
    }

    return res.json({ status: "partial" });

  } catch (err) {
    console.error("Certificate status check error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add these new controller functions to your existing certificate.controller.js

// Get all active franchises
export const getActiveFranchises = async (req, res) => {
  try {
    const franchises = await Franchise.find({ status: "Active" }).select('franchiseId franchiseName');
    res.status(200).json(franchises);
  } catch (err) {
    res.status(500).json({ message: "Error fetching franchises", error: err.message });
  }
};

// Get requested certificates with optional franchise filter
export const getRequestedCertificates = async (req, res) => {
  try {
    const { franchiseId } = req.query;
    
    let query = {};
    if (franchiseId) {
      query.franchiseId = franchiseId;
    }

    const certificates = await Certificate.find(query);
    
    // Filter to only show courses and students with requested status
    const requestedCertificates = certificates.map(cert => ({
      ...cert.toObject(),
      courses: cert.courses.map(course => ({
        ...course.toObject(),
        results: course.results.filter(result => 
          result.requestedStatus === "requested" && !result.isApproved
        )
      })).filter(course => course.results.length > 0) // Only include courses with requested results
    })).filter(cert => cert.courses.length > 0); // Only include certificates with requested courses

    res.status(200).json(requestedCertificates);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requested certificates", error: err.message });
  }
};

// Get approved certificates with optional franchise filter
export const getApprovedCertificates = async (req, res) => {
  try {
    const { franchiseId } = req.query;
    
    let query = {};
    if (franchiseId) {
      query.franchiseId = franchiseId;
    }

    const certificates = await Certificate.find(query);
    
    // Filter to only show courses and students with approved status
    const approvedCertificates = certificates.map(cert => ({
      ...cert.toObject(),
      courses: cert.courses.map(course => ({
        ...course.toObject(),
        results: course.results.filter(result => result.isApproved)
      })).filter(course => course.results.length > 0) // Only include courses with approved results
    })).filter(cert => cert.courses.length > 0); // Only include certificates with approved courses

    res.status(200).json(approvedCertificates);
  } catch (err) {
    res.status(500).json({ message: "Error fetching approved certificates", error: err.message });
  }
};
// import Student from "../models/Student/Student_Detais.model.js";
// import Exam from "../models/Exam.models.js";
// import Course from "../models/Courses/Courses.models.js";
// import Certificate from "../models/certificate.model.js";
// import {Franchise} from "../../Admin_Backend/models/franchise/franchise.models.js";


// export const fetchCertificateData = async (req, res) => {
//   const { franchiseId, examId } = req.query;

//   try {
//     console.log("Fetching certificate data for franchise:", franchiseId, "exam:", examId);

//     const exam = await Exam.findOne({ franchiseId: franchiseId, ExamID: examId });
//     if (!exam) return res.status(404).json({ message: "Exam not found" });

//     const course = await Course.findOne({ courseCode: exam.courseCode });
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     console.log("Course found:", course.courseName);
//     const institute = await Franchise.findOne({ franchiseId: franchiseId });

//     console.log("institute name: ", institute.instituteName); 
//      const instituteName = institute.franchiseName || "Institute Name Not Found";

    
//     const resultsData = [];

//     for (const result of exam.results) {
//       const student = await Student.findOne({ rollNumber: result.rollNumber });
//       if (!student) continue;

//     //   console.log("admission date", student.admissionDate);
//       const admissionYear = new Date(student.admissionDate).getFullYear();
//     //   console.log("admission year", admissionYear);
//       const session = `${admissionYear} - ${admissionYear + Number(course.courseDuration)}`;
//       const percentage = (result.marksObtained / exam.totalMarks) * 100;
//     //   console.log("Calculated percentage:", percentage);

//       let grade = "F";
//       if (percentage >= 90) grade = "A";
//       else if (percentage >= 80) grade = "B";
//       else if (percentage >= 70) grade = "C";
//       else if (percentage >= 60) grade = "D";

//       resultsData.push({
//         rollNumber: result.rollNumber,
//         studentName: student.studentName,
//         courseCode: course.courseCode,
//         fatherName: `${student.relationType} ${student.surnameName}`,
//         courseName: course.courseName,
//         session,
//         instituteName: instituteName || "",
//         percentage: Math.round(percentage),
//         grade,
//       });
//     }

//     // Step 1: Check for existing Certificate
//     let certificate = await Certificate.findOne({ franchiseId: franchiseId });

//     if (!certificate) {
//       // Create new certificate
//       certificate = new Certificate({
//         franchiseId,
//         courses: [{
//           courseCode: course.courseCode,
//           courseName: course.courseName,
//           examId: exam.ExamID,
//           results: resultsData
//         }]
//       });
//     } else {
//       // Check if course already exists
//       const existingCourse = certificate.courses.find(c => c.courseCode === course.courseCode && c.examId === exam.ExamID);

//       if (existingCourse) {
//         // Overwrite results for now, or you can merge/update as per logic
//         existingCourse.results = resultsData;
//       } else {
//         // Push new course entry
//         certificate.courses.push({
//           courseCode: course.courseCode,
//           courseName: course.courseName,
//           examId: exam.ExamID,
//           results: resultsData
//         });
//       }
//     }

//     await certificate.save();

//     res.status(200).json({
//       message: "Certificate data fetched and stored successfully",
//       data: resultsData
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching certificate data", error: err.message });
//   }
// };


// // Request certificate (save to DB)
// // controllers/certificate.controller.js

// // import Certificate from "../models/certificate.model.js";

// export const requestCertificate = async (req, res) => {
//   const { franchiseId, courseCode, examId, results } = req.body;

//   console.log("Requesting certificate for franchise:", franchiseId, "course:", courseCode, "exam:", examId);
//   console.log("Received results array:", results);

//   try {
//     if (!franchiseId || !courseCode || !examId || !results || results.length === 0) {
//       return res.status(400).json({ message: "Missing or incomplete request data." });
//     }

//     // Format each result with default request status
//     const formattedResults = results.map((r) => ({
//       ...r,
//       requestedStatus: "requested",
//       isApproved: false,
//     }));

//     let certDoc = await Certificate.findOne({ franchiseId });

//     if (!certDoc) {
//       // First time certificate request for this franchise
//       certDoc = new Certificate({
//         franchiseId,
//         courses: [
//           {
//             courseCode,
//             courseName: results[0]?.courseName || "",
//             examId,
//             results: formattedResults,
//           },
//         ],
//       });
//     } else {
//       // Check if the course+exam entry already exists
//       const courseIndex = certDoc.courses.findIndex(
//         (c) => c.courseCode === courseCode && c.examId === examId
//       );

//       if (courseIndex !== -1) {
//         // Update or append new students into existing course
//         const existingCourse = certDoc.courses[courseIndex];

//         for (const newResult of formattedResults) {
//           const exists = existingCourse.results.find(
//             (r) => r.rollNumber.trim() === newResult.rollNumber.trim()
//           );

//           if (exists) {
//             return res.status(400).json({
//               message: `Certificate already requested for Roll Number ${newResult.rollNumber}.`,
//             });
//           }

//           existingCourse.results.push(newResult);
//         }
//       } else {
//         // Course entry doesn't exist — add new course
//         certDoc.courses.push({
//           courseCode,
//           courseName: results[0]?.courseName || "",
//           examId,
//           results: formattedResults,
//         });
//       }
//     }

//     await certDoc.save();
//     console.log("Certificate request saved for:", franchiseId);

//     return res
//       .status(201)
//       .json({ message: "Certificate request submitted successfully." });
//   } catch (err) {
//     console.error("Certificate request error:", err);
//     return res
//       .status(500)
//       .json({ message: "Error requesting certificate", error: err.message });
//   }
// };




// // Get all certificate requests (Admin side)
// export const getAllCertificates = async (req, res) => {
//   try {
//     const certificates = await Certificate.find({});
//     res.status(200).json(certificates);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching all certificates", error: err.message });
//   }
// };


// export const approveStudentCertificate = async (req, res) => {
//   const { franchiseId, courseCode, examId, rollNumber } = req.body;

//   try {
//     const certificate = await Certificate.findOne({ franchiseId });
//     if (!certificate) return res.status(404).json({ message: "Certificate not found" });

//     const course = certificate.courses.find(
//       (c) => c.courseCode === courseCode && c.examId === examId
//     );
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     const studentResult = course.results.find((r) => r.rollNumber === rollNumber);
//     if (!studentResult) return res.status(404).json({ message: "Student result not found" });

//     studentResult.isApproved = true;
//     await certificate.save();

//     res.status(200).json({ message: "Student certificate approved" });
//   } catch (err) {
//     res.status(500).json({ message: "Error approving student certificate", error: err.message });
//   }
// };

// export const checkCertificateStatus = async (req, res) => {
//   const { franchiseId, examId, courseCode } = req.query;

//   try {
//     const cert = await Certificate.findOne({ franchiseId });

//     if (!cert) return res.json({ status: "not_requested" });

//     const course = cert.courses.find(
//       (c) => c.examId === examId && c.courseCode === courseCode
//     );

//     if (!course) return res.json({ status: "not_requested" });

//     const allApproved = course.results.length > 0 && course.results.every(r => r.isApproved);
//     if (allApproved) {
//       return res.json({ status: "approved" });
//     }

//     return res.json({ status: "requested" });

//   } catch (err) {
//     console.error("Certificate status check error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
