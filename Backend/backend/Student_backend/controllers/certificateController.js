import Certificate from "../../Center_Backend/models/certificate.model.js";
import Student from "../models/Student.js";

// ✅ Request Certificate (Add to Certificate Collection)
export const requestCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch student details
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Check if the certificate request already exists
    const existingRequest = await Certificate.findOne({ student: id });
    if (existingRequest) return res.status(400).json({ message: "Certificate request already submitted" });

    // Create new certificate request
    const newCertificate = new Certificate({
      student: student._id,
      rollNumber: student.rollNumber,
      studentName: student.studentName,
      course: student.courseInterested,
      admissionDate: student.admissionDate,
      completionDate: student.completionDate || "N/A",
      percentage: student.percentage || null,
      grade: student.grade || "N/A",
      status: "pending",
    });

    await newCertificate.save();
    res.status(201).json({ message: "Certificate request submitted successfully" });

  } catch (error) {
    console.error("Error requesting certificate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get All Certificate Requests
export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Students with Certificate Status
export const getStudentsWithCertificates = async (req, res) => {
  try {
    const students = await Student.find();
    const certificates = await Certificate.find();

    // Map certificates by student ID for easy lookup
    const certificateMap = {};
    certificates.forEach(cert => {
      certificateMap[cert.student.toString()] = cert;
    });

    // Add certificate status to each student
    const studentData = students.map(student => {
      const certificate = certificateMap[student._id.toString()];
      return {
        ...student.toObject(),
        certificateRequested: !!certificate,
        requestStatus: certificate ? certificate.status : null
      };
    });

    res.json(studentData);
  } catch (error) {
    console.error("Error fetching students with certificate status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update Certificate Status (Admin Approval)
export const updateCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const certificate = await Certificate.findByIdAndUpdate(id, { status }, { new: true });
    if (!certificate) return res.status(404).json({ message: "Certificate request not found" });

    res.json({ message: `Certificate request ${status} successfully` });

  } catch (error) {
    console.error("Error updating certificate status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// import Franchise from '../models/Franchise.js'; // Your Mongoose model

// import Certificate from "../models/Certificate.js"; // Make sure path is correct

export const getCertificateDetails = async (req, res) => {
  const { franchiseId, courseCode, rollNumber } = req.body;

  if (!franchiseId || !courseCode || !rollNumber) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Step 1: Find certificate document by franchiseId
    const certificate = await Certificate.findOne({ franchiseId });

    if (!certificate) {
      return res.status(404).json({ message: "Certificate record not found for this franchise" });
    }

    // Step 2: Find the matching course by courseCode
    const course = certificate.courses.find(c => c.courseCode === courseCode);

    if (!course) {
      return res.status(404).json({ message: "Course not found in certificate data" });
    }

    // Step 3: Find the result by rollNumber
    const result = course.results.find(r => r.rollNumber === rollNumber);

    if (!result) {
      return res.status(404).json({ message: "Result not found for this roll number" });
    }

    // Step 4: Check if certificate is approved
    if (!result.isApproved) {
      return res.status(403).json({ message: "Certificate not approved yet" });
    }

    // Step 5: Return result details along with courseName and examId from course
    return res.status(200).json({
      studentName: result.studentName,
      fatherName: result.fatherName,
      rollNumber: result.rollNumber,
      courseName: course.courseName,    // <-- from course object
      examId: course.examId,            // <-- from course object
      session: result.session,
      instituteName: result.instituteName,
      percentage: result.percentage,
      grade: result.grade,
      certificateId: result.certificateId,
    });

  } catch (error) {
    console.error("Error fetching certificate details:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


