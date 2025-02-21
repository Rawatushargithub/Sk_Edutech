import { asyncHandler } from "../utils/asynchanlder.js";
import Student_DetaisModel from "../models/Student_Detais.model.js";
import {ApiError} from "../utils/ApiError.js"; 
import {ApiResponse} from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 

const registerStudent = asyncHandler(async (req, res) => {
    const {
        rollNumber, studentName, relationType, fatherHusbandName, surnameName,
        motherName, courseInterested, studentMobile, alternateMobile,
        email, dob, gender, city, postCode, permanentAddress,
        referralCode, caste, qualifications, occupation,
        admissionDate, displayAdmissionOptions
    } = req.body;

    // Validate required fields
    // if ([rollNumber, studentName, relationType, courseInterested, studentMobile, dob, gender, admissionDate].some(field => !field?.trim())) {
    //     throw new ApiError(400, "All required fields must be provided");
    // }
    

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

    // Create student record in DB
    const student = await Student_DetaisModel.create({
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
        displayAdmissionOptions: displayAdmissionOptions || false
    });

    if (!student) {
        throw new ApiError(500, "Something went wrong while registering the student");
    }

    return res.status(201).json(new ApiResponse(201, student, "Student registered successfully"));
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
            { studentName: { $regex: searchTerm, $options: 'i' } },
            { studentMobile: { $regex: searchTerm, $options: 'i' } },
            { rollNumber: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } }
        ];
    }

    // Query database with projections for only the fields we need
    const students = await Student_DetaisModel.find(filter)
        .select("studentPhoto studentName courseInterested studentMobile referralCode  admissionDate")
        .skip(skip)
        .limit(limit)
        .sort({ admissionDate: -1 }); // Sort by admission date, newest first

    // Get total count for pagination
    const totalStudents = await Student_DetaisModel.countDocuments(filter);

    // Check if students were found
    if (!students || students.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No students found with the given criteria")
        );
    }

    // Return the student data
    return res.status(200).json(
        new ApiResponse(200, 
            students,
            // pagination: {
            //     total: totalStudents,
            //     page,
            //     limit,
            //     pages: Math.ceil(totalStudents / limit)
            // }
         "Students fetched successfully")
    );
});

export { registerStudent , getStudents };
